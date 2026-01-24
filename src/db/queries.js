import prisma from "../../lib/prisma.js";
import bcrypt, { hash } from "bcryptjs";

async function getUserByUsername(username) {
    const user = await prisma.user.findUnique({
        where: { username },
    });
    return user;
}

async function getUserById(id) {
    const user = await prisma.user.findUnique({
        where: { id },
    });

    return user;
}

async function createUser({ username, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
        },
    });

    return user.id;
}

async function createRootFolder(name, userId) {
    const folder = await prisma.folder.create({
        data: {
            name,
            userId,
        },
    });

    return folder.id;
}

async function getUserFolder(userId, folderId) {
    const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId },
    });

    return folder;
}

async function createFile({ name, mimeType, size, path, folderId }) {
    const file = await prisma.file.create({
        data: {
            name,
            mimeType,
            size,
            path,
            folderId,
        },
    });

    return file.id;
}

async function getUserRootFolderId(userId) {
    const folder = await prisma.folder.findFirst({
        where: { userId, parentId: null },
    });

    if (!folder) throw new Error("User has no root folder");

    return folder.id;
}

async function getUserFolders(userId) {
    const folders = await prisma.folder.findMany({
        where: { userId },
        include: { files: true },
    });

    return folders;
}

async function createFolder(name, userId, parentId) {
    const newFolder = await prisma.folder.create({
        data: {
            name,
            parentId,
            userId,
        },
    });

    return newFolder.id;
}

function buildFolderTree(dbRows) {
    const folders = {};
    let rootId;

    for (const row of dbRows) {
        folders[row.id] = row;
        folders[row.id].children = [];
    }

    for (const folder of Object.values(folders)) {
        if (folder.parentId === null) {
            rootId = folder.id;
        } else {
            folders[folder.parentId].children.push(folder.id);
        }
    }

    return { folders, rootId };
}

function getFolderPath(tree, folderId) {
    let current = tree[folderId];
    const path = [];

    while (current) {
        path.push(current.id);
        current = tree[current.parentId];
    }

    return path.reverse();
}

async function createUserAndRootFolder({ username, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                username,
                password: hashedPassword,
            },
        });

        const folder = await tx.folder.create({
            data: {
                name: username,
                userId: user.id,
            },
        });

        return user;
    });

    return result.id;
}

async function isFolderOwner(userId, folderId) {
    const folder = await prisma.folder.findFirst({
        where: {
            userId,
            folderId,
        },
    });

    return folder !== null;
}

async function renameFolder(folderId, name) {
    await prisma.folder.update({
        data: {
            name,
        },
        where: {
            id: folderId,
        },
    });
}

async function deleteFolder(folderId) {
    const children = await prisma.folder.findMany({
        where: {
            parentId: folderId,
        },
    });

    for (const child of children) {
        await deleteFolder(child.id);
    }

    await prisma.file.deleteMany({
        where: {
            folderId,
        },
    });

    await prisma.folder.delete({
        where: {
            id: folderId,
        },
    });
}

async function getFileById(fileId) {
    const file = await prisma.file.findFirst({
        where: {
            id: fileId,
        },
        include: {
            folder: true,
        },
    });

    return file;
}

async function renameFile(fileId, name) {
    await prisma.file.update({
        data: {
            name,
        },
        where: {
            id: fileId,
        },
    });
}

async function deleteFile(fileId) {
    await prisma.file.delete({
        where: {
            id: fileId,
        },
    });
}

export default {
    getUserByUsername,
    createUser,
    getUserById,
    createRootFolder,
    createFile,
    getUserRootFolderId,
    getUserFolders,
    createFolder,
    buildFolderTree,
    createUserAndRootFolder,
    getFolderPath,
    isFolderOwner,
    getUserFolder,
    renameFolder,
    deleteFolder,
    getFileById,
    renameFile,
    deleteFile
};
