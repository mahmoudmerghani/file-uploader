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

        select: { id: true },
    });

    return user;
}

export default {
    getUserByUsername,
    createUser,
    getUserById
};
