import queries from "../db/queries.js";

async function getFolder(req, res) {
    const folders = await queries.getUserFolders(req.user.id);
    console.log(folders);
    const foldersTree = queries.buildFolderTree(folders);
    let folderId = req.params.folderId;

    if (folderId === undefined) {
        folderId = foldersTree.rootId;
    }

    console.log(foldersTree);
    if (!foldersTree.folders[folderId]) {
        throw new Error("Folder does not exist");
    }
    const path = queries.getFolderPath(foldersTree.folders, folderId);
    console.log(path);

    res.render("home", {
        currentFolderId: folderId,
        foldersTree: foldersTree.folders,
        rootId: foldersTree.rootId,
        path,
    });
}

async function createFolder(req, res) {
    const { folderId } = req.params;

    await queries.createFolder(req.body.name, req.user.id, Number(folderId));

    res.redirect(`/folders/${folderId}`);
}

export default {
    getFolder,
    createFolder,
};
