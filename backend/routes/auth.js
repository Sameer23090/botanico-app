const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const dbQueries = require('../db/dbQueries');
const authMiddleware = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

const router = express.Router();

const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many authentication attempts, please try again later.' }
});

// Helper to sanitize user object for client response
const toPublicUser = (user) => {
  if (!user) return null;
  const clone = { ...user };
  delete clone.passwordHash;
  return clone;
};

// ─── Validation Rules ────────────────────────────────────────────────────────

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Helper to sign JWT
const signToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ─── OAuth Routes ───────────────────────────────────────────────────────────

// Google Auth
router.get('/google', authLimiter, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }), (req, res) => {
  const token = signToken(req.user);
  res.redirect(`${process.env.FRONTEND_URL}/auth-callback?token=${token}`);
});

// Microsoft Auth
router.get('/microsoft', authLimiter, passport.authenticate('microsoft', { prompt: 'select_account' }));

router.get('/microsoft/callback', passport.authenticate('microsoft', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }), (req, res) => {
  const token = signToken(req.user);
  res.redirect(`${process.env.FRONTEND_URL}/auth-callback?token=${token}`);
});

// ─── Local Auth Routes ───────────────────────────────────────────────────────

router.post('/register', authLimiter, registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, location } = req.body;

    const existingUser = await dbQueries.users.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await dbQueries.users.create({
      name,
      email,
      passwordHash,
      location: location || null,
      provider: 'local'
    });

    const token = signToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', authLimiter, loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await dbQueries.users.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.provider !== 'local') {
      return res.status(400).json({ error: `Please log in using ${user.provider}` });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await dbQueries.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: toPublicUser(user) });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, location, preferredLanguage } = req.body;

    const user = await dbQueries.users.update(req.user.id, {
      ...(name && { name }),
      ...(location !== undefined && { location }),
      ...(preferredLanguage && { preferredLanguage }),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ─── Password Reset Routes ──────────────────────────────────────────────────

router.post('/forgot-password', 
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const user = await dbQueries.users.findByEmail(email);

      if (!user) {
        return res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
      }

      if (user.provider !== 'local') {
        return res.status(400).json({ error: `This account uses ${user.provider} login. Please log in through ${user.provider}.` });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Set token and expiry (1 hour)
      const resetPasswordExpires = new Date(Date.now() + 3600000);
      await dbQueries.users.update(user.id, {
        resetPasswordToken: hashedToken,
        resetPasswordExpires
      });

      // Create reset URL
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

      const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`;

      try {
        await sendEmail({
          email: user.email,
          subject: 'Botanico - Password Reset Request',
          message,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #10b981; text-align: center;">Botanico</h2>
              <p>Hello,</p>
              <p>You requested a password reset for your Botanico account. Please click the button below to set a new password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
              </div>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request this, you can safely ignore this email.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b; text-align: center;">Botanico Plant Tracking System</p>
            </div>
          `
        });

        res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
      } catch (err) {
        await dbQueries.users.update(user.id, {
          resetPasswordToken: null,
          resetPasswordExpires: null
        });

        console.error('Email send error:', err);
        return res.status(500).json({ error: 'Email could not be sent. Please try again later.' });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.post('/reset-password/:token',
  [body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Hash token from URL to match hashed token in DB
      const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

      const user = await dbQueries.users.findByResetToken(hashedToken);
      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired password reset token' });
      }

      // Set new password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(req.body.password, salt);

      await dbQueries.users.update(user.id, {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null
      });

      res.json({ message: 'Password reset successful! You can now log in with your new password.' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
