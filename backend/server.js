const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
require('dotenv').config();

// Passport configuration
require('./config/passport');

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const plantRoutes = require('./routes/plants');
const updateRoutes = require('./routes/updates');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/uploadRoutes');
const marketplaceRoutes = require('./routes/marketplace');
const reminderRoutes = require('./routes/reminders');
const aiRoutes = require('./routes/ai');
const achievementRoutes = require('./routes/achievements');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(async () => {
    try {
        const User = require('./models/User');
        const adminEmail = 'master@botanico.live';
        const existing = await User.findOne({ email: adminEmail });
        if (!existing) {
            await User.create({
                name: 'System Director',
                email: adminEmail,
                passwordHash: process.env.ADMIN_PASSWORD || 'BotanicoMaster!2026',
                role: 'admin',
                location: 'Headquarters',
                provider: 'local'
            });
            console.log(`✅ Auto-seeded new live admin user (${adminEmail})`);
        }
    } catch (err) {
        console.error('Failed to auto-seed admin:', err);
    }
});

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

// CORS: allow localhost for dev and any vercel.app / custom domain for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  /\.vercel\.app$/,
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Check if origin matches any allowed origin
    const isAllowed = allowedOrigins.some((o) =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    if (isAllowed) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialise passport
app.use(passport.initialize());

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/updates', updateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/achievements', achievementRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Botanico API is running',
    database: 'MongoDB Atlas',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Botanico Plant Tracking API',
    version: '2.6.0',
    database: 'MongoDB Atlas',
    endpoints: {
      auth: '/api/auth',
      plants: '/api/plants',
      updates: '/api/updates',
      upload: '/api/upload',
      ai: '/api/ai',
      achievements: '/api/achievements',
      reminders: '/api/reminders',
      marketplace: '/api/marketplace',
    },
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.name === 'UnauthorizedError') return res.status(401).json({ error: 'Invalid token' });
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`🌱 Botanico API server running on port ${PORT}`);
});

module.exports = app;
