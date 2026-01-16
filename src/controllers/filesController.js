import queries from "../db/queries.js";

async function uploadFileToRoot(req, res) {
    const rootFolderId = await queries.getUserRootFolderId(req.user.id);
    await queries.createFile({
        name: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.filename,
        folderId: rootFolderId,
    });

    res.redirect("/folders");
}

async function uploadFile(req, res, next) {
    await queries.createFile({
        name: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.filename,
        folderId: req.params.folderId,
    });
}

export default {
    uploadFile,
    uploadFileToRoot,
};
