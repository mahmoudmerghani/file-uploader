import queries from "../db/queries.js";
import crypto from "node:crypto";
import { supabase } from "../../lib/supabase.js";

async function uploadFile(req, res) {
    if (req.user.quota + req.file.size > 1024 * 1024 * 50) {
        throw new Error("Quota exceeded, try deleting files");
    }

    const fileName = Buffer.from(req.file.originalname, "latin1").toString("utf-8");
    const randomName = crypto.randomBytes(16).toString("hex");
    const { data, error } = await supabase.storage
        .from("files")
        .upload(randomName, req.file.buffer);

    if (error) {
        console.log(error)
        throw new Error("Upload failed, try again");
    }

    await queries.createFile({
        name: fileName,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: randomName,
        folderId: Number(req.folder.id),
        userId: req.user.id,
    });

    res.redirect(`/folders/${req.folder.id}`);
}

async function renameFile(req, res) {
    await queries.renameFile(req.file.id, req.body.name);

    res.redirect(`/folders/${req.file.folder.id}`);
}

async function downloadFile(req, res) {
    const { data, error } = await supabase.storage
        .from("files")
        .createSignedUrl(req.file.path, 60);

    if (error) {
        throw new Error("error downloading the file, try again");
    }

    res.redirect(data.signedUrl + `&download=${req.file.name}`);
}

async function deleteFile(req, res) {
    await supabase.storage
        .from("files")
        .remove([req.file.path]);

    await queries.deleteFile(req.file.id, req.user.id);

    res.redirect(`/folders/${req.file.folder.id}`);
}

export default {
    uploadFile,
    renameFile,
    downloadFile,
    deleteFile,
};
