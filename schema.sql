-- Botanico Database Schema
-- Scientific Plant Tracking System

-- Drop existing tables if they exist
DROP TABLE IF EXISTS updates CASCADE;
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plants table with scientific fields
CREATE TABLE plants (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    common_name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    family VARCHAR(255),
    genus VARCHAR(255),
    species VARCHAR(255),
    variety VARCHAR(255),
    plant_type VARCHAR(100),
    growth_habit VARCHAR(100),
    native_region VARCHAR(255),
    description TEXT,
    planting_date DATE NOT NULL,
    first_photo_url TEXT,
    location VARCHAR(255),
    soil_type VARCHAR(100),
    sunlight_exposure VARCHAR(50),
    planting_method VARCHAR(100),
    expected_harvest_days INTEGER,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Updates/Entries table with detailed botanical observations
CREATE TABLE updates (
    id SERIAL PRIMARY KEY,
    plant_id INTEGER REFERENCES plants(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    day_number INTEGER NOT NULL,
    title VARCHAR(255),
    observations TEXT,
    height_cm DECIMAL(10, 2),
    width_cm DECIMAL(10, 2),
    leaf_count INTEGER,
    flowering_stage VARCHAR(100),
    fruiting_stage VARCHAR(100),
    health_status VARCHAR(50),
    stem_diameter_mm DECIMAL(10, 2),
    root_observations TEXT,
    pest_issues TEXT,
    disease_observations TEXT,
    environmental_stress TEXT,
    care_actions JSONB,
    photos JSONB,
    temperature_celsius DECIMAL(5, 2),
    humidity_percent DECIMAL(5, 2),
    soil_ph DECIMAL(4, 2),
    soil_moisture VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_plants_user_id ON plants(user_id);
CREATE INDEX idx_plants_status ON plants(status);
CREATE INDEX idx_updates_plant_id ON updates(plant_id);
CREATE INDEX idx_updates_entry_date ON updates(entry_date);
CREATE INDEX idx_users_email ON users(email);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON plants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_updates_updated_at BEFORE UPDATE ON updates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample plant families for reference
COMMENT ON COLUMN plants.family IS 'Botanical family (e.g., Solanaceae, Rosaceae)';
COMMENT ON COLUMN plants.genus IS 'Genus name (e.g., Solanum, Rosa)';
COMMENT ON COLUMN plants.species IS 'Species name (e.g., lycopersicum, damascena)';
COMMENT ON COLUMN plants.growth_habit IS 'Annual, Perennial, Biennial, etc.';
COMMENT ON COLUMN updates.flowering_stage IS 'Vegetative, Budding, Blooming, Senescent, etc.';
COMMENT ON COLUMN updates.fruiting_stage IS 'Fruit set, Development, Ripening, Mature, etc.';
