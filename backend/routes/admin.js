const express = require('express');
const db = require('../config/database');
const dbQueries = require('../db/dbQueries');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper to format user (no passwordHash)
const formatUser = (u) => {
  if (!u) return null;
  return {
    id: u.id,
    _id: u.id,
    displayId: u.display_id,
    name: u.name,
    email: u.email,
    avatarUrl: u.avatar_url,
    provider: u.provider,
    preferredLanguage: u.preferred_language,
    location: u.location,
    role: u.role,
    createdAt: u.created_at,
    updatedAt: u.updated_at
  };
};

const formatPlant = (p) => {
  if (!p) return null;
  return {
    id: p.id,
    _id: p.id,
    displayId: p.display_id,
    userId: p.user_id,
    commonName: p.common_name,
    scientificName: p.scientific_name,
    family: p.family,
    genus: p.genus,
    species: p.species,
    variety: p.variety,
    plantType: p.plant_type,
    growthHabit: p.growth_habit,
    nativeRegion: p.native_region,
    description: p.description,
    plantingDate: p.planting_date,
    plantingSeason: p.planting_season,
    environmentCondition: p.environment_condition,
    isPublic: p.is_public,
    status: p.status,
    location: p.location,
    soilType: p.soil_type,
    sunlightExposure: p.sunlight_exposure,
    plantingMethod: p.planting_method,
    expectedHarvestDays: p.expected_harvest_days,
    habitat: p.habitat,
    classificationGroup: p.classification_group,
    locationText: p.location_text,
    coordinates: p.coordinates,
    createdAt: p.created_at,
    updatedAt: p.updated_at
  };
};

const formatUpdate = (up) => {
  if (!up) return null;
  return {
    id: up.id,
    _id: up.id,
    plantId: up.plant_id,
    userId: up.user_id,
    entryDate: up.entry_date,
    dayNumber: up.day_number,
    title: up.title,
    observations: up.observations,
    heightCm: up.height_cm ? parseFloat(up.height_cm) : null,
    widthCm: up.width_cm ? parseFloat(up.width_cm) : null,
    leafCount: up.leaf_count,
    floweringStage: up.flowering_stage,
    fruitingStage: up.fruiting_stage,
    healthStatus: up.health_status,
    stemDiameterMm: up.stem_diameter_mm ? parseFloat(up.stem_diameter_mm) : null,
    rootObservations: up.root_observations,
    pestIssues: up.pest_issues,
    diseaseObservations: up.disease_observations,
    environmentalStress: up.environmental_stress,
    careActions: up.care_actions || [],
    drivePhotos: up.drive_photos || [],
    temperatureCelsius: up.temperature_celsius ? parseFloat(up.temperature_celsius) : null,
    humidityPercent: up.humidity_percent ? parseFloat(up.humidity_percent) : null,
    soilPh: up.soil_ph ? parseFloat(up.soil_ph) : null,
    soilMoisture: up.soil_moisture,
    notes: up.notes,
    fertilizerUsed: up.fertilizer_used,
    fertilizerName: up.fertilizer_name,
    fertilizerType: up.fertilizer_type,
    dosage: up.dosage,
    applicationMethod: up.application_method,
    fertilizerNotes: up.fertilizer_notes,
    environmentCondition: up.environment_condition,
    coordinates: up.coordinates,
    createdAt: up.created_at,
    updatedAt: up.updated_at
  };
};

