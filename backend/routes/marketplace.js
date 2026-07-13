const express = require('express');
const { body, validationResult } = require('express-validator');
const dbQueries = require('../db/dbQueries');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/marketplace ───────────────────────────────────────────────────
// Browse all active listings with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, listingType, minPrice, maxPrice, city } = req.query;

    const listings = await dbQueries.listings.find({
      status: 'Active',
      category,
      listingType,
      city,
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null
    });

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

    const listing = await dbQueries.listings.create({
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
    const listings = await dbQueries.listings.findByUserId(req.user.id);
    res.json({ listings });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({ error: 'Failed to fetch your listings' });
  }
});

module.exports = router;
