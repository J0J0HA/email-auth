import { getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { generateUserId, validateEmail } from "./auth";

export function getUser() {
    const { locals } = getRequestEvent();

    if (!locals.user) {
        return null;
    }

    return locals.user;
}

export function getRequiredUser() {
    const { locals, url } = getRequestEvent();

    if (!locals.user) {
        return redirect(302, "/account/login?return=" + encodeURIComponent(url.toString()));
    }

    return locals.user;
}

export function updateUser(userId: string, data: { displayName?: string; email?: string, isAdmin?: boolean, isDev?: boolean }) {
    if (data.email && !validateEmail(data.email)) {
        throw new Error("Ungültige E-Mail-Adresse");
    }
    return db
        .update(table.user)
        .set(data)
        .where(eq(table.user.id, userId));
}

export function listUsers() {
    return db.select().from(table.user);
}

export async function getUserById(userId: string) {
    const user = await db.select().from(table.user).where(eq(table.user.id, userId)).limit(1);
    if (user.length !== 1) return null;
    return user[0];
}

export function createUser(email: string, displayName: string, isDev = false, isAdmin = false) {
    if (!validateEmail(email)) {
        throw new Error("Ungültige E-Mail-Adresse");
    }
    const user: table.UserI = {
        id: generateUserId(),
        email,
        displayName,
        isAdmin,
        isDev,
    };
    return db.insert(table.user).values(user);
}

export async function deleteUser(userId: string) {
    // delete all login tokens
    await db.delete(table.loginToken).where(eq(table.loginToken.userId, userId));
    // delete all sessions
    await db.delete(table.session).where(eq(table.session.userId, userId));
    // delete user
    await db.delete(table.user).where(eq(table.user.id, userId));
}