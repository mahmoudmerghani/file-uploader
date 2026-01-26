import express from "express";
import multer from "multer";
import usersAuth from "../controllers/usersAuth.js";
import filesController from "../controllers/filesController.js";
import authorization from "../controllers/authorization.js";

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 10 },
}).single("file");

const filesRouter = express.Router();

filesRouter.use(usersAuth.redirectIfUnauthenticated);

filesRouter.post(
    "/:folderId",
    authorization.authorizeFolderAccess,
    upload,
    filesController.uploadFile,
);

filesRouter.post(
    "/:fileId/rename",
    authorization.authorizeFileAccess,
    filesController.renameFile,
);

filesRouter.get(
    "/:fileId/download",
    authorization.authorizeFileAccess,
    filesController.downloadFile,
);

filesRouter.post(
    "/:fileId/delete",
    authorization.authorizeFileAccess,
    filesController.deleteFile,
);

export default filesRouter;
