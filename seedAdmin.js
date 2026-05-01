/**
 * seedAdmin.js — Run once to create the admin user in MongoDB
 * Usage: node seedAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const ADMIN_CREDENTIALS = {
  name: 'System Director',
  email: 'master@botanico.live',
  password: 'BotanicoMaster!2026',
  role: 'admin',
};

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await User.findOne({ email: ADMIN_CREDENTIALS.email });
    if (existing) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Email: ${ADMIN_CREDENTIALS.email}`);
      console.log(`   Role:  ${existing.role}`);
      await mongoose.disconnect();
      return;
    }

    const admin = await User.create({
      name: ADMIN_CREDENTIALS.name,
      email: ADMIN_CREDENTIALS.email,
      passwordHash: ADMIN_CREDENTIALS.password,
      role: 'admin',
      provider: 'local',
      displayId: 'USR_ADMIN_001',
      location: 'Admin Office',
    });

    console.log('\n🌱 Admin user created successfully!\n');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│           ADMIN LOGIN CREDENTIALS        │');
    console.log('├─────────────────────────────────────────┤');
    console.log(`│  Email   : ${ADMIN_CREDENTIALS.email}      │`);
    console.log(`│  Password: ${ADMIN_CREDENTIALS.password}    │`);
    console.log('│  Role    : admin                         │');
    console.log('│  URL     : http://localhost:5173/admin   │');
    console.log('└─────────────────────────────────────────┘\n');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seedAdmin();
