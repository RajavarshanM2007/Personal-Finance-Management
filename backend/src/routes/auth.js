'use strict';

const { Router } = require('express');
const { createUser } = require('../db');

const router = Router();

const otpStore = new Map();

/*
 * Generate a random 6-digit OTP
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

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone).trim();

    if (!cleanEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid email address.',
      });
    }

    if (!cleanPhone) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid phone number.',
      });
    }

    const otp = generateOTP();

    /*
     * Store OTP for 5 minutes
     */
    otpStore.set(cleanEmail, {
      name: cleanName,
      phone: cleanPhone,
      otp: otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    /*
     * DIAGNOSTIC CHECK
     * This does NOT print the actual API key.
     */
    console.log(
      '[auth] BREVO_API_KEY loaded:',
      !!process.env.BREVO_API_KEY,
      'length:',
      process.env.BREVO_API_KEY
        ? process.env.BREVO_API_KEY.length
        : 0
    );

    console.log(
      '[auth] BREVO_SENDER_EMAIL:',
      process.env.BREVO_SENDER_EMAIL || 'MISSING'
    );

    /*
     * Check Brevo configuration
     */
    if (!process.env.BREVO_API_KEY) {
      console.error('[auth] BREVO_API_KEY is missing');

      otpStore.delete(cleanEmail);

      return res.status(500).json({
        success: false,
        message: 'Email service is not configured.',
      });
    }

    if (!process.env.BREVO_SENDER_EMAIL) {
      console.error('[auth] BREVO_SENDER_EMAIL is missing');

      otpStore.delete(cleanEmail);

      return res.status(500).json({
        success: false,
        message: 'Email sender is not configured.',
      });
    }

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
            <!DOCTYPE html>
            <html>
              <body style="
                margin: 0;
                padding: 30px;
                background: #f5f5f5;
                font-family: Arial, sans-serif;
              ">

                <div style="
                  max-width: 550px;
                  margin: auto;
                  background: white;
                  padding: 30px;
                  border-radius: 12px;
                  border: 1px solid #ddd;
                ">

                  <h2 style="margin-top: 0;">
                    FinTrack Login Verification
                  </h2>

                  <p>
                    Hello ${cleanName},
                  </p>

                  <p>
                    Your FinTrack login verification code is:
                  </p>

                  <div style="
                    text-align: center;
                    margin: 30px 0;
                  ">

                    <span style="
                      display: inline-block;
                      padding: 15px 25px;
                      background: #f1f1f1;
                      border-radius: 8px;
                      font-size: 32px;
                      font-weight: bold;
                      letter-spacing: 8px;
                    ">
                      ${otp}
                    </span>

                  </div>

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

              </body>
            </html>
          `,
        }),
      }
    );

    let brevoData = {};

    try {
      brevoData = await brevoResponse.json();
    } catch {
      brevoData = {};
    }

    /*
     * Brevo rejected the request
     */
    if (!brevoResponse.ok) {
      console.error(
        '[auth] Brevo API error:',
        brevoResponse.status,
        brevoData
      );

      otpStore.delete(cleanEmail);

      return res.status(500).json({
        success: false,
        message:
          brevoData.message ||
          'Brevo failed to send the OTP email.',
      });
    }

    /*
     * Email accepted by Brevo
     */
    console.log(
      `[auth] OTP sent successfully to ${cleanEmail}`
    );

    console.log(
      `[auth] Brevo message ID: ${
        brevoData.messageId || 'received'
      }`
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

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone).trim();
    const cleanOTP = String(otp).trim();

    const stored = otpStore.get(cleanEmail);

    if (!stored) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Please request a new OTP.',
      });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(cleanEmail);

      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new OTP.',
      });
    }

    if (stored.phone !== cleanPhone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number does not match.',
      });
    }

    if (stored.otp !== cleanOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP.',
      });
    }

    /*
     * OTP is correct.
     * Create/find the actual user.
     */
    const user = createUser(
      stored.name,
      cleanEmail,
      stored.phone
    );

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