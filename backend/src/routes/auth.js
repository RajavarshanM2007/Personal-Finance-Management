'use strict';

const { Router } = require('express');
const { createUser } = require('../db');

const router = Router();

const otpStore = new Map();

/*
 * Generate 6-digit OTP
 */
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

    /*
     * Store OTP for 5 minutes
     */
    otpStore.set(cleanEmail, {
      name: cleanName,
      phone: cleanPhone,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    /*
     * Send email using Brevo HTTP API
     */
    const brevoResponse = await fetch(
      'https://api.brevo.com/v3/smtp/email',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
        },

        body: JSON.stringify({
          sender: {
            name: 'FinTrack',
            email: process.env.BREVO_SENDER_EMAIL,
          },

          to: [
            {
              email: cleanEmail,
              name: cleanName,
            },
          ],

          subject: 'FinTrack Login OTP',

          htmlContent: `
            <div style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: auto;
              padding: 30px;
              border: 1px solid #ddd;
              border-radius: 12px;
            ">

              <h2 style="color: #222;">
                FinTrack Login Verification
              </h2>

              <p>Hello ${cleanName},</p>

              <p>
                Your FinTrack login OTP is:
              </p>

              <h1 style="
                letter-spacing: 8px;
                font-size: 36px;
              ">
                ${otp}
              </h1>

              <p>
                This OTP is valid for
                <strong>5 minutes</strong>.
              </p>

              <p>
                If you did not request this OTP,
                you can safely ignore this email.
              </p>

              <br>

              <p>
                Regards,<br>
                <strong>FinTrack</strong>
              </p>

            </div>
          `,
        }),
      }
    );

    const brevoData = await brevoResponse.json();

    /*
     * Brevo rejected the email
     */
    if (!brevoResponse.ok) {
      console.error('[auth] Brevo API error:', brevoData);

      otpStore.delete(cleanEmail);

      return res.status(500).json({
        success: false,
        message:
          brevoData.message || 'Failed to send OTP email.',
      });
    }

    console.log(
      `[auth] OTP sent successfully to ${cleanEmail}`
    );

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
    const cleanOTP = otp.trim();

    const stored = otpStore.get(cleanEmail);

    /*
     * OTP does not exist
     */
    if (!stored) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Please request a new OTP.',
      });
    }

    /*
     * OTP expired
     */
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(cleanEmail);

      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new OTP.',
      });
    }

    /*
     * Check phone number
     */
    if (stored.phone !== cleanPhone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number does not match.',
      });
    }

    /*
     * Check OTP
     */
    if (stored.otp !== cleanOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP.',
      });
    }

    /*
     * Create/find actual user
     */
    const user = createUser(
      stored.name,
      cleanEmail,
      stored.phone
    );

    /*
     * Prevent OTP reuse
     */
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