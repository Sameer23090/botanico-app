-- ══════════════════════════════════════════════
-- BOTANICO FINAL DATABASE SCHEMA (MIGRATION 001)
-- ══════════════════════════════════════════════
-- Note: While the current app uses MongoDB, this SQL migration 
-- is provided for PostgreSQL compatibility as requested.

-- ─── Users Table ──────────────────────────────────
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    display_id VARCHAR UNIQUE NOT NULL, -- Format: usr_<uuid>
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR,
    avatar_url VARCHAR,
    provider VARCHAR DEFAULT 'local', -- 'local', 'google', 'microsoft'
    password_hash VARCHAR, -- NULL for OAuth users
    preferred_language VARCHAR DEFAULT 'en', -- 'en', 'ta', 'ml', 'te'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ─── Plants Table ──────────────────────────────────
CREATE TABLE plants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    display_id VARCHAR UNIQUE NOT NULL, -- Format: plt_<uuid>
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    common_name VARCHAR NOT NULL,
    scientific_name VARCHAR,
    description TEXT,
    planting_season VARCHAR, -- 'Spring', 'Summer', 'Monsoon', etc.
    environment_condition VARCHAR, -- 'Full Sun', 'Full Shade', etc.
    is_public BOOLEAN DEFAULT false,
    status VARCHAR DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ─── Plant Images Table ────────────────────────────
CREATE TABLE plant_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    drive_file_id VARCHAR NOT NULL,
    display_url VARCHAR NOT NULL,
    image_type VARCHAR, -- 'thumbnail', 'timeline', 'profile'
    original_filename VARCHAR,
    taken_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ─── Care Logs (Updates) Table ─────────────────────
CREATE TABLE care_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR NOT NULL, -- Maps to title in some parts
    notes TEXT,
    environment_condition VARCHAR,
    fertilizer_used BOOLEAN DEFAULT false,
    fertilizer_name VARCHAR,
    fertilizer_type VARCHAR,
    dosage VARCHAR,
    application_method VARCHAR,
    fertilizer_notes TEXT,
    logged_at TIMESTAMP DEFAULT NOW()
);

-- ─── Indexes ───────────────────────────────────────
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_plants_user_id ON plants(user_id);
CREATE INDEX idx_care_logs_plant_id ON care_logs(plant_id);
