import * as auth from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { error, fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import type { Actions, PageServerLoad } from "./$types";
import { sendEmail } from "$lib/server/email";
import { getUser } from "$lib/server/users";

export const load: PageServerLoad = async (event) => {
	if (!await auth.canSetup()) return error(404);

	if (getUser()) {
		return redirect(302, "/setup/becomeAdmin");
	}

	return {};
};

export const actions: Actions = {
	register: async (event) => {
		if (!await auth.canSetup()) return error(404);

		const formData = await event.request.formData();
		const email = formData.get("email");

		if (!auth.validateEmail(email)) {
			return fail(400, { message: "Invalid email" });
		}

		const existingUser = await db
			.select()
			.from(table.user)
			.where(eq(table.user.email, email));

		let user;
		if (existingUser.length === 0) {
			try {
				const userId = auth.generateUserId();
				user = { id: userId, email, displayName: email.split("@")[0], isAdmin: false, isDev: false }
				await db.insert(table.user).values(user);
			}
			catch {
				return fail(500, { message: "An error has occurred" });
			}
		} else {
			user = existingUser[0];
		}

		try {
			const loginToken = auth.generateLoginToken();
			await auth.createLoginToken(loginToken, user.id, "/setup/becomeAdmin");

			await sendEmail(user.email, "Your administrator account has been created",
				`Hello Administrator,

you have been invited to be administrator of Abiwood27 at ${process.env.HOSTNAME}.

You can log in by clicking the following link:
${process.env.SCHEME}://${process.env.HOSTNAME}/account/login/finish?code=${loginToken}

If you want to log in on another device, please enter the following code: ${loginToken}

If you don't know what this means, please ignore this email.

Best regards, Abiwood27
`);
		} catch {
			return fail(500, { message: "An error has occurred" });
		}
		return redirect(302, "/account/login/finish");
	},
};
