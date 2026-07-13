const express = require('express');
const { body, validationResult } = require('express-validator');
const dbQueries = require('../db/dbQueries');
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
    const plant = await dbQueries.plants.findById(req.params.plantId);
    if (!plant) return res.status(404).json({ error: 'Plant not found' });

    // Access Control: only owner can see private plants
    if (!plant.isPublic && plant.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = await dbQueries.updates.findByPlantId(req.params.plantId);

    res.json({
      updates,
      plantingDate: plant.plantingDate,
      plant_id: plant.displayId
    });
  } catch (error) {
    console.error('Get updates error:', error);
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

// ─── POST /api/updates ───────────────────────────────────────────────────────
router.post('/', authMiddleware, updateValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const user = await dbQueries.users.findById(req.user.id);
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
      environmentCondition, drivePhotos, coordinates
    } = translatedBody;

    const plant = await dbQueries.plants.findById(plantId);
    if (!plant || plant.userId !== req.user.id) {
      return res.status(404).json({ error: 'Plant not found' });
    }

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

    const update = await dbQueries.updates.create({
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
      environmentCondition,
      coordinates
    });

    res.status(201).json({
      message: 'Update created successfully',
      update,
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
    const update = await dbQueries.updates.findById(req.params.id);
    if (!update) return res.status(404).json({ error: 'Update not found' });

    const plant = await dbQueries.plants.findById(update.plantId);
    if (!plant || plant.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const user = await dbQueries.users.findById(req.user.id);
    const sourceLang = user.preferredLanguage || 'en';

    const fieldsToTranslate = ['title', 'observations', 'notes', 'fertilizerName', 'fertilizerNotes', 'dosage', 'rootObservations', 'pestIssues', 'diseaseObservations', 'environmentalStress'];
    const translatedBody = await translateFields(req.body, fieldsToTranslate, sourceLang);

    const {
      title, observations, entryDate, heightCm, widthCm, leafCount,
      floweringStage, fruitingStage, healthStatus, stemDiameterMm,
      rootObservations, pestIssues, diseaseObservations,
      environmentalStress, careActions, temperatureCelsius,
      humidityPercent, soilPh, soilMoisture, notes,
      fertilizerUsed, fertilizerName, fertilizerType, dosage,
      applicationMethod, fertilizerNotes, environmentCondition, drivePhotos, coordinates
    } = translatedBody;

    let parsedCareActions = update.careActions || [];
    if (careActions !== undefined) {
      if (typeof careActions === 'string') {
        try { parsedCareActions = JSON.parse(careActions); } catch { parsedCareActions = [careActions]; }
      } else {
        parsedCareActions = careActions;
      }
    }

    let mergedPhotos = update.drivePhotos || [];
    if (drivePhotos !== undefined) {
      const newPhotos = typeof drivePhotos === 'string' ? JSON.parse(drivePhotos) : drivePhotos;
      mergedPhotos = [...mergedPhotos, ...newPhotos];
    }

    const updated = await dbQueries.updates.update(req.params.id, {
      title, observations, entryDate, 
      heightCm: heightCm !== undefined ? Number(heightCm) : undefined, 
      widthCm: widthCm !== undefined ? Number(widthCm) : undefined, 
      leafCount: leafCount !== undefined ? Number(leafCount) : undefined,
      floweringStage, fruitingStage, healthStatus, 
      stemDiameterMm: stemDiameterMm !== undefined ? Number(stemDiameterMm) : undefined,
      rootObservations, pestIssues, diseaseObservations,
      environmentalStress, 
      temperatureCelsius: temperatureCelsius !== undefined ? Number(temperatureCelsius) : undefined,
      humidityPercent: humidityPercent !== undefined ? Number(humidityPercent) : undefined, 
      soilPh: soilPh !== undefined ? Number(soilPh) : undefined, 
      soilMoisture, notes,
      fertilizerUsed: fertilizerUsed !== undefined ? (fertilizerUsed === 'true' || fertilizerUsed === true) : undefined, 
      fertilizerName, fertilizerType, dosage,
      applicationMethod, fertilizerNotes, environmentCondition, coordinates,
      careActions: parsedCareActions,
      drivePhotos: mergedPhotos
    });

    res.json({
      message: 'Update modified successfully',
      update: updated,
      user_id: req.user.id
    });
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// ─── DELETE /api/updates/:id ─────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const update = await dbQueries.updates.findById(req.params.id);
    if (!update) return res.status(404).json({ error: 'Update not found' });

    const plant = await dbQueries.plants.findById(update.plantId);
    if (!plant || plant.userId !== req.user.id) {
      return res.status(404).json({ error: 'Update not found' });
    }

    await dbQueries.updates.delete(req.params.id);
    res.json({ message: 'Update deleted successfully' });
  } catch (error) {
    console.error('Delete update error:', error);
    res.status(500).json({ error: 'Failed to delete update' });
  }
});

module.exports = router;
