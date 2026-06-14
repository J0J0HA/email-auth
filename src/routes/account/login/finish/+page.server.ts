import * as auth from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";


export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, "/account");
	}
	return {};
};

export const actions: Actions = {
	loginWithToken: async (event) => {
		console.log("TRY LOG IN")
		const formData = await event.request.formData();
		const token = formData.get("token");
		console.log("TOKEN", token)

		if (typeof token !== "string") {
			return fail(400, { message: "Ungültiges Login-Token" });
		}

		const loginToken = await auth.validateLoginToken(token);
		if (!loginToken) {
			return fail(400, { message: "Ungültiges Login-Token" });
		}

		await auth.deleteLoginToken(token);

		const sessionToken = auth.generateSessionToken();
		try {
			const session = await auth.createSession(sessionToken, loginToken.userId);
			console.log(session)
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch (e) {
			console.error(e);
			return fail(500, { message: "Datenbankfehler" });
		}

		console.log("GOTO TARGET ADDRESS", loginToken.targetAddress)

		return redirect(307, loginToken.targetAddress);
	},
};
