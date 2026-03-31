const express = require('express');
const { body, validationResult } = require('express-validator');
const Plant = require('../models/Plant');
const Update = require('../models/Update');
const authMiddleware = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../config/cloudinary');

const router = express.Router();

const updateValidation = [
  body('plantId').notEmpty().withMessage('Plant ID is required'),
  body('entryDate').notEmpty().isISO8601().withMessage('Valid entry date is required'),
];

// Helper: compute day number from planting date
const calcDayNumber = (plantingDate, entryDate) => {
  const diff = new Date(entryDate) - new Date(plantingDate);
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

// ─── GET /api/updates/plant/:plantId ─────────────────────────────────────────
router.get('/plant/:plantId', authMiddleware, async (req, res) => {
  try {
    // Verify the plant belongs to this user
    const plant = await Plant.findOne({
      _id: req.params.plantId,
      userId: req.user.id,
    });
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    const updates = await Update.find({ plantId: req.params.plantId })
      .sort({ entryDate: -1, createdAt: -1 })
      .lean({ virtuals: true });

    const mapped = updates.map((u) => { u.id = u._id; delete u._id; delete u.__v; return u; });

    res.json({
      updates: mapped,
      plantingDate: plant.plantingDate,
    });
  } catch (error) {
    console.error('Get updates error:', error);
    if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid plant ID' });
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

// ─── GET /api/updates/:id ────────────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const update = await Update.findById(req.params.id).populate('plantId', 'userId');
    if (!update) {
      return res.status(404).json({ error: 'Update not found' });
    }

    // Ensure the plant belongs to the requesting user
    if (update.plantId.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ update: update.toJSON() });
  } catch (error) {
    console.error('Get update error:', error);
    if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid update ID' });
    res.status(500).json({ error: 'Failed to fetch update' });
  }
});

// ─── POST /api/updates ───────────────────────────────────────────────────────
// Smart middleware: skip multer for JSON requests (no file uploads)
const uploadOrJson = (req, res, next) => {
  if (req.is('application/json')) return next();
  upload.array('photos', 5)(req, res, next);
};

router.post('/', authMiddleware, uploadOrJson, updateValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      plantId, entryDate, title, observations,
      heightCm, widthCm, leafCount, floweringStage, fruitingStage,
      healthStatus, stemDiameterMm, rootObservations, pestIssues,
      diseaseObservations, environmentalStress, careActions,
      temperatureCelsius, humidityPercent, soilPh, soilMoisture, notes,
    } = req.body;

    // Verify plant belongs to user
    const plant = await Plant.findOne({ _id: plantId, userId: req.user.id });
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // Calculate day number
    const dayNumber = calcDayNumber(plant.plantingDate, entryDate);

    // Upload photos
    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, 'botanico/updates')
      );
      photoUrls = await Promise.all(uploadPromises);
    }

    // Parse careActions safely (can be sent as JSON string or array)
    let parsedCareActions = [];
    if (careActions) {
      if (typeof careActions === 'string') {
        try { parsedCareActions = JSON.parse(careActions); } catch { parsedCareActions = [careActions]; }
      } else if (Array.isArray(careActions)) {
        parsedCareActions = careActions;
      }
    }

    const update = await Update.create({
      plantId,
      userId: req.user.id,
      entryDate: new Date(entryDate),
      dayNumber,
      title: title || null,
      observations: observations || null,
      heightCm: heightCm ? Number(heightCm) : null,
      widthCm: widthCm ? Number(widthCm) : null,
      leafCount: leafCount ? Number(leafCount) : null,
      floweringStage: floweringStage || null,
      fruitingStage: fruitingStage || null,
      healthStatus: healthStatus || null,
      stemDiameterMm: stemDiameterMm ? Number(stemDiameterMm) : null,
      rootObservations: rootObservations || null,
      pestIssues: pestIssues || null,
      diseaseObservations: diseaseObservations || null,
      environmentalStress: environmentalStress || null,
      careActions: parsedCareActions,
      photos: photoUrls,
      temperatureCelsius: temperatureCelsius ? Number(temperatureCelsius) : null,
      humidityPercent: humidityPercent ? Number(humidityPercent) : null,
      soilPh: soilPh ? Number(soilPh) : null,
      soilMoisture: soilMoisture || null,
      notes: notes || null,
    });

    res.status(201).json({
      message: 'Update created successfully',
      update: update.toJSON(),
    });
  } catch (error) {
    console.error('Create update error:', error);
    res.status(500).json({ error: 'Failed to create update' });
  }
});

