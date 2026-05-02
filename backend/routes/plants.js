const express = require('express');
const { body, validationResult } = require('express-validator');
const Plant = require('../models/Plant');
const Update = require('../models/Update');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const { translateFields } = require('../services/translateService');
const aiAssistant = require('../services/aiAssistant');

const router = express.Router();

// Validation
const plantValidation = [
  body('commonName').trim().notEmpty().withMessage('Common name is required'),
  body('plantingDate').isISO8601().withMessage('Valid planting date is required'),
];

// Helper for UUID mapping in lean results
const mapDisplayId = (docs) => {
  return docs.map((d) => {
    d.id = d._id;
    delete d._id;
    delete d.__v;
    return d;
  });
};

// ─── GET /api/plants ─────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const plants = await Plant.find({ userId: req.user.id, status: 'active' })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ plants: mapDisplayId(plants) });
  } catch (error) {
    console.error('Get plants error:', error);
    res.status(500).json({ error: 'Failed to fetch plants' });
  }
});

// ─── GET /api/plants/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id).lean();

    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // Access Control: Public plants are visible to everyone. 
    // Private plants require the owner's auth token.
    if (!plant.isPublic) {
      // If not public, we need a valid token and the user must be the owner
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        if (plant.userId.toString() !== decoded.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      } catch (e) {
        return res.status(403).json({ error: 'Invalid token' });
      }
    }

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
            $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ['$drivePhotos', []] } }, 0] }, 1, 0] },
          },
        },
      },
    ]);

    plant.id = plant._id;
    delete plant._id;

    res.json({
      plant: {
        ...plant,
        stats: stats[0] || { updateCount: 0, lastUpdateDate: null, avgHeight: null },
      },
      plant_id: plant.displayId
    });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid plant ID' });
    res.status(500).json({ error: 'Failed to fetch plant' });
  }
});

// ─── POST /api/plants ────────────────────────────────────────────────────────
router.post('/', authMiddleware, plantValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const user = await User.findById(req.user.id);
    const sourceLang = user.preferredLanguage || 'en';

    // Auto-Translate detailed plant info before saving to DB as English
    const fieldsToTranslate = ['commonName', 'scientificName', 'description', 'variety', 'plantType', 'growthHabit', 'nativeRegion', 'soilType', 'plantingMethod'];
    const translatedBody = await translateFields(req.body, fieldsToTranslate, sourceLang);

    const {
      commonName, scientificName, family, genus, species, variety,
      plantType, growthHabit, nativeRegion, description,
      plantingDate, plantingSeason, environmentCondition,
      location, soilType, sunlightExposure,
      plantingMethod, expectedHarvestDays, isPublic,
      habitat, classificationGroup, locationText, coordinates
    } = translatedBody;

    const plant = await Plant.create({
      userId: req.user.id,
      commonName, scientificName, family, genus, species, variety,
      plantType, growthHabit, nativeRegion, description,
      plantingDate: new Date(plantingDate),
      plantingSeason, 
      environmentCondition,
      location, soilType, sunlightExposure, plantingMethod,
      expectedHarvestDays: expectedHarvestDays ? Number(expectedHarvestDays) : null,
      isPublic: isPublic === 'true' || isPublic === true,
      habitat, classificationGroup, locationText, coordinates
    });

    res.status(201).json({
      message: 'Plant created successfully',
      plant: plant.toJSON(),
      user_id: req.user.id,
      plant_id: plant.displayId 
    });
  } catch (error) {
    console.error('Create plant error:', error);
    res.status(500).json({ error: 'Failed to create plant' });
  }
});

// ─── PUT /api/plants/:id ─────────────────────────────────────────────────────
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const plant = await Plant.findOne({ _id: req.params.id, userId: req.user.id });
    if (!plant) return res.status(404).json({ error: 'Plant not found' });

    const user = await User.findById(req.user.id);
    const sourceLang = user.preferredLanguage || 'en';

    const fieldsToTranslate = ['commonName', 'scientificName', 'description', 'variety', 'plantType', 'growthHabit', 'nativeRegion', 'soilType', 'plantingMethod'];
    const translatedBody = await translateFields(req.body, fieldsToTranslate, sourceLang);

    const {
      commonName, scientificName, family, genus, species, variety,
      plantType, growthHabit, nativeRegion, description,
      location, soilType, sunlightExposure, plantingMethod,
      expectedHarvestDays, status, plantingSeason, environmentCondition, isPublic
    } = translatedBody;

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
    if (plantingSeason !== undefined) plant.plantingSeason = plantingSeason;
    if (environmentCondition !== undefined) plant.environmentCondition = environmentCondition;
    if (isPublic !== undefined) plant.isPublic = isPublic;

    await plant.save();

    res.json({
      message: 'Plant updated successfully',
      plant: plant.toJSON(),
      user_id: req.user.id,
      plant_id: plant.displayId
    });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid plant ID' });
    res.status(500).json({ error: 'Failed to update plant' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const plant = await Plant.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: 'deleted' },
      { new: true }
    );
    if (!plant) return res.status(404).json({ error: 'Plant not found' });
    res.json({ message: 'Plant deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete plant' });
  }
});

// ─── POST /api/plants/:id/ai ───────────────────────────────────────────────
/**
 * @route   POST /api/plants/:id/ai
 * @desc    Get AI-powered advice for a specific plant
 * @access  Private
 */
router.post('/:id/ai', authMiddleware, async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    const plant = await Plant.findOne({ _id: req.params.id, userId: req.user.id }).lean();
    if (!plant) return res.status(404).json({ error: 'Plant not found' });

    // Fetch recent updates to give context to AI
    const updates = await Update.find({ plantId: plant._id })
      .sort({ entryDate: -1 })
      .limit(5)
      .lean();

    const plantContext = {
      ...plant,
      recentUpdates: updates
    };

    const advice = await aiAssistant.getPersonalizedAdvice(plantContext, question);
    res.json({ advice });
  } catch (error) {
    console.error('AI Route Error:', error);
    res.status(500).json({ error: 'Failed to get AI advice' });
  }
});

module.exports = router;
