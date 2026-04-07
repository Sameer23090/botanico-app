const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const plantSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        displayId: {
            type: String,
            unique: true,
            default: () => `plt_${uuidv4()}`
        },
        commonName: {
            type: String,
            required: [true, 'Common name is required'],
            trim: true,
        },
        scientificName: { type: String, trim: true, default: null },
        family: { type: String, trim: true, default: null },
        genus: { type: String, trim: true, default: null },
        species: { type: String, trim: true, default: null },
        variety: { type: String, trim: true, default: null },
        plantType: { type: String, trim: true, default: null },
        growthHabit: { type: String, trim: true, default: null },
        nativeRegion: { type: String, trim: true, default: null },
        description: { type: String, default: null },
        habitat: {
            type: String,
            enum: ['Terrestrial', 'Aquatic', 'Wetland', 'Desert/Arid', 'Epiphytic', 'Parasitic', 'Mangrove', 'Alpine', 'Other', null],
            default: null
        },
        classificationGroup: {
            type: String,
            enum: ['Bryophytes', 'Pteridophytes', 'Gymnosperms', 'Angiosperms - Monocots', 'Angiosperms - Dicots', 'Algae', 'Fungi', 'Other', null],
            default: null
        },
        locationText: { type: String, trim: true, default: null },
        plantingDate: {
            type: Date,
            required: [true, 'Planting date is required'],
        },
        plantingSeason: {
            type: String,
            enum: ['Spring', 'Summer', 'Monsoon', 'Autumn', 'Winter', 'Year-round', 'Unknown', null],
            default: 'Unknown'
        },
        environmentCondition: {
            type: String,
            enum: [
                'full_sun', 'partial_sun', 'partial_shade', 'full_shade',
                'indoor_bright', 'indoor_low', 'greenhouse', 'humid', 'arid',
                'coastal', 'tropical', 'subtropical', 'temperate', 'mediterranean',
                'highland', 'rainforest', 'desert', 'other',
                'Other', null
            ],
            default: 'other'
        },
        firstPhotoUrl: { type: String, default: null },
        location: { type: String, trim: true, default: null },
        coordinates: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null }
        },
        soilType: { type: String, trim: true, default: null },
        sunlightExposure: { type: String, trim: true, default: null },
        plantingMethod: { type: String, trim: true, default: null },
        expectedHarvestDays: { type: Number, default: null },
        isPublic: {
            type: Boolean,
            default: false
        },
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

plantSchema.virtual('daysSincePlanting').get(function () {
    if (!this.plantingDate) return null;
    const now = new Date();
    const diff = now - new Date(this.plantingDate);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
});

plantSchema.virtual('updates', {
    ref: 'Update',
    localField: '_id',
    foreignField: 'plantId',
});

plantSchema.methods.toJSON = function () {
    const obj = this.toObject({ virtuals: true });
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('Plant', plantSchema);
