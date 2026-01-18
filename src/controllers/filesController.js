import queries from "../db/queries.js";

async function uploadFile(req, res) {
    const { folderId } = req.params;

    await queries.createFile({
        name: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.filename,
        folderId: Number(folderId),
    });

    res.redirect(`/folders/${folderId}`);
}

export default {
    uploadFile,
};
