const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
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
        taskName: {
            type: String,
            required: true,
            trim: true, // e.g., "Watering", "Fertilizing", "Repotting"
        },
        dueDate: {
            type: Date,
            required: true,
            index: true
        },
        remindAt: { type: Date }, // Specific time for notification
        frequency: {
            type: String,
            enum: ['Once', 'Daily', 'Weekly', 'Bi-weekly', 'Monthly'],
            default: 'Once'
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium'
        },
        isCompleted: {
            type: Boolean,
            default: false
        },
        completedAt: { type: Date },
        notes: { type: String }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Reminder', reminderSchema);
