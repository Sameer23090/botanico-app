const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [255, 'Name cannot exceed 255 characters'],
        },
        displayId: {
            type: String,
            unique: true,
            default: () => `usr_${uuidv4()}`
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        avatarUrl: {
            type: String,
            default: null
        },
        provider: {
            type: String,
            default: 'local'
        },
        preferredLanguage: {
            type: String,
            default: 'en',
            enum: ['en', 'ta', 'ml', 'te']
        },
        passwordHash: {
            type: String,
            required: function() { return this.provider === 'local'; },
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
        timestamps: true,
    }
);

// hashing password before saving (optional for passwordless users)
const bcrypt = require('bcryptjs');
userSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash') || !this.passwordHash) return next();
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.passwordHash) return false;
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.passwordHash;
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
