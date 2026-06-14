import { getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { generateUserId, validateEmail } from "./auth";
import { success } from "zod";


export function listApplications() {
    return db.select().from(table.application);
}

export function listApplicationsByUser(userId: string) {
    return db.select().from(table.application).where(eq(table.application.owner, userId));
}

export async function getApplication(id: string) {
    const app = await db.select().from(table.application).where(eq(table.application.id, id)).limit(1);
    if (app.length === 0) return null;
    return app[0];
}

export function createApplication(owner: string, displayName: string, redirectTo: string) {
    if (!redirectTo.startsWith("https://") && !redirectTo.startsWith("http://"))
        return {
            success: false,
            message: "Ungültige Weilterleitungs-Adresse"
        }
    const application: table.ApplicationI = {
        id: generateUserId(),
        owner,
        displayName,
        redirectTo,
    };
    return db.insert(table.application).values(application);
}

export function updateApplication(applicationId: string, { displayName, redirectTo }: { displayName: string, redirectTo: string }) {
    if (!redirectTo.startsWith("https://") && !redirectTo.startsWith("http://"))
        return {
            success: false,
            message: "Ungültige Weilterleitungs-Adresse"
        }
    return db
        .update(table.application)
        .set({ displayName, redirectTo })
        .where(eq(table.application.id, applicationId));
}
export async function deleteApplication(applicationId: string) {
    // delete application
    await db.delete(table.application).where(eq(table.application.id, applicationId));
}