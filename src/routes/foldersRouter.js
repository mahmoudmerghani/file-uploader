import express from "express";
import foldersController from "../controllers/foldersController.js";
import usersAuth from "../controllers/usersAuth.js";

const foldersRouter = express.Router();

foldersRouter.use(usersAuth.redirectIfUnauthenticated);

foldersRouter.get("/", foldersController.getFolder);
foldersRouter.get("/:folderId", foldersController.getFolder);

foldersRouter.post("/:folderId", foldersController.createFolder);

export default foldersRouter;