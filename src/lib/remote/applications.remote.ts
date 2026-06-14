import { command, getRequestEvent, query } from "$app/server";
import { createLoginToken, createSession, generateLoginToken, generateSessionToken, setSessionTokenCookie } from "$lib/server/auth";
import * as users from "$lib/server/users";
import * as applications from "$lib/server/applications";
import { redirect } from "@sveltejs/kit";
import z from "zod";

export const getMyApplications = query(async () => {
    const user = users.getRequiredUser();
    if (!user.isDev) return [];
    return await applications.listApplicationsByUser(user.id);
});

export const getAllApplications = query(async () => {
    const user = users.getRequiredUser();
    if (!user.isAdmin) return [];
    return await applications.listApplications();
});

export const deleteApplication = command(z.object({
    appId: z.string(),
}), async ({ appId }) => {
    const user = users.getUser();

    if (!user) {
        return { success: false, message: "Nicht authentifiziert" };
    }

    if (!user.isDev) {
        return { success: false, message: "Nicht authorisiert" };
    }

    try {
        if (!user.isAdmin) {
            const application = await applications.getApplication(appId);
            if (application?.owner !== user.id)
                return {
                    success: false, message: "Das gehört jemand anderem"
                }
        }
        await applications.deleteApplication(appId);
    }
    catch (e) {
        console.error(e);
        return { success: false, message: "Datenbankfehler" };
    }

    return { success: true, message: "Applikation gelöscht" };
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