// ─── PUT /api/updates/:id ────────────────────────────────────────────────────
router.put('/:id', authMiddleware, uploadOrJson, async (req, res) => {
  try {
    const update = await Update.findById(req.params.id).populate('plantId', 'userId');
    if (!update) {
      return res.status(404).json({ error: 'Update not found' });
    }

    // Ownership check
    if (update.plantId.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const {
      title, observations, heightCm, widthCm, leafCount,
      floweringStage, fruitingStage, healthStatus, stemDiameterMm,
      rootObservations, pestIssues, diseaseObservations, environmentalStress,
      careActions, temperatureCelsius, humidityPercent, soilPh, soilMoisture, notes,
    } = req.body;

    // Append new photos
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, 'botanico/updates')
      );
      const newUrls = await Promise.all(uploadPromises);
      update.photos = [...(update.photos || []), ...newUrls];
    }

    // Update only provided fields
    if (title !== undefined) update.title = title;
    if (observations !== undefined) update.observations = observations;
    if (heightCm !== undefined) update.heightCm = Number(heightCm);
    if (widthCm !== undefined) update.widthCm = Number(widthCm);
    if (leafCount !== undefined) update.leafCount = Number(leafCount);
    if (floweringStage !== undefined) update.floweringStage = floweringStage;
    if (fruitingStage !== undefined) update.fruitingStage = fruitingStage;
    if (healthStatus !== undefined) update.healthStatus = healthStatus;
    if (stemDiameterMm !== undefined) update.stemDiameterMm = Number(stemDiameterMm);
    if (rootObservations !== undefined) update.rootObservations = rootObservations;
    if (pestIssues !== undefined) update.pestIssues = pestIssues;
    if (diseaseObservations !== undefined) update.diseaseObservations = diseaseObservations;
    if (environmentalStress !== undefined) update.environmentalStress = environmentalStress;
    if (temperatureCelsius !== undefined) update.temperatureCelsius = Number(temperatureCelsius);
    if (humidityPercent !== undefined) update.humidityPercent = Number(humidityPercent);
    if (soilPh !== undefined) update.soilPh = Number(soilPh);
    if (soilMoisture !== undefined) update.soilMoisture = soilMoisture;
    if (notes !== undefined) update.notes = notes;
    if (careActions !== undefined) {
      if (typeof careActions === 'string') {
        try { update.careActions = JSON.parse(careActions); } catch { update.careActions = [careActions]; }
      } else {
        update.careActions = careActions;
      }
    }
    
    // Update coordinates
    if (req.body.coordinates) {
      if (typeof req.body.coordinates === 'object') {
        update.coordinates = req.body.coordinates;
      } else if (typeof req.body.coordinates === 'string') {
         try { update.coordinates = JSON.parse(req.body.coordinates); } catch {}
      }
    } else if (req.body['coordinates[lat]'] && req.body['coordinates[lng]']) {
      update.coordinates = {
        lat: Number(req.body['coordinates[lat]']),
        lng: Number(req.body['coordinates[lng]'])
      };
    }

    await update.save();

    res.json({
      message: 'Update modified successfully',
      update: update.toJSON(),
    });
  } catch (error) {
    console.error('Update entry error:', error);
    if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid ID' });
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// ─── DELETE /api/updates/:id ─────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const update = await Update.findById(req.params.id).populate('plantId', 'userId');
    if (!update) {
      return res.status(404).json({ error: 'Update not found' });
    }

    if (update.plantId.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Update.findByIdAndDelete(req.params.id);

    res.json({ message: 'Update deleted successfully' });
  } catch (error) {
    console.error('Delete update error:', error);
    res.status(500).json({ error: 'Failed to delete update' });
  }
});

// ─── GET /api/updates/plant/:plantId/timeline ────────────────────────────────
// Returns simplified data for charts (height, leaf count, stages over time)
router.get('/plant/:plantId/timeline', authMiddleware, async (req, res) => {
  try {
    const plant = await Plant.findOne({ _id: req.params.plantId, userId: req.user.id });
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    const timeline = await Update.find({ plantId: req.params.plantId })
      .select('entryDate dayNumber heightCm widthCm leafCount floweringStage fruitingStage healthStatus temperatureCelsius humidityPercent')
      .sort({ entryDate: 1 })
      .lean();

    const mapped = timeline.map((t) => { t.id = t._id; delete t._id; delete t.__v; return t; });

    res.json({ timeline: mapped });
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

module.exports = router;
