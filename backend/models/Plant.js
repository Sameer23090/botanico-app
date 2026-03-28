const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        commonName: {
            type: String,
            required: [true, 'Common name is required'],
            trim: true,
        },
        scientificName: { type: String, trim: true, default: null },
        family: { type: String, trim: true, default: null },     // e.g. Solanaceae
        genus: { type: String, trim: true, default: null },      // e.g. Solanum
        species: { type: String, trim: true, default: null },    // e.g. lycopersicum
        variety: { type: String, trim: true, default: null },
        plantType: { type: String, trim: true, default: null },
        growthHabit: { type: String, trim: true, default: null }, // Annual, Perennial, etc.
        nativeRegion: { type: String, trim: true, default: null },
        description: { type: String, default: null },
        plantingDate: {
            type: Date,
            required: [true, 'Planting date is required'],
        },
        firstPhotoUrl: { type: String, default: null },
        location: { type: String, trim: true, default: null },
        soilType: { type: String, trim: true, default: null },
        sunlightExposure: { type: String, trim: true, default: null },
        plantingMethod: { type: String, trim: true, default: null },
        expectedHarvestDays: { type: Number, default: null },
        status: {
            type: String,
            enum: ['active', 'harvested', 'deleted', 'dormant'],
            default: 'active',
            index: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual: days since planting
plantSchema.virtual('daysSincePlanting').get(function () {
    if (!this.plantingDate) return null;
    const now = new Date();
    const diff = now - new Date(this.plantingDate);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Virtual: populate updates (used selectively)
plantSchema.virtual('updates', {
    ref: 'Update',
    localField: '_id',
    foreignField: 'plantId',
});

// Clean JSON output
plantSchema.methods.toJSON = function () {
    const obj = this.toObject({ virtuals: true });
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('Plant', plantSchema);
