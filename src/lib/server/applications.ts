import * as bcrypt from "bcrypt";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { json, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { generateUserId, validateEmail } from "./auth";
import { success } from "zod";
import { encodeBase64url } from "@oslojs/encoding";
import { DISPLAY } from "$env/static/private";


export function generateSecret() {
    const bytes = crypto.getRandomValues(new Uint8Array(18));
    const secret = encodeBase64url(bytes);
    return secret;
}

export function listApplications() {
    return db.select().from(table.application);
}

export function listApplicationsByUser(userId: string) {
    return db.select().from(table.application).where(eq(table.application.owner, userId));
}

export async function getApplication(id: string) {
    const app = await db.select({
        id: table.application.id,
        displayName: table.application.displayName,
        redirectTo: table.application.redirectTo,
        owner: {
            id: table.user.id,
            displayName: table.user.displayName,
            email: table.user.email,
        }
    }).from(table.application).where(eq(table.application.id, id)).leftJoin(table.user, eq(table.application.owner, table.user.id)).limit(1);
    if (app.length === 0) return null;
    return app[0];
}

export async function createApplication(owner: string, displayName: string, redirectTo: string) {
    if (!redirectTo.startsWith("https://") && !redirectTo.startsWith("http://"))
        return {
            success: false,
            message: "Ungültige Weilterleitungs-Adresse"
        }
    const secret = generateSecret();
    const application: table.ApplicationI = {
        id: generateUserId(),
        owner,
        displayName,
        redirectTo,
        secretHash: await bcrypt.hash(secret, 10),
    };
    await db.insert(table.application).values(application);
    return {
        id: application.id,
        owner,
        displayName,
        redirectTo,
        secret,
    }
}

export async function verifyApplication(appId: string, secret: string) {
    const applications: table.Application[] = await db.select().from(table.application).where(eq(table.application.id, appId)).limit(1);
    if (applications.length !== 1) return null;
    const application = applications[0];

    if (!await bcrypt.compare(secret, application.secretHash)) return null;
    return application;
}

export async function verifyAppAuth(request) {
    const auth = request.headers.get("Authorization")?.split(" ");
    if (!auth || auth.length !== 3) return false;
    const [basic, clientId, secret] = auth;
    if (basic !== "Basic") return false;
    const application = await verifyApplication(clientId, secret);
    if (application === null) return false;
    return application;
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