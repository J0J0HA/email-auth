import { sendEmail } from "$lib/server/email";
import { createUser, getRequiredUser, getUser, updateUser } from "$lib/server/users";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { validateEmail } from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async () => {
    const user = getUser();

    if (!user?.isAdmin) {
        return { user, form: null };
    }

    return { user };
};

export const actions: Actions = {
    createUser: async ({ request }) => {
        const user = getRequiredUser();

        if (!user.isAdmin) {
            return fail(403, { success: false, message: "Nicht authorisiert." });
        }
        const data = await request.formData();
        console.log(data);

        const email = data.get("email")?.toString();
        if (!email || typeof email !== "string" || !validateEmail(email)) {
            return fail(400, { success: false, message: "Ungültige E-Mail-Adresse" });
        }

        const displayName = data.get("displayName")?.toString() || email.split("@")[0] || "User";
        const isAdmin = user.id === data.get("userId") ? user.isAdmin : data.get("isAdmin") === "on";
        const isDev = user.isAdmin || (user.id === data.get("userId") ? user.isDev : data.get("isDev") === "on");

        const existingUser = await db.select().from(table.user).where(eq(table.user.email, email));
        if (existingUser.length > 0) {
            return fail(400, { success: false, message: "E-Mail_Adresse bereits in Verwendung" });
        }

        try {
            await createUser(email, displayName, isDev, isAdmin);
            await sendEmail(email, "Dein Account wurde erstellt",
                `Hallo ${displayName},
Bei ${process.env.ORIGIN || "http://localhost:5173"} (Abiwood27) wurde gerade ein Account für dich erstellt.

Du kannst dich mit dieser E-Mail-Adresse unter folgendem Link anmelden:
${origin}/account/login

- Abiwood27
`
            );
        } catch (e) {
            console.error(e);
            return fail(500, { success: false, message: "Datenbankfehler" });
        }

        return {
            success: true,
            message: "Nutzer erstellt",
        };
    },
    updateUser: async ({ request }) => {
        const user = getRequiredUser();

        if (!user.isAdmin) {
            return fail(403, { success: false, message: "Nicht authorisiert." });
        }
        const data = await request.formData();

        const userId = data.get("userId")?.toString();
        if (!userId || typeof userId !== "string") {
            return fail(400, { success: false, message: "Dieser Nutzer existiert nicht." });
        }

        const email = data.get("email")?.toString();
        if (!email || typeof email !== "string" || !validateEmail(email)) {
            return fail(400, { success: false, message: "Ungültige E-Mail-Adresse" });
        }

        const displayName = data.get("displayName")?.toString() || email.split("@")[0] || "User";
        const isDev = data.get("isDev") === "on";
        const isAdmin = data.get("isAdmin") === "on";

        try {
            await updateUser(userId, { displayName, email, isDev, isAdmin });
        } catch (e) {
            console.error(e);
            return fail(500, { success: false, message: "Datenbankfehler" });
        }

        return {
            success: true,
            message: "Nutzer aktualisiert",
        };
    }
};