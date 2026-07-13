-- ══════════════════════════════════════════════
-- BOTANICO FINAL DATABASE SCHEMA (MIGRATION 001)
-- ══════════════════════════════════════════════

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS updates CASCADE;
DROP TABLE IF EXISTS plant_images CASCADE;
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ─── Users Table ──────────────────────────────────
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    display_id VARCHAR UNIQUE NOT NULL, -- Format: usr_<uuid>
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    avatar_url VARCHAR,
    provider VARCHAR DEFAULT 'local', -- 'local', 'google', 'microsoft'
    password_hash VARCHAR, -- NULL for OAuth users
    preferred_language VARCHAR DEFAULT 'en', -- 'en', 'ta', 'ml', 'te'
    role VARCHAR DEFAULT 'student', -- 'student', 'faculty', 'admin'
    location VARCHAR,
    reset_password_token VARCHAR,
    reset_password_expires TIMESTAMP,
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
    family VARCHAR,
    genus VARCHAR,
    species VARCHAR,
    variety VARCHAR,
    plant_type VARCHAR,
    growth_habit VARCHAR,
    native_region VARCHAR,
    description TEXT,
    planting_date DATE NOT NULL,
    planting_season VARCHAR, -- 'Spring', 'Summer', 'Monsoon', etc.
    environment_condition VARCHAR, -- 'Full Sun', 'Full Shade', etc.
    is_public BOOLEAN DEFAULT false,
    status VARCHAR DEFAULT 'active', -- 'active', 'deleted'
    location VARCHAR,
    soil_type VARCHAR,
    sunlight_exposure VARCHAR,
    planting_method VARCHAR,
    expected_harvest_days INTEGER,
    habitat VARCHAR,
    classification_group VARCHAR,
    location_text VARCHAR,
    coordinates JSONB, -- { lat: Number, lng: Number }
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ─── Plant Images Table ────────────────────────────
CREATE TABLE plant_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    drive_file_id VARCHAR NOT NULL,
    display_url VARCHAR NOT NULL,
    image_type VARCHAR, -- 'thumbnail', 'timeline', 'profile'
    original_filename VARCHAR,
    taken_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ─── Updates (Care Logs) Table ─────────────────────
CREATE TABLE updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    day_number INTEGER NOT NULL,
    title VARCHAR,
    observations TEXT,
    height_cm DECIMAL(10, 2),
    width_cm DECIMAL(10, 2),
    leaf_count INTEGER,
    flowering_stage VARCHAR,
    fruiting_stage VARCHAR,
    health_status VARCHAR,
    stem_diameter_mm DECIMAL(10, 2),
    root_observations TEXT,
    pest_issues TEXT,
    disease_observations TEXT,
    environmental_stress TEXT,
    care_actions JSONB, -- Array of strings
    drive_photos JSONB, -- Array of photo metadata objects
    temperature_celsius DECIMAL(5, 2),
    humidity_percent DECIMAL(5, 2),
    soil_ph DECIMAL(4, 2),
    soil_moisture VARCHAR,
    notes TEXT,
    fertilizer_used BOOLEAN DEFAULT false,
    fertilizer_name VARCHAR,
    fertilizer_type VARCHAR,
    dosage VARCHAR,
    application_method VARCHAR,
    fertilizer_notes TEXT,
    environment_condition VARCHAR,
    coordinates JSONB, -- { lat: Number, lng: Number }
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ─── Marketplace Listings Table ─────────────────────
CREATE TABLE listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    description TEXT,
    price_amount DECIMAL(12, 2) NOT NULL,
    price_currency VARCHAR DEFAULT 'INR',
    category VARCHAR DEFAULT 'Plant', -- 'Plant', 'Seed', 'Cutting', 'Fertilizer', 'Other'
    listing_type VARCHAR DEFAULT 'Sale', -- 'Sale', 'Trade', 'Giveaway'
    images JSONB, -- Array of image URLs
    location_city VARCHAR,
    location_state VARCHAR,
    location_coordinates JSONB, -- { lat: Number, lng: Number }
    status VARCHAR DEFAULT 'Active', -- 'Active', 'Sold', 'Pending', 'Closed'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ─── Reminders Table ──────────────────────────────
CREATE TABLE reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
    task_name VARCHAR NOT NULL,
    due_date TIMESTAMP NOT NULL,
    remind_at TIMESTAMP,
    frequency VARCHAR DEFAULT 'Once', -- 'Once', 'Daily', 'Weekly', 'Bi-weekly', 'Monthly'
    priority VARCHAR DEFAULT 'Medium', -- 'Low', 'Medium', 'High'
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ─── Achievements Table ────────────────────────────
CREATE TABLE achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR DEFAULT 'Award',
    category VARCHAR DEFAULT 'Growth', -- 'Consistency', 'Science', 'Community', 'Growth'
    rarity VARCHAR DEFAULT 'Common', -- 'Common', 'Rare', 'Epic', 'Legendary'
    unlocked_at TIMESTAMP DEFAULT NOW(),
    points INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ─── Indexes ───────────────────────────────────────
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_plants_user_id ON plants(user_id);
CREATE INDEX idx_plants_status ON plants(status);
CREATE INDEX idx_updates_plant_id ON updates(plant_id);
CREATE INDEX idx_updates_entry_date ON updates(entry_date);
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_due_date ON reminders(due_date);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);

-- ─── Triggers for updated_at ───────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON plants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_updates_updated_at BEFORE UPDATE ON updates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
