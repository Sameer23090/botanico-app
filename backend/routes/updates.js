const express = require('express');
const { body, validationResult } = require('express-validator');
const Plant = require('../models/Plant');
const Update = require('../models/Update');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { translateFields } = require('../services/translateService');

const router = express.Router();

const updateValidation = [
  body('plantId').notEmpty().withMessage('Plant ID is required'),
  body('entryDate').notEmpty().isISO8601().withMessage('Valid entry date is required'),
];

const calcDayNumber = (plantingDate, entryDate) => {
  const diff = new Date(entryDate) - new Date(plantingDate);
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

// ─── GET /api/updates/plant/:plantId ─────────────────────────────────────────
router.get('/plant/:plantId', authMiddleware, async (req, res) => {
  try {
    const plant = await Plant.findOne({ _id: req.params.plantId, userId: req.user.id });
    if (!plant) return res.status(404).json({ error: 'Plant not found' });

    const updates = await Update.find({ plantId: req.params.plantId })
      .sort({ entryDate: -1, createdAt: -1 })
      .lean();

    const mapped = updates.map((u) => { 
      u.id = u._id; 
      delete u._id; 
      delete u.__v; 
      return u; 
    });

    res.json({
      updates: mapped,
      plantingDate: plant.plantingDate,
      user_id: req.user.id,
      plant_id: plant.displayId
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

// ─── POST /api/updates ───────────────────────────────────────────────────────
router.post('/', authMiddleware, updateValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const user = await User.findById(req.user.id);
    const sourceLang = user.preferredLanguage || 'en';

    // Auto-Translate user input fields
    const fieldsToTranslate = ['title', 'observations', 'notes', 'fertilizerName', 'fertilizerNotes', 'dosage', 'rootObservations', 'pestIssues', 'diseaseObservations', 'environmentalStress'];
    const translatedBody = await translateFields(req.body, fieldsToTranslate, sourceLang);

    const {
      plantId, entryDate, title, observations,
      heightCm, widthCm, leafCount, floweringStage, fruitingStage,
      healthStatus, stemDiameterMm, rootObservations, pestIssues,
      diseaseObservations, environmentalStress, careActions,
      temperatureCelsius, humidityPercent, soilPh, soilMoisture, notes,
      fertilizerUsed, fertilizerName, fertilizerType, dosage, applicationMethod, fertilizerNotes,
      environmentCondition, drivePhotos
    } = translatedBody;

    const plant = await Plant.findOne({ _id: plantId, userId: req.user.id });
    if (!plant) return res.status(404).json({ error: 'Plant not found' });

    const dayNumber = calcDayNumber(plant.plantingDate, entryDate);

    let parsedCareActions = [];
    if (careActions) {
      if (typeof careActions === 'string') {
        try { parsedCareActions = JSON.parse(careActions); } catch { parsedCareActions = [careActions]; }
      } else if (Array.isArray(careActions)) {
        parsedCareActions = careActions;
      }
    }

    // Parse drivePhotos if sent as JSON string
    let parsedDrivePhotos = [];
    if (drivePhotos) {
      if (typeof drivePhotos === 'string') {
        try { parsedDrivePhotos = JSON.parse(drivePhotos); } catch { parsedDrivePhotos = []; }
      } else {
        parsedDrivePhotos = drivePhotos;
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
      drivePhotos: parsedDrivePhotos,
      temperatureCelsius: temperatureCelsius ? Number(temperatureCelsius) : null,
      humidityPercent: humidityPercent ? Number(humidityPercent) : null,
      soilPh: soilPh ? Number(soilPh) : null,
      soilMoisture: soilMoisture || null,
      notes: notes || null,
      fertilizerUsed: fertilizerUsed === 'true' || fertilizerUsed === true,
      fertilizerName, 
      fertilizerType, 
      dosage, 
      applicationMethod, 
      fertilizerNotes,
      environmentCondition
    });

    res.status(201).json({
      message: 'Update created successfully',
      update: update.toJSON(),
      user_id: req.user.id,
      plant_id: plant.displayId
    });
  } catch (error) {
    console.error('Create update error:', error);
    res.status(500).json({ error: 'Failed to create update' });
  }
});

// ─── PUT /api/updates/:id ────────────────────────────────────────────────────
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const update = await Update.findById(req.params.id).populate('plantId', 'userId');
    if (!update) return res.status(404).json({ error: 'Update not found' });

    if (update.plantId.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const user = await User.findById(req.user.id);
    const sourceLang = user.preferredLanguage || 'en';

    const fieldsToTranslate = ['title', 'observations', 'notes', 'fertilizerName', 'fertilizerNotes', 'dosage', 'rootObservations', 'pestIssues', 'diseaseObservations', 'environmentalStress'];
    const translatedBody = await translateFields(req.body, fieldsToTranslate, sourceLang);

    const {
      title, observations, heightCm, widthCm, leafCount,
      floweringStage, fruitingStage, healthStatus, stemDiameterMm,
      rootObservations, pestIssues, diseaseObservations, environmentalStress,
      careActions, temperatureCelsius, humidityPercent, soilPh, soilMoisture, notes,
      fertilizerUsed, fertilizerName, fertilizerType, dosage, applicationMethod, fertilizerNotes,
      environmentCondition, drivePhotos
    } = translatedBody;

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
    if (fertilizerUsed !== undefined) update.fertilizerUsed = fertilizerUsed === 'true' || fertilizerUsed === true;
    if (fertilizerName !== undefined) update.fertilizerName = fertilizerName;
    if (fertilizerType !== undefined) update.fertilizerType = fertilizerType;
    if (dosage !== undefined) update.dosage = dosage;
    if (applicationMethod !== undefined) update.applicationMethod = applicationMethod;
    if (fertilizerNotes !== undefined) update.fertilizerNotes = fertilizerNotes;
    if (environmentCondition !== undefined) update.environmentCondition = environmentCondition;

    if (careActions !== undefined) {
      if (typeof careActions === 'string') {
        try { update.careActions = JSON.parse(careActions); } catch { update.careActions = [careActions]; }
      } else {
        update.careActions = careActions;
      }
    }

    if (drivePhotos !== undefined) {
      const newPhotos = typeof drivePhotos === 'string' ? JSON.parse(drivePhotos) : drivePhotos;
      update.drivePhotos = [...(update.drivePhotos || []), ...newPhotos];
    }
    
    await update.save();

    res.json({
      message: 'Update modified successfully',
      update: update.toJSON(),
      user_id: req.user.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const update = await Update.findById(req.params.id).populate('plantId', 'userId');
    if (!update || update.plantId.userId.toString() !== req.user.id.toString()) {
      return res.status(404).json({ error: 'Update not found' });
    }
    await Update.findByIdAndDelete(req.params.id);
    res.json({ message: 'Update deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete update' });
  }
});

module.exports = router;
