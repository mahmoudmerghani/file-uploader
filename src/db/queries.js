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

    return folder?.id;
}

async function getUserFolders(userId) {
    const folders = await prisma.folder.findMany({
        where: { userId },
        include: { files: true },
    });

    return folders;
}

export default {
    getUserByUsername,
    createUser,
    getUserById,
    createRootFolder,
    createFile,
    getUserRootFolderId,
    getUserFolders,
};
