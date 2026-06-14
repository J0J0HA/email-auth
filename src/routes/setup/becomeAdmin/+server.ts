import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { error, redirect } from "@sveltejs/kit";
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { getRequiredUser } from "$lib/server/users";
import { canSetup } from "$lib/server/auth";

export const GET: RequestHandler = async ({ }) => {
    if (!await canSetup()) return error(404);

    const user = getRequiredUser();
    await db.update(table.user).set({ isAdmin: true, isDev: true }).where(eq(table.user.id, user.id));

    return redirect(302, "/publish");
}