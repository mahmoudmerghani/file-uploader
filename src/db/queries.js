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

async function createFile({ name, mimeType, size, path, folderId, userId }) {
    const createFile = prisma.file.create({
        data: {
            name,
            mimeType,
            size,
            path,
            folderId,
        },
    });

    const updateQuote = prisma.user.update({
        data: {
            quota: {
                increment: size,
            },
        },
        where: {
            id: userId,
        },
    });

    await prisma.$transaction([createFile, updateQuote]);
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

async function deleteFolder(folderId, userId) {
    const folders = await getUserFolders(userId);
    const folderTree = buildFolderTree(folders);

    const folderIds = [];
    const files = [];
    const stack = [folderId];

    while (stack.length) {
        const currentFolderId = stack.pop();
        folderIds.push(currentFolderId);
        files.push(...folderTree.folders[currentFolderId].files);

        for (const id of folderTree.folders[currentFolderId].children) {
            stack.push(id);
        }
    }

    const totalFilesSize = files.reduce((sum, curr) => sum + curr.size, 0);

    await prisma.$transaction(async (tx) => {
        await tx.shareLink.deleteMany({
            where: {
                folderId: {
                    in: folderIds,
                },
            },
        });

        await tx.file.deleteMany({
            where: {
                folderId: {
                    in: folderIds,
                },
            },
        });

        await tx.folder.deleteMany({
            where: {
                id: {
                    in: folderIds,
                },
            },
        });

        await tx.user.update({
            data: {
                quota: {
                    decrement: totalFilesSize,
                },
            },
            where: {
                id: userId,
            },
        });
    });

    return files;
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
    await prisma.$transaction(async (tx) => {
        const deletedFile = await tx.file.delete({
            where: {
                id: fileId,
            },
            include: {
                folder: true,
            },
        });

        await tx.user.update({
            data: {
                quota: {
                    decrement: deletedFile.size,
                },
            },

            where: {
                id: deletedFile.folder.userId,
            },
        });
    });
}

async function createShareLink(folderId, expirationPeriod) {
    const link = await prisma.shareLink.create({
        data: {
            folderId,
            expiresAt: new Date(Date.now() + expirationPeriod),
        },
    });

    return link.id;
}

async function getSharedLink(linkId) {
    const link = await prisma.shareLink.findFirst({
        where: {
            id: linkId,
        },
        include: {
            folder: {
                include: {
                    user: true,
                },
            },
        },
    });

    return link;
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
    deleteFile,
    createShareLink,
    getSharedLink,
};
