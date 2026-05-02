const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        icon: {
            type: String, // Icon name (Lucide)
            default: 'Award'
        },
        category: {
            type: String,
            enum: ['Consistency', 'Science', 'Community', 'Growth'],
            default: 'Growth'
        },
        rarity: {
            type: String,
            enum: ['Common', 'Rare', 'Epic', 'Legendary'],
            default: 'Common'
        },
        unlockedAt: {
            type: Date,
            default: Date.now
        },
        points: {
            type: Number,
            default: 10
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Achievement', achievementSchema);
