import { dev } from "$app/environment";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCase, encodeBase64url, encodeHexLowerCase } from "@oslojs/encoding";
import { type RequestEvent } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = "auth-session";

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(token: string, userId: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: table.SessionI = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
	};
	await db.insert(table.session).values(session);
	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const [result] = await db
		.select({
			// Adjust user table here to tweak returned data
			user: { id: table.user.id, email: table.user.email, displayName: table.user.displayName, isAdmin: table.user.isAdmin, isDev: table.user.isDev },
			session: table.session
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, sessionId));

	if (!result) {
		return { session: null, user: null };
	}
	const { session, user } = result;

	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		await db.delete(table.session).where(eq(table.session.id, session.id));
		return { session: null, user: null };
	}

	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		await db
			.update(table.session)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.session.id, session.id));
	}

	return { session, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export function generateLoginToken() {
	// login token should be six chars, of uppercase letters and digits, for easy use in emails.
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let baseValues = crypto.getRandomValues(new Uint8Array(9));
	let token = "";
	for (let value of baseValues) {
		token += chars[value % chars.length];
	}
	return token;
}

export async function createLoginToken(token: string, userId: string, targetAddress?: string) {
	const tokenId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const loginToken: table.LoginTokenI = {
		id: tokenId,
		userId,
		expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
		targetAddress,
	};
	await db.insert(table.loginToken).values(loginToken);
	return loginToken;
}

export async function validateLoginToken(token: string) {
	const tokenId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const result = await db
		.select()
		.from(table.loginToken)
		.where(eq(table.loginToken.id, tokenId))
		.limit(1);

	if (result.length === 0) {
		return null;
	}
	const loginToken = result[0];

	const tokenExpired = Date.now() >= loginToken.expiresAt.getTime();
	if (tokenExpired) {
		await db.delete(table.loginToken).where(eq(table.loginToken.id, loginToken.id));
		return null;
	}

	await db.delete(table.loginToken).where(eq(table.loginToken.id, loginToken.id));

	return loginToken;
}

export function deleteLoginToken(token: string) {
	if (!token) return;
	const tokenId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	return db.delete(table.loginToken).where(eq(table.loginToken.id, tokenId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: "/",
		secure: !dev,
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: "/",
		secure: !dev,
	});
}

export function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}
const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

export function validateEmail(email: unknown): email is string {
	return (
		typeof email === "string" &&
		email.length >= 3 &&
		email.length <= 255 &&
		EMAIL_REGEX.test(email)
	);
}

export function validatePassword(password: unknown): password is string {
	return (
		typeof password === "string" &&
		password.length >= 6 &&
		password.length <= 255
	);
}

export async function canSetup() {
	const exisitingUsers = await db
		.select()
		.from(table.user)
		.where(eq(table.user.isAdmin, true));
	return exisitingUsers.length === 0;
}
