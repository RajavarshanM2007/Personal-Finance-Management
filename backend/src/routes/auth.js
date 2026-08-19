'use strict';

const { Router } = require('express');
const nodemailer = require('nodemailer');
const { createUser } = require('../db');

const router = Router();

const otpStore = new Map();

/*
 * Gmail SMTP configuration
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

    const otp = generateOTP();

    otpStore.set(email, {
      name,
      phone,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'FinTrack Login OTP',
      text: `Your FinTrack login OTP is ${otp}. It is valid for 5 minutes.`,
    });

    console.log(`[auth] OTP sent to ${email}`);

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

    const stored = otpStore.get(email);

    if (!stored) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Please request a new OTP.',
      });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);

      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new OTP.',
      });
    }

    if (stored.phone !== phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number does not match.',
      });
    }

    if (stored.otp !== otp) {
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
      email,
      stored.phone
    );

    otpStore.delete(email);

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