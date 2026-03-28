const express = require('express');
const { body, validationResult } = require('express-validator');
const Plant = require('../models/Plant');
const Update = require('../models/Update');
const authMiddleware = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../config/cloudinary');

const router = express.Router();

// Validation
const plantValidation = [
  body('commonName').trim().notEmpty().withMessage('Common name is required'),
  body('plantingDate').isISO8601().withMessage('Valid planting date is required'),
];

// ─── GET /api/plants ─────────────────────────────────────────────────────────
// Get all plants for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const plants = await Plant.find({ userId: req.user.id, status: 'active' })
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });

    // Map lean results to include id field
    const mapped = plants.map((p) => {
      p.id = p._id;
      delete p._id;
      delete p.__v;
      return p;
    });

    res.json({ plants: mapped });
  } catch (error) {
    console.error('Get plants error:', error);
    res.status(500).json({ error: 'Failed to fetch plants' });
  }
});

// ─── GET /api/plants/:id ─────────────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const plant = await Plant.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).lean({ virtuals: true });

    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // Get update stats from the updates collection
    const stats = await Update.aggregate([
      { $match: { plantId: plant._id } },
      {
        $group: {
          _id: null,
          updateCount: { $sum: 1 },
          lastUpdateDate: { $max: '$entryDate' },
          avgHeight: { $avg: '$heightCm' },
          maxHeight: { $max: '$heightCm' },
          photoCount: {
            $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ['$photos', []] } }, 0] }, 1, 0] },
          },
        },
      },
    ]);

    plant.id = plant._id;
    delete plant._id;
    delete plant.__v;

    res.json({
      plant: {
        ...plant,
        stats: stats[0] || { updateCount: 0, lastUpdateDate: null, avgHeight: null },
      },
    });
  } catch (error) {
    console.error('Get plant error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid plant ID' });
    }
    res.status(500).json({ error: 'Failed to fetch plant' });
  }
});

// ─── POST /api/plants ────────────────────────────────────────────────────────
router.post('/', authMiddleware, upload.single('photo'), plantValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      commonName, scientificName, family, genus, species, variety,
      plantType, growthHabit, nativeRegion, description,
      plantingDate, location, soilType, sunlightExposure,
      plantingMethod, expectedHarvestDays,
    } = req.body;

    // Upload photo if provided
    let photoUrl = null;
    if (req.file) {
      photoUrl = await uploadToCloudinary(req.file.buffer, 'botanico/plants');
    }

    const plant = await Plant.create({
      userId: req.user.id,
      commonName, scientificName, family, genus, species, variety,
      plantType, growthHabit, nativeRegion, description,
      plantingDate: new Date(plantingDate),
      firstPhotoUrl: photoUrl,
      location, soilType, sunlightExposure, plantingMethod,
      expectedHarvestDays: expectedHarvestDays ? Number(expectedHarvestDays) : null,
    });

    res.status(201).json({
      message: 'Plant created successfully',
      plant: plant.toJSON(),
    });
  } catch (error) {
    console.error('Create plant error:', error);
    res.status(500).json({ error: 'Failed to create plant' });
  }
});

// ─── PUT /api/plants/:id ─────────────────────────────────────────────────────
router.put('/:id', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const plant = await Plant.findOne({ _id: req.params.id, userId: req.user.id });
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    const {
      commonName, scientificName, family, genus, species, variety,
      plantType, growthHabit, nativeRegion, description,
      location, soilType, sunlightExposure, plantingMethod,
      expectedHarvestDays, status,
    } = req.body;

    // Upload new photo if provided
    if (req.file) {
      plant.firstPhotoUrl = await uploadToCloudinary(req.file.buffer, 'botanico/plants');
    }

    // Update fields only if provided
    if (commonName !== undefined) plant.commonName = commonName;
    if (scientificName !== undefined) plant.scientificName = scientificName;
    if (family !== undefined) plant.family = family;
    if (genus !== undefined) plant.genus = genus;
    if (species !== undefined) plant.species = species;
    if (variety !== undefined) plant.variety = variety;
    if (plantType !== undefined) plant.plantType = plantType;
    if (growthHabit !== undefined) plant.growthHabit = growthHabit;
    if (nativeRegion !== undefined) plant.nativeRegion = nativeRegion;
    if (description !== undefined) plant.description = description;
    if (location !== undefined) plant.location = location;
    if (soilType !== undefined) plant.soilType = soilType;
    if (sunlightExposure !== undefined) plant.sunlightExposure = sunlightExposure;
    if (plantingMethod !== undefined) plant.plantingMethod = plantingMethod;
    if (expectedHarvestDays !== undefined) plant.expectedHarvestDays = Number(expectedHarvestDays);
    if (status !== undefined) plant.status = status;

    await plant.save();

    res.json({
      message: 'Plant updated successfully',
      plant: plant.toJSON(),
    });
  } catch (error) {
    console.error('Update plant error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid plant ID' });
    }
    res.status(500).json({ error: 'Failed to update plant' });
  }
});

// ─── DELETE /api/plants/:id ──────────────────────────────────────────────────
// Soft delete by setting status to 'deleted'
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const plant = await Plant.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: 'deleted' },
      { new: true }
    );

    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    res.json({ message: 'Plant deleted successfully' });
  } catch (error) {
    console.error('Delete plant error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid plant ID' });
    }
    res.status(500).json({ error: 'Failed to delete plant' });
  }
});

// ─── GET /api/plants/:id/stats ───────────────────────────────────────────────
router.get('/:id/stats', authMiddleware, async (req, res) => {
  try {
    const plant = await Plant.findOne({ _id: req.params.id, userId: req.user.id });
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    const stats = await Update.aggregate([
      { $match: { plantId: plant._id } },
      {
        $group: {
          _id: null,
          totalUpdates: { $sum: 1 },
          lastUpdate: { $max: '$entryDate' },
          firstUpdate: { $min: '$entryDate' },
          avgHeight: { $avg: '$heightCm' },
          maxHeight: { $max: '$heightCm' },
          photoCount: {
            $sum: {
              $cond: [{ $gt: [{ $size: { $ifNull: ['$photos', []] } }, 0] }, 1, 0],
            },
          },
        },
      },
    ]);

    res.json({
      stats: stats[0] || {
        totalUpdates: 0,
        lastUpdate: null,
        firstUpdate: null,
        avgHeight: null,
        maxHeight: null,
        photoCount: 0,
      },
      plantingDate: plant.plantingDate,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
