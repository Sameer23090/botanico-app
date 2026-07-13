const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const dbQueries = require('../db/dbQueries');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await dbQueries.users.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ─── Google Strategy ─────────────────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await dbQueries.users.findByEmail(email);
        
        if (user) {
          user = await dbQueries.users.update(user.id, {
            name: user.name || profile.displayName,
            avatarUrl: user.avatarUrl || (profile.photos && profile.photos[0].value),
            provider: 'google'
          });
          return done(null, user);
        }

        // Create new user if not exists
        user = await dbQueries.users.create({
          name: profile.displayName,
          email: email,
          avatarUrl: profile.photos && profile.photos[0].value,
          provider: 'google',
          role: 'student' // Default role
        });
        
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  ));
}

// ─── Microsoft Strategy ──────────────────────────────────────────────────────
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  passport.use(new MicrosoftStrategy({
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/microsoft/callback`,
      scope: ['user.read']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await dbQueries.users.findByEmail(email);

        if (user) {
          user = await dbQueries.users.update(user.id, { provider: 'microsoft' });
          return done(null, user);
        }

        user = await dbQueries.users.create({
          name: profile.displayName,
          email: email,
          provider: 'microsoft',
          role: 'student'
        });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  ));
}

module.exports = passport;
