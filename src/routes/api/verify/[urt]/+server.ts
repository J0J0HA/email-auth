import { json } from "@sveltejs/kit";
import type { RequestHandler } from './$types';
import { getUserForURT } from "$lib/server/urt";
import { verifyAppAuth } from "$lib/server/applications";

export const GET: RequestHandler = async ({ params, request }) => {
    const app = await verifyAppAuth(request);
    if (!app) return json({ error: "Not authenticated" }, { status: 401 });
    const user = await getUserForURT(params.urt);
    return json(user);
}