const express = require('express');
const Achievement = require('../models/Achievement');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/achievements ──────────────────────────────────────────────────
// Get all unlocked achievements for the current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.user.id })
      .sort({ unlockedAt: -1 });
    res.json({ achievements });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// ─── POST /api/achievements/unlock ──────────────────────────────────────────
// Manually unlock an achievement (usually triggered by system logic)
router.post('/unlock', authMiddleware, async (req, res) => {
  try {
    const { title, description, icon, category, rarity, points } = req.body;
    
    // Check if already unlocked
    const existing = await Achievement.findOne({ userId: req.user.id, title });
    if (existing) return res.status(400).json({ error: 'Achievement already unlocked' });

    const achievement = await Achievement.create({
      userId: req.user.id,
      title,
      description,
      icon,
      category,
      rarity,
      points
    });

    res.status(201).json({ message: 'New Achievement Unlocked!', achievement });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unlock achievement' });
  }
});

module.exports = router;
