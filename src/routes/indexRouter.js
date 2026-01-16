import express from "express";
import indexController from "../controllers/indexController.js";
import usersController from "../controllers/usersController.js";
import usersAuth from "../controllers/usersAuth.js";

const indexRouter = express.Router();

indexRouter.get(
    "/",
    usersAuth.redirectIfAuthenticated,
    indexController.getIndexPage
);

indexRouter.get(
    "/sign-up",
    usersAuth.redirectIfAuthenticated,
    indexController.getSignUpPage
);

indexRouter.get(
    "/log-in",
    usersAuth.redirectIfAuthenticated,
    indexController.getLogInPage
);

indexRouter.post(
    "/sign-up",
    usersAuth.redirectIfAuthenticated,
    usersController.signUpUser
);

indexRouter.post(
    "/log-in",
    usersAuth.redirectIfAuthenticated,
    usersAuth.authenticateUser,
    usersController.logInUser
);

indexRouter.post(
    "/log-out",
    usersAuth.redirectIfUnauthenticated,
    usersController.logOutUser
);

export default indexRouter;
