import { getRequiredUser, getUser } from "$lib/server/users";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { get } from "http";

export const load: LayoutServerLoad = async () => {
    const user = getRequiredUser();

    if (!user?.isDev) {
        return error(403, { message: "Nicht authorisiert" });
    }

    return { user };
};
