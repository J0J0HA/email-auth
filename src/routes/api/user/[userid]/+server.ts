import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from './$types';
import { getUser, getUserById } from "$lib/server/users";
import { verifyAppAuth } from "$lib/server/applications";

export const GET: RequestHandler = async ({ params, request }) => {
    const app = await verifyAppAuth(request);
    if (!app) return json({ error: "Not authenticated" }, { status: 401 });
    const user = await getUserById(params.userid);
    if (user === null) return json({ error: "No such user" }, { status: 404 });
    return json({
        id: user.id,
        displayName: user.displayName,
        email: user.email,
    });
}