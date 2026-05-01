const mongoose = require('mongoose');
const Listing = require('./models/Listing');
const Reminder = require('./models/Reminder');
const Plant = require('./models/Plant');
const User = require('./models/User');
require('dotenv').config();

const seedDemo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("🌱 Connected to MongoDB for seeding...");

        let user = await User.findOne({ email: 'master@botanico.live' });
        if (!user) {
            user = await User.create({
                name: 'System Director',
                email: 'master@botanico.live',
                passwordHash: 'BotanicoMaster!2026',
                role: 'admin',
                provider: 'local'
            });
            console.log("👤 Created dummy user...");
        }

        let plant = await Plant.findOne({ userId: user._id });
        if (!plant) {
            plant = await Plant.create({
                userId: user._id,
                commonName: 'Demo Rose',
                scientificName: 'Rosa demo',
                plantingDate: new Date(),
                status: 'active'
            });
            console.log("🌹 Created dummy plant...");
        }

        // 1. Seed Marketplace
        await Listing.deleteMany({});
        await Listing.create([
            {
                userId: user._id,
                plantId: plant._id,
                title: "Rare Variegated Monstera",
                description: "Well-rooted cutting with beautiful variegation.",
                price: { amount: 2500 },
                category: "Plant",
                listingType: "Sale",
                location: { city: "Bangalore", state: "Karnataka" },
                status: "Active"
            },
            {
                userId: user._id,
                plantId: plant._id,
                title: "Organic Sunflower Seeds (Batch 2024)",
                description: "High germination rate, sun-dried.",
                price: { amount: 200 },
                category: "Seed",
                listingType: "Sale",
                location: { city: "Pune", state: "Maharashtra" },
                status: "Active"
            }
        ]);

        // 2. Seed Reminders
        await Reminder.deleteMany({});
        await Reminder.create([
            {
                userId: user._id,
                plantId: plant._id,
                taskName: "Watering the Orchid",
                dueDate: new Date(Date.now() + 86400000), // Tomorrow
                priority: "High",
                notes: "Use distilled water only."
            },
            {
                userId: user._id,
                plantId: plant._id,
                taskName: "Monthly Fertilizer Mix",
                dueDate: new Date(Date.now() + 604800000), // Next week
                priority: "Medium"
            }
        ]);

        console.log("✅ Demo Marketplace and Reminders seeded successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
};

seedDemo();
