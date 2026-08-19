'use strict';

const { Router } = require('express');
const { db } = require('../db');

const router = Router();

// ── GET /api/transactions ────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const user_id = req.headers["x-user-id"];

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required.',
      });
    }

    const rows = db
      .prepare(`
        SELECT *
        FROM transactions
        WHERE user_id = ?
        ORDER BY date DESC
      `)
      .all(user_id);

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error('[Transactions GET Error]', err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


// ── POST /api/transactions ───────────────────────────────────────────────
router.post('/', (req, res) => {
  try {
    const {
      user_id,
      note,
      category,
      date,
      type,
      amount,
      recurring,
      mark,
    } = req.body;

    if (
      !user_id ||
      !note ||
      !category ||
      !date ||
      !type ||
      amount === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'user_id, note, category, date, type, and amount are required.',
      });
    }

    if (!['Income', 'Expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'type must be "Income" or "Expense".',
      });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'amount must be a positive number.',
      });
    }

    // Make sure user actually exists
    const user = db
      .prepare('SELECT id FROM users WHERE id = ?')
      .get(user_id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const stmt = db.prepare(`
      INSERT INTO transactions
      (
        user_id,
        note,
        category,
        date,
        type,
        amount,
        recurring,
        mark
      )
      VALUES
      (
        @user_id,
        @note,
        @category,
        @date,
        @type,
        @amount,
        @recurring,
        @mark
      )
    `);

    const result = stmt.run({
      user_id,
      note,
      category,
      date,
      type,
      amount,
      recurring: recurring ? 1 : 0,
      mark: mark || '',
    });

    const created = db
      .prepare(`
        SELECT *
        FROM transactions
        WHERE id = ?
          AND user_id = ?
      `)
      .get(result.lastInsertRowid, user_id);

    res.status(201).json({
      success: true,
      data: created,
    });
  } catch (err) {
    console.error('[Transactions POST Error]', err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


// ── DELETE /api/transactions/:id ─────────────────────────────────────────
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required.',
      });
    }

    // Only find the transaction if it belongs to this user
    const existing = db
      .prepare(`
        SELECT id
        FROM transactions
        WHERE id = ?
          AND user_id = ?
      `)
      .get(id, user_id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Transaction with id ${id} not found.`,
      });
    }

    db.prepare(`
      DELETE FROM transactions
      WHERE id = ?
        AND user_id = ?
    `).run(id, user_id);

    res.json({
      success: true,
      message: 'Transaction deleted successfully.',
    });
  } catch (err) {
    console.error('[Transactions DELETE Error]', err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


module.exports = router;