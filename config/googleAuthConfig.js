import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.js";
import { sendWelcomeEmail } from "./emailConfig.js";

export function configureGoogleAuth() {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback";

  if (!clientID || !clientSecret || clientID === "your_google_client_id_here") {
    console.warn(
      "[Google OAuth] GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are not set in .env. " +
      "Google OAuth login button is available, but will prompt to configure credentials until added."
    );
    return false;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          // 1. Check if user already exists with this googleId
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            return done(null, user);
          }

          // 2. Check if a user exists with the same email
          const email =
            profile.emails && profile.emails[0]
              ? profile.emails[0].value.toLowerCase().trim()
              : null;

          if (email) {
            user = await User.findOne({ email });
            if (user) {
              // Link googleId to existing user
              user.googleId = profile.id;
              if (!user.firstName && profile.name) user.firstName = profile.name.givenName;
              if (!user.lastName && profile.name) user.lastName = profile.name.familyName;
              if (!user.avatar && profile.photos && profile.photos[0]) user.avatar = profile.photos[0].value;
              await user.save();
              return done(null, user);
            }
          }

          // 3. Create new user for Google profile
          const firstName = profile.name ? profile.name.givenName : (profile.displayName || "User");
          const lastName = profile.name ? profile.name.familyName : "";
          let baseName =
            profile.displayName ||
            `${firstName} ${lastName}`.trim() ||
            (email ? email.split("@")[0] : "Google User");

          let finalUsername = baseName;
          let counter = 1;
          while (await User.findOne({ username: finalUsername })) {
            counter++;
            finalUsername = `${baseName} ${counter}`;
          }

          const newUser = new User({
            googleId: profile.id,
            email: email || `${profile.id}@google.oauth`,
            username: finalUsername,
            firstName: firstName,
            lastName: lastName,
            avatar:
              profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
          });

          await newUser.save();

          // Send welcome greetings email asynchronously via Resend
          if (newUser.email && !newUser.email.includes("@google.oauth")) {
            sendWelcomeEmail({
              to: newUser.email,
              name: newUser.firstName || finalUsername,
              username: finalUsername,
            }).catch((err) => console.error("[Resend Email] Google signup email delivery notice:", err));
          }

          if (req && req.session) {
            req.session.showUsernamePrompt = true;
          }

          return done(null, newUser);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  return true;
}

export default configureGoogleAuth;
