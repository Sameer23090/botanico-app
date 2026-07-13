const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const poolConfig = {
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'botanico',
  port: parseInt(process.env.PGPORT || '5432', 10),
};

const connectionString = process.env.DATABASE_URL;
const isProd = process.env.NODE_ENV === 'production';

const pool = new Pool(
  connectionString 
    ? { connectionString, ssl: isProd ? { rejectUnauthorized: false } : false }
    : { ...poolConfig, ssl: isProd ? { rejectUnauthorized: false } : false }
);

async function run() {
  try {
    console.log('🐘 Connecting to PostgreSQL...');
    const client = await pool.connect();
    console.log('🐘 Connected successfully!');

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'migrations', '001_full_schema.sql');
    console.log(`📂 Reading schema file from: ${schemaPath}`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('⚙️ Creating database tables and triggers...');
    await client.query(schemaSql);
    console.log('✅ Schema migration completed!');

    console.log('🌱 Seeding demo data...');
    
    // Seed Admin User
    const adminEmail = 'master@botanico.live';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'BotanicoMaster!2026', salt);
    
    const userRes = await client.query(
      `INSERT INTO users (display_id, email, name, password_hash, role, provider)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      ['usr_master_admin_display_id_2026', adminEmail, 'System Director', passwordHash, 'admin', 'local']
    );
    const userId = userRes.rows[0].id;
    console.log(`👤 Seeded User: ${adminEmail} (ID: ${userId})`);

    // Seed Plant
    const plantRes = await client.query(
      `INSERT INTO plants (display_id, user_id, common_name, scientific_name, planting_date, status)
       VALUES ($1, $2, $3, $4, NOW(), 'active')
       RETURNING id`,
      ['plt_demo_rose_display_id_2026', userId, 'Demo Rose', 'Rosa demo']
    );
    const plantId = plantRes.rows[0].id;
    console.log(`🌹 Seeded Plant: Demo Rose (ID: ${plantId})`);

    // Seed Listings
    await client.query(
      `INSERT INTO listings (user_id, plant_id, title, description, price_amount, price_currency, category, listing_type, location_city, location_state, status)
       VALUES 
       ($1, $2, $3, $4, 2500, 'INR', 'Plant', 'Sale', 'Bangalore', 'Karnataka', 'Active'),
       ($1, $2, $5, $6, 200, 'INR', 'Seed', 'Sale', 'Pune', 'Maharashtra', 'Active')`,
      [
        userId, 
        plantId, 
        'Rare Variegated Monstera', 
        'Well-rooted cutting with beautiful variegation.',
        'Organic Sunflower Seeds (Batch 2024)',
        'High germination rate, sun-dried.'
      ]
    );
    console.log('🛍️ Seeded Marketplace Listings');

    // Seed Reminders
    await client.query(
      `INSERT INTO reminders (user_id, plant_id, task_name, due_date, priority, notes)
       VALUES 
       ($1, $2, 'Watering the Orchid', NOW() + INTERVAL '1 day', 'High', 'Use distilled water only.'),
       ($1, $2, 'Monthly Fertilizer Mix', NOW() + INTERVAL '7 days', 'Medium', '')`,
      [userId, plantId]
    );
    console.log('⏰ Seeded Reminders');

    console.log('🎉 Seeding completed successfully!');
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration and seeding failed:', err);
    process.exit(1);
  }
}

run();
