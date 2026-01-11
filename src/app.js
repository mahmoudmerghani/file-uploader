import express from "express";
import prisma from "../lib/prisma.js";
import expressSession from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import passport from "passport";
import "./config/passportConfig.js";
import { join } from "node:path";

import indexRouter from "./routes/indexRouter.js";

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
            checkPeriod: 2 * 60 * 1000,
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }),
    })
);
app.use(passport.session());


app.use("/", indexRouter);


app.listen(8080);