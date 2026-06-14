import { getRequiredUser, getUser } from "$lib/server/users";
import { createApplication, getApplication, updateApplication } from "$lib/server/applications";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    const user = getUser();
    return { user };
};

export const actions: Actions = {
    createApplication: async ({ request }) => {
        const user = getRequiredUser();

        if (!user.isDev) {
            return fail(403, { success: false, message: "Nicht authorisiert." });
        }

        const data = await request.formData();

        const displayName = data.get("displayName")?.toString();
        const redirectTo = data.get("redirectTo")?.toString();
        if (!displayName || (!redirectTo.startsWith("https://") && !redirectTo.startsWith("http://"))) {
            return fail(400, { success: false, message: "Ungültige Daten" });
        }

        let app;
        try {
            app = await createApplication(user.id, displayName, redirectTo);
        } catch (e) {
            console.error(e);
            return fail(500, { success: false, message: "Datenbankfehler" });
        }

        return {
            success: true,
            message: "Applikation erstellt. Secret (viewed only once): " + app.secret,
        };
    },
    updateApplication: async ({ request }) => {
        const user = getRequiredUser();

        if (!user.isDev) {
            return fail(403, { success: false, message: "Nicht authorisiert." });
        }

        const data = await request.formData();

        const appId = data.get("appId")?.toString();
        const displayName = data.get("displayName")?.toString();
        const redirectTo = data.get("redirectTo")?.toString();
        if (!displayName || (!redirectTo.startsWith("https://") && !redirectTo.startsWith("http://"))) {
            return fail(400, { success: false, message: "Ungültige Daten" });
        }

        try {
            const application = await getApplication(appId);
            if (application === null)
                return fail(400, { success: false, message: "Diese App exisitert nicht" })
            if (!user.isAdmin) {
                if (application?.owner !== user.id)
                    return {
                        success: false, message: "Das gehört jemand anderem"
                    }
            }
            await updateApplication(appId, { displayName, redirectTo });
        }
        catch (e) {
            console.error(e);
            return { success: false, message: "Datenbankfehler" };
        }

        return {
            success: true,
            message: "App aktualisiert",
        };
    }
};