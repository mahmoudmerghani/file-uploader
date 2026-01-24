import queries from "../db/queries.js";

async function loadFolder(req, res, next) {
    const { folderId } = req.params;

    const folder = await queries.getFolderById(Number(folderId));

    req.folder = folder;

    return next();
}

async function getFolder(req, res) {
    const folders = await queries.getUserFolders(req.user.id);
    const foldersTree = queries.buildFolderTree(folders);
    let folderId = req.params.folderId;

    if (folderId === undefined) {
        folderId = foldersTree.rootId;
    }

    const path = queries.getFolderPath(foldersTree.folders, folderId);

    res.render("home", {
        currentFolderId: Number(folderId),
        foldersTree: foldersTree.folders,
        rootId: foldersTree.rootId,
        path,
    });
}

async function createFolder(req, res) {
    await queries.createFolder(req.body.name, req.user.id, req.folder.id);

    res.redirect(`/folders/${req.folder.id}`);
}

async function renameFolder(req, res) {
    await queries.renameFolder(req.folder.id, req.body.name);
    
    res.redirect(`/folders/${req.folder.parentId}`);
}

async function deleteFolder(req, res) {
    await queries.deleteFolder(req.folder.id);
    
    res.redirect(`/folders/${req.folder.parentId}`);
}

export default {
    getFolder,
    createFolder,
    renameFolder,
    deleteFolder
};
