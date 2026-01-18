import express from "express";
import multer from "multer";
import { join } from "node:path";
import usersAuth from "../controllers/usersAuth.js";
import filesController from "../controllers/filesController.js";

const upload = multer({
    dest: join(import.meta.dirname, "../../uploads"),
    limits: { fileSize: 1024 * 1024 * 10 },
}).single("file");


const filesRouter = express.Router();

filesRouter.use(usersAuth.redirectIfUnauthenticated);

filesRouter.post("/:folderId", upload, filesController.uploadFile);

export default filesRouter;
