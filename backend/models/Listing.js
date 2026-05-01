const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        plantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plant',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: { type: String, trim: true },
        price: {
            amount: { type: Number, required: true },
            currency: { type: String, default: 'INR' }
        },
        category: {
            type: String,
            enum: ['Plant', 'Seed', 'Cutting', 'Fertilizer', 'Other'],
            default: 'Plant'
        },
        listingType: {
            type: String,
            enum: ['Sale', 'Trade', 'Giveaway'],
            default: 'Sale'
        },
        images: [{ type: String }],
        location: {
            city: String,
            state: String,
            coordinates: {
                lat: Number,
                lng: Number
            }
        },
        status: {
            type: String,
            enum: ['Active', 'Sold', 'Pending', 'Closed'],
            default: 'Active',
            index: true
        }
    },
    {
        timestamps: true,
    }
);

listingSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Listing', listingSchema);
