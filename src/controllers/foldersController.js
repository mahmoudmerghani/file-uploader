import queries from "../db/queries.js";
import { supabase } from "../../lib/supabase.js";

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
    const deletedFiles = await queries.deleteFolder(req.folder.id, req.user.id);
    const paths = deletedFiles.map((file) => file.path);

    await supabase.storage.from("files").remove(paths);

    res.redirect(`/folders/${req.folder.parentId}`);
}

async function shareFolder(req, res) {
    const { expirationPeriod } = req.body;

    const milliseconds = parseInt(expirationPeriod, 10) * 60 * 60 * 1000;

    const id = await queries.createShareLink(req.folder.id, milliseconds);

    const origin = `https://${req.get("host")}`;

    const link = origin + `/shared/${id}/folders/${req.folder.id}`;

    res.render("share-link", { link, folderName: req.folder.name });
}

export default {
    getFolder,
    createFolder,
    renameFolder,
    deleteFolder,
    shareFolder,
};
