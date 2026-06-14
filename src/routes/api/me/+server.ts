import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from './$types';
import { getUser, getUserById } from "$lib/server/users";
import { verifyAppAuth } from "$lib/server/applications";

export const GET: RequestHandler = async ({ params, request }) => {
    const app = await verifyAppAuth(request);
    if (!app) return json({ error: "Not authenticated" }, { status: 401 });
    return json({
        id: app.id,
        displayName: app.displayName,
        redirecTo: app.redirecTo,
    });
}