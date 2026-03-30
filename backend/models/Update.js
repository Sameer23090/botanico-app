const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema(
    {
        plantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plant',
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        entryDate: {
            type: Date,
            required: [true, 'Entry date is required'],
            index: true,
        },
        dayNumber: {
            type: Number,
            required: true,
        },
        title: { type: String, trim: true, default: null },
        observations: { type: String, default: null },

        // Measurements
        heightCm: { type: Number, default: null },
        widthCm: { type: Number, default: null },
        leafCount: { type: Number, default: null },
        stemDiameterMm: { type: Number, default: null },

        // Botanical stages
        floweringStage: { type: String, trim: true, default: null },  // Vegetative, Budding, Blooming, etc.
        fruitingStage: { type: String, trim: true, default: null },   // Fruit set, Development, Ripening, etc.

        // Health & Issues
        healthStatus: {
            type: String,
            enum: ['excellent', 'good', 'fair', 'poor', 'critical', null],
            default: null,
        },
        rootObservations: { type: String, default: null },
        pestIssues: { type: String, default: null },
        diseaseObservations: { type: String, default: null },
        environmentalStress: { type: String, default: null },

        // Care Actions - Array of strings (e.g. ['Watered', 'Fertilized', 'Pruned'])
        careActions: { type: [String], default: [] },

        // Photos - Array of Cloudinary URLs
        photos: { type: [String], default: [] },

        // Environmental conditions
        temperatureCelsius: { type: Number, default: null },
        humidityPercent: { type: Number, default: null },
        soilPh: { type: Number, default: null },
        soilMoisture: {
            type: String,
            enum: ['dry', 'moist', 'wet', 'waterlogged', null],
            default: null,
        },

        notes: { type: String, default: null },
        coordinates: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null }
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Clean JSON output
updateSchema.methods.toJSON = function () {
    const obj = this.toObject({ virtuals: true });
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('Update', updateSchema);
