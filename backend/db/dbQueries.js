const db = require('../config/database');
const crypto = require('crypto');

// Helpers for model conversion to match MongoDB output format (to prevent frontend breaking)
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
    passwordHash: u.password_hash,
    location: u.location,
    role: u.role,
    resetPasswordToken: u.reset_password_token,
    resetPasswordExpires: u.reset_password_expires,
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

const formatReminder = (r) => {
  if (!r) return null;
  return {
    id: r.id,
    _id: r.id,
    userId: r.user_id,
    plantId: r.plant_id,
    taskName: r.task_name,
    dueDate: r.due_date,
    remindAt: r.remind_at,
    frequency: r.frequency,
    priority: r.priority,
    isCompleted: r.is_completed,
    completedAt: r.completed_at,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
};

const formatAchievement = (a) => {
  if (!a) return null;
  return {
    id: a.id,
    _id: a.id,
    userId: a.user_id,
    title: a.title,
    description: a.description,
    icon: a.icon,
    category: a.category,
    rarity: a.rarity,
    unlockedAt: a.unlocked_at,
    points: a.points,
    createdAt: a.created_at,
    updatedAt: a.updated_at
  };
};

// ─── Users Queries ──────────────────────────────────────────────────────────
const users = {
  findById: async (id) => {
    const res = await db.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
    return formatUser(res.rows[0]);
  },
  findByEmail: async (email) => {
    if (!email) return null;
    const res = await db.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email.toLowerCase().trim()]);
    return formatUser(res.rows[0]);
  },
  findByResetToken: async (token) => {
    const res = await db.query(
      'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > $2 LIMIT 1',
      [token, new Date()]
    );
    return formatUser(res.rows[0]);
  },
  create: async (data) => {
    const displayId = data.displayId || `usr_${crypto.randomUUID()}`;
    const res = await db.query(
      `INSERT INTO users (
        display_id, email, name, avatar_url, provider, password_hash, preferred_language, role, location
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        displayId,
        data.email.toLowerCase().trim(),
        data.name,
        data.avatarUrl || null,
        data.provider || 'local',
        data.passwordHash || null,
        data.preferredLanguage || 'en',
        data.role || 'student',
        data.location || null
      ]
    );
    return formatUser(res.rows[0]);
  },
  update: async (id, data) => {
    const res = await db.query(
      `UPDATE users SET 
        name = COALESCE($1, name),
        avatar_url = COALESCE($2, avatar_url),
        provider = COALESCE($3, provider),
        password_hash = COALESCE($4, password_hash),
        preferred_language = COALESCE($5, preferred_language),
        role = COALESCE($6, role),
        location = COALESCE($7, location),
        reset_password_token = COALESCE($8, reset_password_token),
        reset_password_expires = COALESCE($9, reset_password_expires)
      WHERE id = $10 RETURNING *`,
      [
        data.name !== undefined ? data.name : null,
        data.avatarUrl !== undefined ? data.avatarUrl : null,
        data.provider !== undefined ? data.provider : null,
        data.passwordHash !== undefined ? data.passwordHash : null,
        data.preferredLanguage !== undefined ? data.preferredLanguage : null,
        data.role !== undefined ? data.role : null,
        data.location !== undefined ? data.location : null,
        data.resetPasswordToken !== undefined ? data.resetPasswordToken : null,
        data.resetPasswordExpires !== undefined ? data.resetPasswordExpires : null,
        id
      ]
    );
    return formatUser(res.rows[0]);
  },
  count: async () => {
    const res = await db.query('SELECT COUNT(*) FROM users');
    return parseInt(res.rows[0].count, 10);
  }
};

// ─── Plants Queries ─────────────────────────────────────────────────────────
const plants = {
  findActiveByUserId: async (userId) => {
    const res = await db.query(
      'SELECT * FROM plants WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC',
      [userId, 'active']
    );
    return res.rows.map(formatPlant);
  },
  findById: async (id) => {
    const res = await db.query('SELECT * FROM plants WHERE id = $1 LIMIT 1', [id]);
    return formatPlant(res.rows[0]);
  },
  create: async (data) => {
    const displayId = data.displayId || `plt_${crypto.randomUUID()}`;
    const res = await db.query(
      `INSERT INTO plants (
        display_id, user_id, common_name, scientific_name, family, genus, species, variety,
        plant_type, growth_habit, native_region, description, planting_date, planting_season,
        environment_condition, is_public, status, location, soil_type, sunlight_exposure,
        planting_method, expected_harvest_days, habitat, classification_group, location_text, coordinates
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26) RETURNING *`,
      [
        displayId,
        data.userId,
        data.commonName,
        data.scientificName || null,
        data.family || null,
        data.genus || null,
        data.species || null,
        data.variety || null,
        data.plantType || null,
        data.growthHabit || null,
        data.nativeRegion || null,
        data.description || null,
        data.plantingDate,
        data.plantingSeason || null,
        data.environmentCondition || null,
        data.isPublic !== undefined ? data.isPublic : false,
        data.status || 'active',
        data.location || null,
        data.soilType || null,
        data.sunlightExposure || null,
        data.plantingMethod || null,
        data.expectedHarvestDays || null,
        data.habitat || null,
        data.classificationGroup || null,
        data.locationText || null,
        data.coordinates ? JSON.stringify(data.coordinates) : null
      ]
    );
    return formatPlant(res.rows[0]);
  },
  update: async (id, data) => {
    const res = await db.query(
      `UPDATE plants SET
        common_name = COALESCE($1, common_name),
        scientific_name = COALESCE($2, scientific_name),
        family = COALESCE($3, family),
        genus = COALESCE($4, genus),
        species = COALESCE($5, species),
        variety = COALESCE($6, variety),
        plant_type = COALESCE($7, plant_type),
        growth_habit = COALESCE($8, growth_habit),
        native_region = COALESCE($9, native_region),
        description = COALESCE($10, description),
        location = COALESCE($11, location),
        soil_type = COALESCE($12, soil_type),
        sunlight_exposure = COALESCE($13, sunlight_exposure),
        planting_method = COALESCE($14, planting_method),
        expected_harvest_days = COALESCE($15, expected_harvest_days),
        status = COALESCE($16, status),
        planting_season = COALESCE($17, planting_season),
        environment_condition = COALESCE($18, environment_condition),
        is_public = COALESCE($19, is_public)
      WHERE id = $20 RETURNING *`,
      [
        data.commonName !== undefined ? data.commonName : null,
        data.scientificName !== undefined ? data.scientificName : null,
        data.family !== undefined ? data.family : null,
        data.genus !== undefined ? data.genus : null,
        data.species !== undefined ? data.species : null,
        data.variety !== undefined ? data.variety : null,
        data.plantType !== undefined ? data.plantType : null,
        data.growthHabit !== undefined ? data.growthHabit : null,
        data.nativeRegion !== undefined ? data.nativeRegion : null,
        data.description !== undefined ? data.description : null,
        data.location !== undefined ? data.location : null,
        data.soilType !== undefined ? data.soilType : null,
        data.sunlightExposure !== undefined ? data.sunlightExposure : null,
        data.plantingMethod !== undefined ? data.plantingMethod : null,
        data.expectedHarvestDays !== undefined ? data.expectedHarvestDays : null,
        data.status !== undefined ? data.status : null,
        data.plantingSeason !== undefined ? data.plantingSeason : null,
        data.environmentCondition !== undefined ? data.environmentCondition : null,
        data.isPublic !== undefined ? data.isPublic : null,
        id
      ]
    );
    return formatPlant(res.rows[0]);
  },
  delete: async (id, userId) => {
    const res = await db.query(
      'UPDATE plants SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      ['deleted', id, userId]
    );
    return formatPlant(res.rows[0]);
  },
  count: async () => {
    const res = await db.query("SELECT COUNT(*) FROM plants WHERE status = 'active'");
    return parseInt(res.rows[0].count, 10);
  },
  getStats: async (plantId) => {
    const res = await db.query(
      `SELECT 
        COUNT(*)::integer as "updateCount",
        MAX(entry_date) as "lastUpdateDate",
        AVG(height_cm)::float as "avgHeight",
        MAX(height_cm)::float as "maxHeight",
        COALESCE(SUM(CASE WHEN jsonb_array_length(drive_photos) > 0 THEN 1 ELSE 0 END), 0)::integer as "photoCount"
      FROM updates 
      WHERE plant_id = $1`,
      [plantId]
    );
    return res.rows[0] || { updateCount: 0, lastUpdateDate: null, avgHeight: null, maxHeight: null, photoCount: 0 };
  }
};

// ─── Updates (Timeline Logs) Queries ─────────────────────────────────────────
const updates = {
  findByPlantId: async (plantId) => {
    const res = await db.query(
      'SELECT * FROM updates WHERE plant_id = $1 ORDER BY entry_date DESC, created_at DESC',
      [plantId]
    );
    return res.rows.map(formatUpdate);
  },
  findById: async (id) => {
    const res = await db.query('SELECT * FROM updates WHERE id = $1 LIMIT 1', [id]);
    return formatUpdate(res.rows[0]);
  },
  create: async (data) => {
    const res = await db.query(
      `INSERT INTO updates (
        plant_id, user_id, entry_date, day_number, title, observations, height_cm, width_cm, leaf_count,
        flowering_stage, fruiting_stage, health_status, stem_diameter_mm, root_observations, pest_issues,
        disease_observations, environmental_stress, care_actions, drive_photos, temperature_celsius,
        humidity_percent, soil_ph, soil_moisture, notes, fertilizer_used, fertilizer_name, fertilizer_type,
        dosage, application_method, fertilizer_notes, environment_condition, coordinates
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32) RETURNING *`,
      [
        data.plantId,
        data.userId,
        data.entryDate,
        data.dayNumber,
        data.title || null,
        data.observations || null,
        data.heightCm || null,
        data.widthCm || null,
        data.leafCount || null,
        data.floweringStage || null,
        data.fruitingStage || null,
        data.healthStatus || null,
        data.stemDiameterMm || null,
        data.rootObservations || null,
        data.pestIssues || null,
        data.diseaseObservations || null,
        data.environmentalStress || null,
        data.careActions ? JSON.stringify(data.careActions) : null,
        data.drivePhotos ? JSON.stringify(data.drivePhotos) : null,
        data.temperatureCelsius || null,
        data.humidityPercent || null,
        data.soilPh || null,
        data.soilMoisture || null,
        data.notes || null,
        data.fertilizerUsed !== undefined ? data.fertilizerUsed : false,
        data.fertilizerName || null,
        data.fertilizerType || null,
        data.dosage || null,
        data.applicationMethod || null,
        data.fertilizerNotes || null,
        data.environmentCondition || null,
        data.coordinates ? JSON.stringify(data.coordinates) : null
      ]
    );
    return formatUpdate(res.rows[0]);
  },
  update: async (id, data) => {
    const res = await db.query(
      `UPDATE updates SET
        title = COALESCE($1, title),
        observations = COALESCE($2, observations),
        entry_date = COALESCE($3, entry_date),
        height_cm = COALESCE($4, height_cm),
        width_cm = COALESCE($5, width_cm),
        leaf_count = COALESCE($6, leaf_count),
        flowering_stage = COALESCE($7, flowering_stage),
        fruiting_stage = COALESCE($8, fruiting_stage),
        health_status = COALESCE($9, health_status),
        stem_diameter_mm = COALESCE($10, stem_diameter_mm),
        root_observations = COALESCE($11, root_observations),
        pest_issues = COALESCE($12, pest_issues),
        disease_observations = COALESCE($13, disease_observations),
        environmental_stress = COALESCE($14, environmental_stress),
        temperature_celsius = COALESCE($15, temperature_celsius),
        humidity_percent = COALESCE($16, humidity_percent),
        soil_ph = COALESCE($17, soil_ph),
        soil_moisture = COALESCE($18, soil_moisture),
        notes = COALESCE($19, notes),
        fertilizer_used = COALESCE($20, fertilizer_used),
        fertilizer_name = COALESCE($21, fertilizer_name),
        fertilizer_type = COALESCE($22, fertilizer_type),
        dosage = COALESCE($23, dosage),
        application_method = COALESCE($24, application_method),
        fertilizer_notes = COALESCE($25, fertilizer_notes),
        environment_condition = COALESCE($26, environment_condition),
        coordinates = COALESCE($27, coordinates),
        care_actions = COALESCE($28, care_actions),
        drive_photos = COALESCE($29, drive_photos)
      WHERE id = $30 RETURNING *`,
      [
        data.title !== undefined ? data.title : null,
        data.observations !== undefined ? data.observations : null,
        data.entryDate !== undefined ? data.entryDate : null,
        data.heightCm !== undefined ? data.heightCm : null,
        data.widthCm !== undefined ? data.widthCm : null,
        data.leafCount !== undefined ? data.leafCount : null,
        data.floweringStage !== undefined ? data.floweringStage : null,
        data.fruitingStage !== undefined ? data.fruitingStage : null,
        data.healthStatus !== undefined ? data.healthStatus : null,
        data.stemDiameterMm !== undefined ? data.stemDiameterMm : null,
        data.rootObservations !== undefined ? data.rootObservations : null,
        data.pestIssues !== undefined ? data.pestIssues : null,
        data.diseaseObservations !== undefined ? data.diseaseObservations : null,
        data.environmentalStress !== undefined ? data.environmentalStress : null,
        data.temperatureCelsius !== undefined ? data.temperatureCelsius : null,
        data.humidityPercent !== undefined ? data.humidityPercent : null,
        data.soilPh !== undefined ? data.soilPh : null,
        data.soilMoisture !== undefined ? data.soilMoisture : null,
        data.notes !== undefined ? data.notes : null,
        data.fertilizerUsed !== undefined ? data.fertilizerUsed : null,
        data.fertilizerName !== undefined ? data.fertilizerName : null,
        data.fertilizerType !== undefined ? data.fertilizerType : null,
        data.dosage !== undefined ? data.dosage : null,
        data.applicationMethod !== undefined ? data.applicationMethod : null,
        data.fertilizerNotes !== undefined ? data.fertilizerNotes : null,
        data.environmentCondition !== undefined ? data.environmentCondition : null,
        data.coordinates !== undefined ? (data.coordinates ? JSON.stringify(data.coordinates) : null) : null,
        data.careActions !== undefined ? (data.careActions ? JSON.stringify(data.careActions) : null) : null,
        data.drivePhotos !== undefined ? (data.drivePhotos ? JSON.stringify(data.drivePhotos) : null) : null,
        id
      ]
    );
    return formatUpdate(res.rows[0]);
  },
  delete: async (id) => {
    const res = await db.query('DELETE FROM updates WHERE id = $1 RETURNING *', [id]);
    return formatUpdate(res.rows[0]);
  }
};

// ─── Marketplace (Listings) Queries ──────────────────────────────────────────
const listings = {
  find: async (filters) => {
    let queryText = `
      SELECT l.*, 
             u.name as user_name, u.avatar_url as user_avatar_url,
             p.common_name as plant_common_name, p.scientific_name as plant_scientific_name
      FROM listings l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN plants p ON l.plant_id = p.id
      WHERE l.status = $1
    `;
    const params = [filters.status || 'Active'];
    let paramIndex = 2;

    if (filters.category) {
      queryText += ` AND l.category = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    if (filters.listingType) {
      queryText += ` AND l.listing_type = $${paramIndex}`;
      params.push(filters.listingType);
      paramIndex++;
    }

    if (filters.city) {
      queryText += ` AND l.location_city ILIKE $${paramIndex}`;
      params.push(`%${filters.city}%`);
      paramIndex++;
    }

    if (filters.minPrice) {
      queryText += ` AND l.price_amount >= $${paramIndex}`;
      params.push(filters.minPrice);
      paramIndex++;
    }

    if (filters.maxPrice) {
      queryText += ` AND l.price_amount <= $${paramIndex}`;
      params.push(filters.maxPrice);
      paramIndex++;
    }

    queryText += ' ORDER BY l.created_at DESC';

    const res = await db.query(queryText, params);

    return res.rows.map(r => ({
      id: r.id,
      _id: r.id,
      title: r.title,
      description: r.description,
      price: {
        amount: parseFloat(r.price_amount),
        currency: r.price_currency
      },
      category: r.category,
      listingType: r.listing_type,
      images: r.images || [],
      location: {
        city: r.location_city,
        state: r.location_state,
        coordinates: r.location_coordinates
      },
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      userId: {
        id: r.user_id,
        _id: r.user_id,
        name: r.user_name,
        avatarUrl: r.user_avatar_url
      },
      plantId: {
        id: r.plant_id,
        _id: r.plant_id,
        commonName: r.plant_common_name,
        scientificName: r.plant_scientific_name
      }
    }));
  },
  findByUserId: async (userId) => {
    const queryText = `
      SELECT l.*, 
             u.name as user_name, u.avatar_url as user_avatar_url,
             p.common_name as plant_common_name, p.scientific_name as plant_scientific_name
      FROM listings l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN plants p ON l.plant_id = p.id
      WHERE l.user_id = $1
      ORDER BY l.created_at DESC
    `;
    const res = await db.query(queryText, [userId]);
    return res.rows.map(r => ({
      id: r.id,
      _id: r.id,
      title: r.title,
      description: r.description,
      price: {
        amount: parseFloat(r.price_amount),
        currency: r.price_currency
      },
      category: r.category,
      listingType: r.listing_type,
      images: r.images || [],
      location: {
        city: r.location_city,
        state: r.location_state,
        coordinates: r.location_coordinates
      },
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      userId: {
        id: r.user_id,
        _id: r.user_id,
        name: r.user_name,
        avatarUrl: r.user_avatar_url
      },
      plantId: {
        id: r.plant_id,
        _id: r.plant_id,
        commonName: r.plant_common_name,
        scientificName: r.plant_scientific_name
      }
    }));
  },
  create: async (data) => {
    const res = await db.query(
      `INSERT INTO listings (
        user_id, plant_id, title, description, price_amount, price_currency, category,
        listing_type, images, location_city, location_state, location_coordinates, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        data.userId,
        data.plantId,
        data.title,
        data.description || null,
        data.price && data.price.amount !== undefined ? data.price.amount : 0,
        data.price && data.price.currency ? data.price.currency : 'INR',
        data.category || 'Plant',
        data.listingType || 'Sale',
        data.images ? JSON.stringify(data.images) : null,
        data.location ? data.location.city : null,
        data.location ? data.location.state : null,
        data.location && data.location.coordinates ? JSON.stringify(data.location.coordinates) : null,
        data.status || 'Active'
      ]
    );
    const r = res.rows[0];
    return {
      id: r.id,
      _id: r.id,
      title: r.title,
      description: r.description,
      price: {
        amount: parseFloat(r.price_amount),
        currency: r.price_currency
      },
      category: r.category,
      listingType: r.listing_type,
      images: r.images || [],
      location: {
        city: r.location_city,
        state: r.location_state,
        coordinates: r.location_coordinates
      },
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      userId: r.user_id,
      plantId: r.plant_id
    };
  }
};

// ─── Reminders Queries ───────────────────────────────────────────────────────
const reminders = {
  findActiveByUserId: async (userId) => {
    const res = await db.query(
      `SELECT r.*, p.common_name, p.display_id as plant_display_id
       FROM reminders r
       LEFT JOIN plants p ON r.plant_id = p.id
       WHERE r.user_id = $1 AND r.is_completed = false
       ORDER BY r.due_date ASC`,
      [userId]
    );
    return res.rows.map(r => ({
      ...formatReminder(r),
      plantId: {
        id: r.plant_id,
        _id: r.plant_id,
        commonName: r.common_name,
        displayId: r.plant_display_id
      }
    }));
  },
  findById: async (id) => {
    const res = await db.query('SELECT * FROM reminders WHERE id = $1 LIMIT 1', [id]);
    return formatReminder(res.rows[0]);
  },
  create: async (data) => {
    const res = await db.query(
      `INSERT INTO reminders (
        user_id, plant_id, task_name, due_date, remind_at, frequency, priority, is_completed, completed_at, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        data.userId,
        data.plantId,
        data.taskName,
        data.dueDate,
        data.remindAt || null,
        data.frequency || 'Once',
        data.priority || 'Medium',
        data.isCompleted !== undefined ? data.isCompleted : false,
        data.completedAt || null,
        data.notes || null
      ]
    );
    return formatReminder(res.rows[0]);
  },
  update: async (id, data) => {
    const res = await db.query(
      `UPDATE reminders SET
        task_name = COALESCE($1, task_name),
        due_date = COALESCE($2, due_date),
        remind_at = COALESCE($3, remind_at),
        frequency = COALESCE($4, frequency),
        priority = COALESCE($5, priority),
        is_completed = COALESCE($6, is_completed),
        completed_at = COALESCE($7, completed_at),
        notes = COALESCE($8, notes)
      WHERE id = $9 RETURNING *`,
      [
        data.taskName !== undefined ? data.taskName : null,
        data.dueDate !== undefined ? data.dueDate : null,
        data.remindAt !== undefined ? data.remindAt : null,
        data.frequency !== undefined ? data.frequency : null,
        data.priority !== undefined ? data.priority : null,
        data.isCompleted !== undefined ? data.isCompleted : null,
        data.completedAt !== undefined ? data.completedAt : null,
        data.notes !== undefined ? data.notes : null,
        id
      ]
    );
    return formatReminder(res.rows[0]);
  },
  delete: async (id) => {
    const res = await db.query('DELETE FROM reminders WHERE id = $1 RETURNING *', [id]);
    return formatReminder(res.rows[0]);
  }
};

// ─── Achievements Queries ────────────────────────────────────────────────────
const achievements = {
  findByUserId: async (userId) => {
    const res = await db.query(
      'SELECT * FROM achievements WHERE user_id = $1 ORDER BY unlocked_at DESC',
      [userId]
    );
    return res.rows.map(formatAchievement);
  },
  findByUserAndTitle: async (userId, title) => {
    const res = await db.query(
      'SELECT * FROM achievements WHERE user_id = $1 AND title = $2 LIMIT 1',
      [userId, title]
    );
    return formatAchievement(res.rows[0]);
  },
  create: async (data) => {
    const res = await db.query(
      `INSERT INTO achievements (
        user_id, title, description, icon, category, rarity, unlocked_at, points
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        data.userId,
        data.title,
        data.description,
        data.icon || 'Award',
        data.category || 'Growth',
        data.rarity || 'Common',
        data.unlockedAt || new Date(),
        data.points !== undefined ? data.points : 10
      ]
    );
    return formatAchievement(res.rows[0]);
  }
};

module.exports = {
  users,
  plants,
  updates,
  listings,
  reminders,
  achievements
};
