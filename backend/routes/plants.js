const express = require('express');
const { body, validationResult } = require('express-validator');
const dbQueries = require('../db/dbQueries');
const authMiddleware = require('../middleware/auth');
const { translateFields } = require('../services/translateService');
const aiAssistant = require('../services/aiAssistant');

const router = express.Router();

// Validation
const plantValidation = [
  body('commonName').trim().notEmpty().withMessage('Common name is required'),
  body('plantingDate').isISO8601().withMessage('Valid planting date is required'),
];

// ─── GET /api/plants ─────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const plants = await dbQueries.plants.findActiveByUserId(req.user.id);
    res.json({ plants });
  } catch (error) {
    console.error('Get plants error:', error);
    res.status(500).json({ error: 'Failed to fetch plants' });
  }
});

// ─── GET /api/plants/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const plant = await dbQueries.plants.findById(req.params.id);

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
        if (plant.userId !== decoded.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      } catch (e) {
        return res.status(403).json({ error: 'Invalid token' });
      }
    }

    const stats = await dbQueries.plants.getStats(plant.id);

    res.json({
      plant: {
        ...plant,
        stats
      },
      plant_id: plant.displayId
    });
  } catch (error) {
    console.error('Get plant detail error:', error);
    res.status(500).json({ error: 'Failed to fetch plant' });
  }
});

// ─── POST /api/plants ────────────────────────────────────────────────────────
router.post('/', authMiddleware, plantValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const user = await dbQueries.users.findById(req.user.id);
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

    const plant = await dbQueries.plants.create({
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
      plant,
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
    const plant = await dbQueries.plants.findById(req.params.id);
    if (!plant || plant.userId !== req.user.id) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    const user = await dbQueries.users.findById(req.user.id);
    const sourceLang = user.preferredLanguage || 'en';

    const fieldsToTranslate = ['commonName', 'scientificName', 'description', 'variety', 'plantType', 'growthHabit', 'nativeRegion', 'soilType', 'plantingMethod'];
    const translatedBody = await translateFields(req.body, fieldsToTranslate, sourceLang);

    const {
      commonName, scientificName, family, genus, species, variety,
      plantType, growthHabit, nativeRegion, description,
      location, soilType, sunlightExposure, plantingMethod,
      expectedHarvestDays, status, plantingSeason, environmentCondition, isPublic
    } = translatedBody;

    const updated = await dbQueries.plants.update(req.params.id, {
      commonName, scientificName, family, genus, species, variety,
      plantType, growthHabit, nativeRegion, description,
      location, soilType, sunlightExposure, plantingMethod,
      expectedHarvestDays: expectedHarvestDays !== undefined ? Number(expectedHarvestDays) : undefined,
      status, plantingSeason, environmentCondition,
      isPublic: isPublic !== undefined ? (isPublic === 'true' || isPublic === true) : undefined
    });

    res.json({
      message: 'Plant updated successfully',
      plant: updated,
      user_id: req.user.id,
      plant_id: updated.displayId
    });
  } catch (error) {
    console.error('Update plant error:', error);
    res.status(500).json({ error: 'Failed to update plant' });
  }
});

// ─── DELETE /api/plants/:id ──────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const plant = await dbQueries.plants.delete(req.params.id, req.user.id);
    if (!plant) return res.status(404).json({ error: 'Plant not found' });
    res.json({ message: 'Plant deleted successfully' });
  } catch (error) {
    console.error('Delete plant error:', error);
    res.status(500).json({ error: 'Failed to delete plant' });
  }
});

// ─── POST /api/plants/:id/ai ───────────────────────────────────────────────
router.post('/:id/ai', authMiddleware, async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    const plant = await dbQueries.plants.findById(req.params.id);
    if (!plant || plant.userId !== req.user.id) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // Fetch recent updates to give context to AI
    const list = await dbQueries.updates.findByPlantId(plant.id);
    const updates = list.slice(0, 5);

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
