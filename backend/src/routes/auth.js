'use strict';

const { Router } = require('express');
const { createUser } = require('../db');

const router = Router();

const otpStore = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/*
 * SEND OTP
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and phone number are required.',
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    const otp = generateOTP();

    // Store OTP for 5 minutes
    otpStore.set(cleanEmail, {
      name: cleanName,
      phone: cleanPhone,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    /*
     * Send email using Resend API
     */
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'FinTrack <onboarding@resend.dev>',
        to: [cleanEmail],
        subject: 'FinTrack Login OTP',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>FinTrack Login Verification</h2>

            <p>Hello ${cleanName},</p>

            <p>Your FinTrack login OTP is:</p>

            <h1 style="letter-spacing: 6px;">
              ${otp}
            </h1>

            <p>
              This OTP is valid for <strong>5 minutes</strong>.
            </p>

            <p>
              If you did not request this OTP, you can safely ignore this email.
            </p>

            <br>

            <p>Regards,<br>FinTrack</p>
          </div>
        `,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('[auth] Resend API error:', resendData);

      // Remove OTP if email was not sent
      otpStore.delete(cleanEmail);

      return res.status(500).json({
        success: false,
        message: resendData.message || 'Failed to send OTP email.',
      });
    }

    console.log(`[auth] OTP sent to ${cleanEmail}`);

    return res.json({
      success: true,
      message: 'OTP sent successfully.',
    });

  } catch (error) {
    console.error('[auth] Send OTP error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP.',
    });
  }
});


/*
 * VERIFY OTP
 */
router.post('/verify-otp', (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    if (!email || !phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email, phone number and OTP are required.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    const stored = otpStore.get(cleanEmail);

    if (!stored) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Please request a new OTP.',
      });
    }

    // Check expiration
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(cleanEmail);

      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new OTP.',
      });
    }

    // Check phone
    if (stored.phone !== cleanPhone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number does not match.',
      });
    }

    // Check OTP
    if (stored.otp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP.',
      });
    }

    /*
     * Create or find the actual user
     */
    const user = createUser(
      stored.name,
      cleanEmail,
      stored.phone
    );

    // OTP can no longer be reused
    otpStore.delete(cleanEmail);

    return res.json({
      success: true,
      message: 'Login successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (error) {
    console.error('[auth] Verify OTP error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to verify OTP.',
    });
  }
});


module.exports = router;