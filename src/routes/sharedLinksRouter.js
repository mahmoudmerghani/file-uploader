import express from "express";
import sharedLinksController from "../controllers/sharedLinksController.js";

const sharedLinksRouter = express.Router();

sharedLinksRouter.get(
    "/:path/folders/:folderId",
    sharedLinksController.getSharedFolder,
);

sharedLinksRouter.get(
    "/:path/files/:fileId/download",
    sharedLinksController.downloadFile,
);

export default sharedLinksRouter;