import passport from "passport";

const authenticateUser = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);

        req.authInfo = info;

        if (!user) return next();

        req.logIn(user, (err) => {
            if (err) return next(err);

            next();
        });
    })(req, res, next);
};

const redirectIfAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect("/home");
    } else {
        next();
    }
};

const redirectIfUnauthenticated = (req, res, next) => {
    if (req.isUnauthenticated()) {
        res.redirect("/");
    } else {
        next();
    }
};

export default {
    authenticateUser,
    redirectIfAuthenticated,
    redirectIfUnauthenticated
}