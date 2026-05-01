const express = require('express');
const { body, validationResult } = require('express-validator');
const Reminder = require('../models/Reminder');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/reminders ─────────────────────────────────────────────────────
// Get all pending reminders for the user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const reminders = await Reminder.find({ 
      userId: req.user.id,
      isCompleted: false 
    }).populate('plantId', 'commonName displayId');

    res.json({ reminders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// ─── POST /api/reminders ────────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const reminder = await Reminder.create({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json({ message: 'Reminder set successfully', reminder });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// ─── PATCH /api/reminders/:id/complete ──────────────────────────────────────
router.patch('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isCompleted: true, completedAt: new Date() },
      { new: true }
    );
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    res.json({ message: 'Task marked as completed', reminder });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

module.exports = router;
