import queries from "../db/queries.js";

async function getRootFolder(req, res) {
    const folders = await queries.getUserFolders(req.user.id);
    console.log(folders);
    res.render("home");
}

async function getFolder(req, res) {
    
}

export default {
    getRootFolder,
    getFolder,
};
