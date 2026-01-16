import { body, validationResult, matchedData } from "express-validator";
import queries from "../db/queries.js";
import passport from "passport";

const validateUser = [
    body("username")
        .trim()
        .notEmpty()
        .withMessage("username must not be empty")
        .custom(async (value) => {
            const user = await queries.getUserByUsername(value);

            if (user) {
                throw new Error("A user already exists with the same username");
            }
        }),
    body("password").notEmpty().withMessage("Password must not be empty"),
    body("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Passwords don't match");
        }
        return true;
    }),
];

const signUpUser = [
    validateUser,
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.render("sign-up", { errors: errors.array() });
        }

        const user = matchedData(req);

        const userId = await queries.createUser(user);
        await queries.createRootFolder(user.username, userId);
        res.redirect("/?newUser=true");
    },
];

function logInUser(req, res) {
    if (req.isAuthenticated()) {
        res.redirect("/home");
    } else {
        res.render("log-in", { error: req.authInfo.errorMessage });
    }
}

function logOutUser(req, res, next) {
    req.logOut((err) => {
        if (err) return next(err);

        res.redirect("/");
    });
}

export default {
    signUpUser,
    logInUser,
    logOutUser,
};
