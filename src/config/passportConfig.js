import passport from "passport";
import LocalStrategy from "passport-local";
import queries from "../db/queries.js";
import bcrypt from "bcryptjs";


passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await queries.getUserByUsername(username);

            if (!user)
                return done(null, false, { errorMessage: "Wrong username" });

            if (!(await bcrypt.compare(password, user.password)))
                return done(null, false, { errorMessage: "Wrong password" });

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await queries.getUserById(id);

        return done(null, user);
    } catch (err) {
        return done(err);
    }
});
