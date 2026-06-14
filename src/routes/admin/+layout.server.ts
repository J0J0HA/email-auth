import { getUser } from "$lib/server/users";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
    const user = getUser();

    if (!user?.isAdmin) {
        return error(403, { message: "Nicht authorisiert" });
    }

    return { user };
};
