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


// Reset logged-in user's data
app.post('/api/reset', (req, res) => {
    try {
        const user_id = req.headers['x-user-id'];

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required.'
            });
        }

        resetUserData(user_id);

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
app.use((error, req, res, next) => {
    console.error('[Error]', error);

    res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
    });
});


const PORT = process.env.PORT || 5000;

initDb();

app.listen(PORT, () => {
    console.log(`FinTrack backend is running on port ${PORT}`);
});