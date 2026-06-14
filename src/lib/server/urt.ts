import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { encodeBase64url } from "@oslojs/encoding";


export function generateURT() {
    const bytes = crypto.getRandomValues(new Uint8Array(18));
    const token = encodeBase64url(bytes);
    return token;
}

export async function getUserForURT(id: string) {
    const app = await db.select({
        id: table.user.id,
        displayName: table.user.displayName,
        email: table.user.email,
    })
        .from(table.userRequestToken)
        .leftJoin(table.user, eq(table.userRequestToken.userId, table.user.id))
        .where(eq(table.userRequestToken.id, id))
        .limit(1);
    if (app.length === 0) return null;
    // await db.delete(table.userRequestToken).where(eq(table.userRequestToken.id, id));
    return app[0];
}

export async function createURT(userId: string) {
    const urt: table.UserRequestTokenI = {
        id: generateURT(),
        userId,
    };
    await db.insert(table.userRequestToken).values(urt);
    return urt.id;
}
