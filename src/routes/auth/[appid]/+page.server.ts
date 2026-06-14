import type { Actions, PageServerLoad } from "./$types";
import { getRequiredUser } from "$lib/server/users";
import { getApplication } from "$lib/server/applications";
import { fail, redirect } from "@sveltejs/kit";
import { createURT } from "$lib/server/urt";

export const load: PageServerLoad = async (event) => {
	const user = getRequiredUser();
	const app = await getApplication(event.params.appid);
	return { user, app };
};

export const actions: Actions = {
	continue: async (event) => {
        const user = getRequiredUser();
		const app = await getApplication(event.params.appid);
		if (!app) return fail(404, { message: "Du kannst dich nicht in nichts anmelden." })

		const urt = await createURT(user.id);

		const redirectURI = new URL(app?.redirectTo);
		redirectURI.searchParams.append("urt", urt);

		return redirect(302, redirectURI);
	},
};
