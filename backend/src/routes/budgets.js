'use strict';

const { Router } = require('express');
const { db } = require('../db');

const router = Router();

// GET all budgets for logged-in user
router.get('/', (req, res) => {
  try {
    const user_id = req.headers['x-user-id'];

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required.'
      });
    }

    const budgets = db.prepare(`
      SELECT *
      FROM budgets
      WHERE user_id = ?
      ORDER BY id ASC
    `).all(user_id);

    res.json({
      success: true,
      data: budgets
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// ADD budget
router.post('/', (req, res) => {
  try {
    const user_id = req.headers['x-user-id'];
    const { category, limit } = req.body;

    if (!user_id || !category || limit === undefined) {
      return res.status(400).json({
        success: false,
        message: 'User ID, category and limit are required.'
      });
    }

    const result = db.prepare(`
      INSERT INTO budgets (user_id, category, budget_limit)
      VALUES (?, ?, ?)
    `).run(user_id, category, limit);

    const budget = db.prepare(`
      SELECT *
      FROM budgets
      WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      data: budget
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// UPDATE budget
router.put('/:id', (req, res) => {
  try {
    const user_id = req.headers['x-user-id'];
    const { id } = req.params;
    const { category, limit } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required.'
      });
    }

    const result = db.prepare(`
      UPDATE budgets
      SET category = ?, budget_limit = ?
      WHERE id = ? AND user_id = ?
    `).run(category, limit, id, user_id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found.'
      });
    }

    const budget = db.prepare(`
      SELECT *
      FROM budgets
      WHERE id = ? AND user_id = ?
    `).get(id, user_id);

    res.json({
      success: true,
      data: budget
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// DELETE budget
router.delete('/:id', (req, res) => {
  try {
    const user_id = req.headers['x-user-id'];
    const { id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required.'
      });
    }

    const result = db.prepare(`
      DELETE FROM budgets
      WHERE id = ? AND user_id = ?
    `).run(id, user_id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found.'
      });
    }

    res.json({
      success: true,
      message: 'Budget deleted successfully.'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


module.exports = router;