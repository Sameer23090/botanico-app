const express = require('express');
const { body, validationResult } = require('express-validator');
const dbQueries = require('../db/dbQueries');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/reminders ─────────────────────────────────────────────────────
// Get all pending reminders for the user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const reminders = await dbQueries.reminders.findActiveByUserId(req.user.id);
    res.json({ reminders });
  } catch (error) {
    console.error('Fetch reminders error:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// ─── POST /api/reminders ────────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const reminder = await dbQueries.reminders.create({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json({ message: 'Reminder set successfully', reminder });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// ─── PATCH /api/reminders/:id/complete ──────────────────────────────────────
router.patch('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const reminder = await dbQueries.reminders.findById(req.params.id);
    if (!reminder || reminder.userId !== req.user.id) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    const updated = await dbQueries.reminders.update(req.params.id, {
      isCompleted: true,
      completedAt: new Date()
    });

    res.json({ message: 'Task marked as completed', reminder: updated });
  } catch (error) {
    console.error('Complete reminder error:', error);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

module.exports = router;
