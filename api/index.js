const express = require('express');
const app = express();

let authRoutes, plantRoutes, updateRoutes, adminRoutes, uploadRoutes, marketplaceRoutes, reminderRoutes, aiRoutes, achievementRoutes;
let connectDB;
let initError = null;

try {
  const cors = require('cors');
  const helmet = require('helmet');
  const passport = require('passport');
  require('dotenv').config();

  require('../backend/config/passport');
  connectDB = require('../backend/config/database');
  authRoutes = require('../backend/routes/auth');
  plantRoutes = require('../backend/routes/plants');
  updateRoutes = require('../backend/routes/updates');
  adminRoutes = require('../backend/routes/admin');
  uploadRoutes = require('../backend/routes/uploadRoutes');
  marketplaceRoutes = require('../backend/routes/marketplace');
  reminderRoutes = require('../backend/routes/reminders');
  aiRoutes = require('../backend/routes/ai');
  achievementRoutes = require('../backend/routes/achievements');

  app.use(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (error) {
      next(error);
    }
  });

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(passport.initialize());

  app.use('/api/auth', authRoutes);
  app.use('/api/plants', plantRoutes);
  app.use('/api/updates', updateRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/marketplace', marketplaceRoutes);
  app.use('/api/reminders', reminderRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/achievements', achievementRoutes);

} catch (error) {
  console.error("Initialization Error:", error);
  initError = error;
}

app.get('/api/health', (req, res) => {
  if (initError) {
    return res.status(500).json({ error: `Initialization Error: ${initError.message}` });
  }
  res.json({ status: 'ok', message: 'Botanico API is running' });
});

// Middleware to return initialization errors for any other route
app.use((req, res, next) => {
  if (initError) {
    return res.status(500).json({ error: `Server failed to boot: ${initError.message}` });
  }
  next();
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

module.exports = app;
