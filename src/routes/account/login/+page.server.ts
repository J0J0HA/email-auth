import * as auth from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import type { Actions, PageServerLoad } from "./$types";
import { sendEmail } from "$lib/server/email";
import { get } from "http";
import { tr } from "zod/locales";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, "/account");
	}
	return {
	};
};

export const actions: Actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get("email");

		if (!auth.validateEmail(email)) {
			return fail(400, { message: "Ungültige E-Mail-Adresse" });
		}

		const results = await db
			.select()
			.from(table.user)
			.where(eq(table.user.email, email));

		if (results.length === 0) {
			return fail(400, { message: "Ungültige Anmeldedaten" });
		}

		const existingUser = results[0];

		const loginToken = auth.generateLoginToken();
		try {
			await auth.createLoginToken(loginToken, existingUser.id);
		} catch (e) {
			console.error(e);
			return fail(500, { message: "Datenbankfehler" });
		}

		try {
			await sendEmail(existingUser.email, "Login zu deinem Account",
				`Hallo ${existingUser.displayName},
Ein Login zu deinem Account wurde gerade versucht.

Du kannst dich auf diesem Gerät anmelden, indem du auf den folgenden Link klickst:
${process.env.ORIGIN || "http://localhost:5173"}/account/login/finish?code=${loginToken}

Wenn du dich auf einem anderen Gerät anmelden möchtest, gib bitte stattdessen den folgenden Code ein: ${loginToken}

Der Code und Link werden in 15 Minuten ungültig.
Wenn du dich nicht gerade anmelden wolltest, kannst du diese E-Mail ignorieren.

- Abiwood27
`
			);
		} catch (e) {
			console.error(e);
			return fail(500, { message: "Unbekannter Fehler" });
		}

		return redirect(307, "/account/login/finish");
	}
};
