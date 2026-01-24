import queries from "../db/queries.js";
import { join } from "node:path";

async function uploadFile(req, res) {
    await queries.createFile({
        name: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.filename,
        folderId: Number(req.folder.id),
    });

    res.redirect(`/folders/${req.folder.id}`);
}

async function renameFile(req, res) {
    await queries.renameFile(req.file.id, req.body.name);

    res.redirect(`/folders/${req.file.folder.id}`);
}

function downloadFile(req, res) {
    const filePath = join(import.meta.dirname, "../../uploads", req.file.path);
    res.download(filePath, req.file.name);
}

async function deleteFile(req, res) {
    await queries.deleteFile(req.file.id);

    res.redirect(`/folders/${req.file.folder.id}`);
}

export default {
    uploadFile,
    renameFile,
    downloadFile,
    deleteFile
};
