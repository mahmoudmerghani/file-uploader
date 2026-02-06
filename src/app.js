import express from "express";
import prisma from "../lib/prisma.js";
import expressSession from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import passport from "passport";
import "./config/passportConfig.js";
import { join } from "node:path";

import indexRouter from "./routes/indexRouter.js";
import filesRouter from "./routes/filesRouter.js";
import foldersRouter from "./routes/foldersRouter.js";
import sharedLinksRouter from "./routes/sharedLinksRouter.js";

const app = express();

app.use(express.static(join(import.meta.dirname, "../public")));
app.use(express.urlencoded());

app.set("view engine", "ejs");
app.set("views", join(import.meta.dirname, "views"));

app.use(
    expressSession({
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000,
        },
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        store: new PrismaSessionStore(prisma, {
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }),
    }),
);
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

app.use("/", indexRouter);
app.use("/folders", foldersRouter);
app.use("/files", filesRouter);
app.use("/shared", sharedLinksRouter);

app.use((req, res, next) => {

    res.status(404).render("errorPage", { errorMessage: "Page not found" });
});

app.use((err, req, res, next) => {
    console.log(err);
    res.render("errorPage", { errorMessage: err.message });
});

app.listen(8080);
