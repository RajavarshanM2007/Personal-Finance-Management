'use strict';

const { Router } = require('express');
const { db } = require('../db');

const router = Router();


// GET all goals for logged-in user
router.get('/', (req, res) => {
    try {
        const user_id = req.headers['x-user-id'];

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required.'
            });
        }

        const goals = db.prepare(`
            SELECT *
            FROM goals
            WHERE user_id = ?
            ORDER BY id ASC
        `).all(user_id);

        res.json({
            success: true,
            data: goals
        });

    } catch (error) {
        console.error('[Goals GET Error]', error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// ADD goal
router.post('/', (req, res) => {
    try {
        const user_id = req.headers['x-user-id'];

        const {
            name,
            current = 0,
            target = 0,
            targetDate = '',
            color = ''
        } = req.body;

        if (!user_id || !name) {
            return res.status(400).json({
                success: false,
                message: 'User ID and goal name are required.'
            });
        }

        const result = db.prepare(`
            INSERT INTO goals
            (user_id, name, current, target, targetDate, color)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            user_id,
            name,
            Number(current) || 0,
            Number(target) || 0,
            targetDate,
            color
        );

        const goal = db.prepare(`
            SELECT *
            FROM goals
            WHERE id = ? AND user_id = ?
        `).get(result.lastInsertRowid, user_id);

        res.status(201).json({
            success: true,
            data: goal
        });

    } catch (error) {
        console.error('[Goals POST Error]', error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// UPDATE goal
router.put('/:id', (req, res) => {
    try {
        const user_id = req.headers['x-user-id'];
        const { id } = req.params;

        const {
            name,
            current = 0,
            target = 0,
            targetDate = '',
            color = ''
        } = req.body;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required.'
            });
        }

        const result = db.prepare(`
            UPDATE goals
            SET
                name = ?,
                current = ?,
                target = ?,
                targetDate = ?,
                color = ?
            WHERE id = ? AND user_id = ?
        `).run(
            name,
            Number(current) || 0,
            Number(target) || 0,
            targetDate,
            color,
            id,
            user_id
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Goal not found.'
            });
        }

        const goal = db.prepare(`
            SELECT *
            FROM goals
            WHERE id = ? AND user_id = ?
        `).get(id, user_id);

        res.json({
            success: true,
            data: goal
        });

    } catch (error) {
        console.error('[Goals PUT Error]', error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// DELETE goal
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
            DELETE FROM goals
            WHERE id = ? AND user_id = ?
        `).run(id, user_id);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Goal not found.'
            });
        }

        res.json({
            success: true,
            message: 'Goal deleted successfully.'
        });

    } catch (error) {
        console.error('[Goals DELETE Error]', error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


module.exports = router;