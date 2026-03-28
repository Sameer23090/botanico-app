const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [255, 'Name cannot exceed 255 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        passwordHash: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: ['student', 'faculty', 'admin'],
            default: 'student',
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) return next();
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.passwordHash;
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
