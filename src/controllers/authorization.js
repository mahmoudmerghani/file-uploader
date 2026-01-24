import queries from "../db/queries.js";

async function authorizeFolderAccess(req, res, next) {
    const { folderId } = req.params;

    const folder = await queries.getUserFolder(req.user.id, Number(folderId));

    if (!folder) {
        return res.status(403).render("errorPage", {
            errorMessage: "You do not have permission to access this folder.",
        });
    }

    req.folder = folder;
    return next();
}

async function authorizeFileAccess(req, res, next) {
    const { fileId } = req.params;

    const file = await queries.getFileById(Number(fileId));

    if (!file || file.folder.userId !== req.user.id) {
        return res.status(403).render("errorPage", {
            errorMessage: "You do not have permission to access this file.",
        });
    }

    req.file = file;
    return next();
}

export default {
    authorizeFolderAccess,
    authorizeFileAccess
};
