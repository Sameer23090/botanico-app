const { Pool } = require('pg');
const dbQueries = require('./db/dbQueries');
const connectDB = require('./config/database');
require('dotenv').config();

async function verify() {
  try {
    console.log('🔌 Connecting to Postgres database...');
    await connectDB();
    console.log('🟢 Postgres connected successfully!');

    console.log('\n--- 1. Testing User Queries ---');
    const testEmail = `test_${Date.now()}@botanico.live`;
    const newUser = await dbQueries.users.create({
      name: 'Test Botanist',
      email: testEmail,
      passwordHash: 'testpass123',
      location: 'Test Garden',
      provider: 'local',
      role: 'student'
    });
    console.log('✔️ Created User:', newUser.email, `(ID: ${newUser.id})`);

    const fetchedUser = await dbQueries.users.findByEmail(testEmail);
    console.log('✔️ Fetched User by Email:', fetchedUser.name);

    const updatedUser = await dbQueries.users.update(newUser.id, {
      location: 'Updated Test Garden'
    });
    console.log('✔️ Updated User Location:', updatedUser.location);

    console.log('\n--- 2. Testing Plant Queries ---');
    const newPlant = await dbQueries.plants.create({
      userId: newUser.id,
      commonName: 'Test Fern',
      scientificName: 'Polypodiopsida test',
      plantingDate: new Date(),
      plantType: 'Fern',
      isPublic: true
    });
    console.log('✔️ Created Plant:', newPlant.commonName, `(ID: ${newPlant.id})`);

    const userPlants = await dbQueries.plants.findActiveByUserId(newUser.id);
    console.log('✔️ Active Plants for User count:', userPlants.length);

    console.log('\n--- 3. Testing Update Queries ---');
    const newUpdate = await dbQueries.updates.create({
      plantId: newPlant.id,
      userId: newUser.id,
      entryDate: new Date(),
      dayNumber: 1,
      title: 'First Observation',
      observations: 'Fern looks green and healthy.',
      heightCm: 12.5,
      careActions: ['Watered', 'Misted']
    });
    console.log('✔️ Created Update:', newUpdate.title, `(ID: ${newUpdate.id})`);

    const plantUpdates = await dbQueries.updates.findByPlantId(newPlant.id);
    console.log('✔️ Fetch Updates for Plant count:', plantUpdates.length);
    console.log('   Observations:', plantUpdates[0].observations);

    const stats = await dbQueries.plants.getStats(newPlant.id);
    console.log('✔️ Fetch Plant Aggregated Stats:', stats);

    console.log('\n--- 4. Cleanup Test Data ---');
    // Delete update
    await dbQueries.updates.delete(newUpdate.id);
    console.log('✔️ Deleted Update');

    // Delete plant (mark as deleted)
    await dbQueries.plants.delete(newPlant.id, newUser.id);
    console.log('✔️ Marked Plant as Deleted');

    // Delete user from DB (hard delete for cleanup)
    const db = require('./config/database');
    await db.query('DELETE FROM users WHERE id = $1', [newUser.id]);
    console.log('✔️ Hard Deleted Test User');

    console.log('\n🎉 ALL DATABASE QUERIES VERIFIED SUCCESSFULLY!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verify();
