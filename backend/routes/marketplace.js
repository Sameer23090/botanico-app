const express = require('express');
const { body, validationResult } = require('express-validator');
const Listing = require('../models/Listing');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/marketplace ───────────────────────────────────────────────────
// Browse all active listings with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, listingType, minPrice, maxPrice, city } = req.query;
    let query = { status: 'Active' };

    if (category) query.category = category;
    if (listingType) query.listingType = listingType;
    if (city) {
      const cityStr = String(city);
      const escapedCity = cityStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query['location.city'] = new RegExp(escapedCity, 'i');
    }
    if (minPrice || maxPrice) {
      query['price.amount'] = {};
      if (minPrice) query['price.amount'].$gte = Number(minPrice);
      if (maxPrice) query['price.amount'].$lte = Number(maxPrice);
    }

    const listings = await Listing.find(query)
      .populate('userId', 'name avatarUrl')
      .populate('plantId', 'commonName scientificName')
      .sort({ createdAt: -1 });

    res.json({ listings });
  } catch (error) {
    console.error('Browse marketplace error:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// ─── POST /api/marketplace ──────────────────────────────────────────────────
// Create a new listing
router.post('/', authMiddleware, [
  body('plantId').notEmpty().withMessage('plantId is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('price.amount').isNumeric().withMessage('Price must be a number'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const listing = await Listing.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json({
      message: 'Listing created successfully',
      listing
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// ─── GET /api/marketplace/my-listings ────────────────────────────────────────
router.get('/my-listings', authMiddleware, async (req, res) => {
  try {
    const listings = await Listing.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ listings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your listings' });
  }
});

module.exports = router;
