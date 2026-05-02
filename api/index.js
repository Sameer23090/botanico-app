const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const passport = require('passport');
// require('dotenv').config();

// // Fix require paths to point to the backend folder
// require('../backend/config/passport');
// const connectDB = require('../backend/config/database');
// const authRoutes = require('../backend/routes/auth');
// const plantRoutes = require('../backend/routes/plants');
// const updateRoutes = require('../backend/routes/updates');
// const adminRoutes = require('../backend/routes/admin');
// const uploadRoutes = require('../backend/routes/uploadRoutes');
// const marketplaceRoutes = require('../backend/routes/marketplace');
// const reminderRoutes = require('../backend/routes/reminders');
// const aiRoutes = require('../backend/routes/ai');
// const achievementRoutes = require('../backend/routes/achievements');

const app = express();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Botanico API is running (Minimal Mode)' });
});

app.get('/api/auth/login', (req, res) => {
  res.status(500).json({ error: "Minimal API mode: login is temporarily disabled while debugging Vercel boot failure." });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

module.exports = app;