// ─── Admin Middleware ─────────────────────────────────────────────────────────
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await dbQueries.users.findById(req.user.id);
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
    const usersCountRes = await db.query('SELECT COUNT(*)::integer FROM users');
    const plantsCountRes = await db.query("SELECT COUNT(*)::integer FROM plants WHERE status = 'active'");
    const updatesCountRes = await db.query('SELECT COUNT(*)::integer FROM updates');

    const recentUsersRes = await db.query('SELECT * FROM users ORDER BY created_at DESC LIMIT 5');
    const usersByRoleRes = await db.query('SELECT role as _id, COUNT(*)::integer as count FROM users GROUP BY role');
    const plantsByStatusRes = await db.query('SELECT status as _id, COUNT(*)::integer as count FROM plants GROUP BY status');

    res.json({
      stats: { 
        totalUsers: usersCountRes.rows[0].count, 
        totalPlants: plantsCountRes.rows[0].count, 
        totalUpdates: updatesCountRes.rows[0].count 
      },
      recentUsers: recentUsersRes.rows.map(formatUser),
      usersByRole: usersByRoleRes.rows,
      plantsByStatus: plantsByStatusRes.rows,
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
    const usersRes = await db.query('SELECT * FROM users ORDER BY created_at DESC');
    const plantCountsRes = await db.query('SELECT user_id as _id, COUNT(*)::integer as count FROM plants GROUP BY user_id');
    
    const countMap = {};
    plantCountsRes.rows.forEach((p) => { countMap[p._id] = p.count; });

    const usersWithCounts = usersRes.rows.map((u) => ({
      ...formatUser(u),
      plantCount: countMap[u.id] || 0,
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
    const userId = req.params.userId;
    const user = await dbQueries.users.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const plantsRes = await db.query('SELECT * FROM plants WHERE user_id = $1 ORDER BY created_at DESC', [userId]);

    res.json({ 
      user: formatUser(user), 
      plants: plantsRes.rows.map(formatPlant) 
    });
  } catch (err) {
    console.error('Admin user plants error:', err);
    res.status(500).json({ error: 'Failed to fetch user plants' });
  }
});

// ─── GET /api/admin/plants ────────────────────────────────────────────────────
// ALL plants from ALL users with owner info
router.get('/plants', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const queryText = `
      SELECT p.*, u.name as user_name, u.email as user_email, u.role as user_role
      FROM plants p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `;
    const resPlants = await db.query(queryText);

    const plants = resPlants.rows.map(p => ({
      ...formatPlant(p),
      userId: {
        id: p.user_id,
        _id: p.user_id,
        name: p.user_name,
        email: p.user_email,
        role: p.user_role
      }
    }));

    res.json({ plants });
  } catch (err) {
    console.error('Admin plants error:', err);
    res.status(500).json({ error: 'Failed to fetch plants' });
  }
});

// ─── GET /api/admin/plants/:plantId/updates ───────────────────────────────────
// All updates/logs for a specific plant
router.get('/plants/:plantId/updates', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const plantId = req.params.plantId;
    const plantRes = await db.query(
      `SELECT p.*, u.name as user_name, u.email as user_email
       FROM plants p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = $1 LIMIT 1`,
      [plantId]
    );

    if (plantRes.rows.length === 0) return res.status(404).json({ error: 'Plant not found' });
    const p = plantRes.rows[0];

    const updatesRes = await db.query(
      'SELECT * FROM updates WHERE plant_id = $1 ORDER BY entry_date DESC',
      [plantId]
    );

    res.json({ 
      plant: {
        ...formatPlant(p),
        userId: {
          id: p.user_id,
          _id: p.user_id,
          name: p.user_name,
          email: p.user_email
        }
      }, 
      updates: updatesRes.rows.map(formatUpdate) 
    });
  } catch (err) {
    console.error('Admin plant updates error:', err);
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

// ─── GET /api/admin/activity ──────────────────────────────────────────────────
// Recent activity feed across all users
router.get('/activity', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const recentUpdatesRes = await db.query(
      `SELECT up.*, u.name as user_name, u.email as user_email,
              p.common_name as plant_common_name, p.scientific_name as plant_scientific_name
       FROM updates up
       LEFT JOIN users u ON up.user_id = u.id
       LEFT JOIN plants p ON up.plant_id = p.id
       ORDER BY up.created_at DESC
       LIMIT 30`
    );

    const recentPlantsRes = await db.query(
      `SELECT p.*, u.name as user_name, u.email as user_email
       FROM plants p
       LEFT JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT 10`
    );

    const recentUpdates = recentUpdatesRes.rows.map(up => ({
      ...formatUpdate(up),
      userId: {
        id: up.user_id,
        _id: up.user_id,
        name: up.user_name,
        email: up.user_email
      },
      plantId: {
        id: up.plant_id,
        _id: up.plant_id,
        commonName: up.plant_common_name,
        scientificName: up.plant_scientific_name
      }
    }));

    const recentPlants = recentPlantsRes.rows.map(p => ({
      ...formatPlant(p),
      userId: {
        id: p.user_id,
        _id: p.user_id,
        name: p.user_name,
        email: p.user_email
      }
    }));

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

    const resUser = await db.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
      [role, req.params.userId]
    );

    if (resUser.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    res.json({ 
      message: 'Role updated', 
      user: formatUser(resUser.rows[0]) 
    });
  } catch (err) {
    console.error('Admin change role error:', err);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

module.exports = router;
