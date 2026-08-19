'use strict';

const { Router } = require('express');
const { db } = require('../db');

const router = Router();


// ── GET /api/settings ────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const user_id = req.headers["x-user-id"];

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required.',
      });
    }

    const row = db
      .prepare(`
        SELECT *
        FROM settings
        WHERE user_id = ?
      `)
      .get(user_id);

    if (!row) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found.',
      });
    }

    res.json({
      success: true,
      data: {
        ...row,
        darkTheme: Boolean(row.darkTheme),
        budgetAlerts: Boolean(row.budgetAlerts),
        paymentReminders: Boolean(row.paymentReminders),
      },
    });
  } catch (err) {
    console.error('[Settings GET Error]', err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


// ── PUT /api/settings ────────────────────────────────────────────────────
router.put('/', (req, res) => {
      try {
        const {
        name,
        email,
        currency,
        darkTheme,
        budgetAlerts,
        paymentReminders
    } = req.body;

    const user_id = req.headers["x-user-id"];

    if (!user_id || !name || !email || !currency) {
      return res.status(400).json({
        success: false,
        message:
          'user_id, name, email, and currency are required.',
      });
    }

    const existing = db
      .prepare(`
        SELECT user_id
        FROM settings
        WHERE user_id = ?
      `)
      .get(user_id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found for this user.',
      });
    }

    db.prepare(`
      UPDATE settings
      SET
        name = @name,
        email = @email,
        currency = @currency,
        darkTheme = @darkTheme,
        budgetAlerts = @budgetAlerts,
        paymentReminders = @paymentReminders
      WHERE user_id = @user_id
    `).run({
      user_id,
      name,
      email,
      currency,
      darkTheme: darkTheme ? 1 : 0,
      budgetAlerts: budgetAlerts ? 1 : 0,
      paymentReminders: paymentReminders ? 1 : 0,
    });

    const updated = db
      .prepare(`
        SELECT *
        FROM settings
        WHERE user_id = ?
      `)
      .get(user_id);

    res.json({
      success: true,
      data: {
        ...updated,
        darkTheme: Boolean(updated.darkTheme),
        budgetAlerts: Boolean(updated.budgetAlerts),
        paymentReminders: Boolean(updated.paymentReminders),
      },
    });
  } catch (err) {
    console.error('[Settings PUT Error]', err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


module.exports = router;