import express from "express";
import foldersController from "../controllers/foldersController.js";
import usersAuth from "../controllers/usersAuth.js";
import authorization from "../controllers/authorization.js";

const foldersRouter = express.Router();

foldersRouter.use(usersAuth.redirectIfUnauthenticated);

foldersRouter.get("/", foldersController.getFolder);
foldersRouter.get("/:folderId", authorization.authorizeFolderAccess, foldersController.getFolder);

foldersRouter.post("/:folderId", authorization.authorizeFolderAccess, foldersController.createFolder);

foldersRouter.post("/:folderId/rename", authorization.authorizeFolderAccess, foldersController.renameFolder);

foldersRouter.post("/:folderId/delete", authorization.authorizeFolderAccess, foldersController.deleteFolder);

export default foldersRouter;