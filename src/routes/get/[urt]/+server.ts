import { json } from "@sveltejs/kit";
import type { RequestHandler } from './$types';
import { getUserForURT } from "$lib/server/urt";

export const GET: RequestHandler = async ({ params }) => {
    const user = await getUserForURT(params.urt);
    return json(user);
}