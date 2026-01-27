import queries from "../db/queries.js";
import { supabase } from "../../lib/supabase.js";

async function getSharedFolder(req, res) {
    const { path } = req.params;
    const folderId = Number(req.params.folderId);
    const sharedLink = await queries.getSharedLink(path);

    if (!sharedLink || sharedLink.expiresAt.getTime() < Date.now()) {
        throw new Error("Cannot access this folder");
    }

    const folders = await queries.getUserFolders(sharedLink.folder.user.id);
    const foldersTree = queries.buildFolderTree(folders);

    if (!foldersTree.folders[folderId]) {
        throw new Error("Folder does not exist");
    }

    // only shared folder and its descendants can be accessed
    let current = foldersTree.folders[folderId];
    let isChild = false;
    while (current) {
        if (current.id === sharedLink.folder.id) {
            isChild = true;
            break;
        }

        current = foldersTree.folders[current.parentId];
    }

    if (!isChild) {
        throw new Error("Cannot access this folder");
    }

    const folderPath = queries.getFolderPath(foldersTree.folders, folderId);

    // remove folders that are not accessible (not descendants of the shared folder)
    const index = folderPath.indexOf(sharedLink.folder.id);
    const subPath = folderPath.slice(index);

    res.render("sharedLinkPage", {
        currentFolderId: folderId,
        foldersTree: foldersTree.folders,
        rootId: sharedLink.folder.id,
        path: subPath,
        sharedId: sharedLink.id,
    });
}

async function downloadFile(req, res) {
    const { path } = req.params;
    const fileId = Number(req.params.fileId);
    const sharedLink = await queries.getSharedLink(path);

    if (!sharedLink || sharedLink.expiresAt < Date.now()) {
        throw new Error("Cannot access this folder");
    }

    const folders = await queries.getUserFolders(sharedLink.folder.user.id);
    const foldersTree = queries.buildFolderTree(folders);
    const file = await queries.getFileById(fileId);

    if (!file) {
        throw new Error("File does not exist");
    }

    const folderId = file.folderId;

    if (!foldersTree.folders[folderId]) {
        throw new Error("Cannot access this file");
    }

    // only shared folder and its descendants can be accessed
    let current = foldersTree.folders[folderId];
    let isChild = false;
    while (current) {
        if (current.id === sharedLink.folder.id) {
            isChild = true;
            break;
        }

        current = foldersTree.folders[current.parentId];
    }

    if (!isChild) {
        throw new Error("Cannot access this file");
    }

    const { data, error } = await supabase.storage
        .from("files")
        .createSignedUrl(file.path, 60);

    if (error) {
        throw new Error("error downloading the file, try again");
    }

    res.redirect(data.signedUrl + `&download=${file.name}`);
}

export default { getSharedFolder, downloadFile };
