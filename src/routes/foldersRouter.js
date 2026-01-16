import express from "express";
import foldersController from "../controllers/foldersController.js";

const foldersRouter = express.Router();

foldersRouter.get("/", foldersController.getRootFolder);
foldersRouter.get("/:folderId", foldersController.getFolder);

export default foldersRouter;