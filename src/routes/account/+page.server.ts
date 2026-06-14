import * as auth from "$lib/server/auth";
import { getRequiredUser, updateUser } from "$lib/server/users";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	const user = getRequiredUser();
	return { user };
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401, { message: "Nicht authentifiziert" });
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);

		return redirect(302, "/account/login");
	},
	updateAccount: async (event) => {
		const user = getRequiredUser();

		const formData = await event.request.formData();
		const displayName = formData.get("displayName");

		if (typeof displayName !== "string") {
			return fail(400, { message: "Ungültige Eingabe" });
		}

		try {
			await updateUser(user.id, { displayName });
		} catch (e) {
			console.error(e);
			return fail(500, { message: "Datenbankfehler" });
		}

		return redirect(302, "/account");
	}
};