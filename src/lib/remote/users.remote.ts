import { command, getRequestEvent, query } from "$app/server";
import { createLoginToken, createSession, generateLoginToken, generateSessionToken, setSessionTokenCookie } from "$lib/server/auth";
import * as users from "$lib/server/users";
import { redirect } from "@sveltejs/kit";
import z from "zod";

export const getUsers = query(async () => {
    const user = users.getRequiredUser();
    if (!user.isAdmin) return [];
    return await users.listUsers();
});

export const deleteUser = command(z.object({
    userId: z.string(),
}), async ({ userId }) => {
    const user = users.getUser();

    if (!user) {
        return { success: false, message: "Nicht authentifiziert" };
    }

    if (!user.isAdmin) {
        return { success: false, message: "Nicht authorisiert" };
    }

    try {
        await users.deleteUser(userId);
    }
    catch (e) {
        console.error(e);
        return { success: false, message: "Datenbankfehler" };
    }

    return { success: true, message: "Nutzer gelöscht" };
});

export const getLoginCodeForUser = command(z.object({
    userId: z.string(),
}), async ({ userId }) => {
    const user = users.getUser();

    if (!user) {
        return { success: false, message: "Nicht authentifiziert" };
    }

    if (!user.isAdmin) {
        return { success: false, message: "Nicht authorisiert" };
    }

    try {
        const loginToken = generateLoginToken();
        await createLoginToken(loginToken, userId, "/account");
        return { success: true, code: loginToken };
    }
    catch (e) {
        console.error(e);
        return { success: false, message: "Datenbankfehler" };
    }
});

export const loginAsUser = command(z.object({
    userId: z.string(),
}), async ({ userId }) => {
    const user = users.getUser();

    if (!user) {
        return { success: false, message: "Nicht authentifiziert" };
    }

    if (!user.isAdmin) {
        return { success: false, message: "Nicht authorisiert" };
    }

    try {
        const sessionToken = generateSessionToken();
        const session = await createSession(sessionToken, userId);
        setSessionTokenCookie(getRequestEvent(), sessionToken, session.expiresAt);
        return redirect(307, "/account");
    }
    catch (e) {
        console.error(e);
        return { success: false, message: "Datenbankfehler" };
    }
});