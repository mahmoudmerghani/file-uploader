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
    next();
}

export default {
    authorizeFolderAccess,
};
