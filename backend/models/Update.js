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
        floweringStage: { type: String, trim: true, default: null },
        fruitingStage: { type: String, trim: true, default: null },

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

        // Care Actions
        careActions: { type: [String], default: [] },

        // Fertilizer Tracking
        fertilizerUsed: { type: Boolean, default: false },
        fertilizerName: { type: String, default: null },
        fertilizerType: {
            type: String,
            enum: ['Organic', 'Chemical', 'Bio-fertilizer', 'NPK', 'Compost', 'Liquid', 'Other', null],
            default: null
        },
        dosage: { type: String, default: null },
        applicationMethod: {
            type: String,
            enum: ['Soil drench', 'Foliar spray', 'Side dressing', 'Other', null],
            default: null
        },
        fertilizerNotes: { type: String, default: null },

        // Manure Tracking
        manureUsed: { type: Boolean, default: false },
        manureType: {
            type: String,
            enum: ['Cow dung', 'Poultry', 'Vermicompost', 'Goat/Sheep', 'Horse', 'Green manure', 'Bone meal', 'Fish meal', 'Other', null],
            default: null
        },
        manureDosage: { type: String, default: null },
        manureMethod: {
            type: String,
            enum: ['Soil incorporation', 'Top dressing', 'Mulching', 'Composting', 'Other', null],
            default: null
        },
        manureNotes: { type: String, default: null },

        // Photos - Now storing Drive info
        drivePhotos: [{
            driveFileId: String,
            displayUrl: String,
            originalFilename: String,
            takenAt: Date,
            createdAt: { type: Date, default: Date.now },
            imageType: { type: String, enum: ['thumbnail', 'timeline', 'profile'], default: 'timeline' }
        }],

        // Environmental conditions
        temperatureCelsius: { type: Number, default: null },
        humidityPercent: { type: Number, default: null },
        soilPh: { type: Number, default: null },
        soilMoisture: {
            type: String,
            enum: ['dry', 'moist', 'wet', 'waterlogged', null],
            default: null,
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

        notes: { type: String, default: null },
        coordinates: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null }
        },
        locationText: { type: String, trim: true, default: null },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

updateSchema.methods.toJSON = function () {
    const obj = this.toObject({ virtuals: true });
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('Update', updateSchema);
