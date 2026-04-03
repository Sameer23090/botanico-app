const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const User = require('../models/User');

// Google Strategy - Only initialize if credentials exist
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails[0].value });
          
          if (!user) {
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              avatarUrl: profile.photos[0]?.value,
              provider: 'google',
              passwordHash: null
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    ));
}

// Microsoft Strategy - Only initialize if credentials exist
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    passport.use(new MicrosoftStrategy({
        clientID: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL: process.env.MICROSOFT_CALLBACK_URL,
        scope: ['user.read']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0]?.value || profile._json.mail || profile._json.userPrincipalName;
          let user = await User.findOne({ email: email });
          
          if (!user) {
            user = await User.create({
              name: profile.displayName,
              email: email,
              avatarUrl: null, // Microsoft API needs extra calls for profile pic usually
              provider: 'microsoft',
              passwordHash: null
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    ));
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
