'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDb, resetUserData } = require('./db');

const transactionsRouter = require('./routes/transactions');
const budgetsRouter = require('./routes/budgets');
const goalsRouter = require('./routes/goals');
const settingsRouter = require('./routes/settings');
const authRouter = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());


// Get user ID from frontend header
app.use((req, res, next) => {
  const userId = req.headers['x-user-id'];

  if (userId) {
    req.user_id = Number(userId);

    // For GET requests
    req.query.user_id = userId;

    // For POST/PUT requests
    if (req.body && typeof req.body === 'object') {
      req.body.user_id = Number(userId);
    }
  }

  next();
});


// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FinTrack backend is running'
  });
});


// Routes
app.use('/api/transactions', transactionsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/auth', authRouter);


// Reset current user's data
app.post('/api/reset', (req, res) => {
  try {
    const userId = req.user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required.'
      });
    }

    resetUserData(userId);

    res.json({
      success: true,
      message: 'User data reset successfully.'
    });

  } catch (error) {
    console.error('[Reset Error]', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});


// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err);

  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});


// Start server
const PORT = process.env.PORT || 5000;

initDb();

app.listen(PORT, () => {
  console.log(`FinTrack backend is running on port ${PORT}`);
});