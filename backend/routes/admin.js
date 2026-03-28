const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Plant = require('../models/Plant');
const Update = require('../models/Update');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ─── Admin Middleware ─────────────────────────────────────────────────────────
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.adminUser = user;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

// ─── GET /api/admin/overview ──────────────────────────────────────────────────
// Dashboard stats: total users, plants, updates
router.get('/overview', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [totalUsers, totalPlants, totalUpdates, recentUsers, usersByRole] =
      await Promise.all([
        User.countDocuments(),
        Plant.countDocuments(),
        Update.countDocuments(),
        User.find().sort({ createdAt: -1 }).limit(5).select('-passwordHash'),
        User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      ]);

    const plantsByStatus = await Plant.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      stats: { totalUsers, totalPlants, totalUpdates },
      recentUsers,
      usersByRole,
      plantsByStatus,
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
// All users with their plant counts
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });

    // Get plant count per user
    const plantCounts = await Plant.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    plantCounts.forEach((p) => { countMap[p._id.toString()] = p.count; });

    const usersWithCounts = users.map((u) => ({
      ...u.toJSON(),
      plantCount: countMap[u._id.toString()] || 0,
    }));

    res.json({ users: usersWithCounts });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ─── GET /api/admin/users/:userId/plants ─────────────────────────────────────
// All plants of a specific user
router.get('/users/:userId/plants', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const plants = await Plant.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    const user = await User.findById(req.params.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user, plants });
  } catch (err) {
    console.error('Admin user plants error:', err);
    res.status(500).json({ error: 'Failed to fetch user plants' });
  }
});

// ─── GET /api/admin/plants ────────────────────────────────────────────────────
// ALL plants from ALL users with owner info
router.get('/plants', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const plants = await Plant.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });
    res.json({ plants: plants.map(p => p.toJSON()) });
  } catch (err) {
    console.error('Admin plants error:', err);
    res.status(500).json({ error: 'Failed to fetch plants' });
  }
});

// ─── GET /api/admin/plants/:plantId/updates ───────────────────────────────────
// All updates/logs for a specific plant
router.get('/plants/:plantId/updates', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.plantId).populate('userId', 'name email');
    if (!plant) return res.status(404).json({ error: 'Plant not found' });
    const updates = await Update.find({ plantId: req.params.plantId }).sort({ entryDate: -1 });
    res.json({ plant, updates });
  } catch (err) {
    console.error('Admin plant updates error:', err);
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

// ─── GET /api/admin/activity ──────────────────────────────────────────────────
// Recent activity feed across all users
router.get('/activity', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const recentUpdates = await Update.find()
      .populate('userId', 'name email')
      .populate('plantId', 'commonName scientificName')
      .sort({ createdAt: -1 })
      .limit(30);

    const recentPlants = await Plant.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ recentUpdates, recentPlants });
  } catch (err) {
    console.error('Admin activity error:', err);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// ─── PATCH /api/admin/users/:userId/role ─────────────────────────────────────
// Change a user's role
router.patch('/users/:userId/role', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Role updated', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

module.exports = router;
