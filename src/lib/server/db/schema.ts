import type { Form } from "$lib/neoform/types/formDefinition";
import { boolean, integer, jsonb, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	email: text("email").notNull().unique(),
	displayName: text("display_name").notNull(),
	passwordHash: text("password_hash").default("").notNull(),
	isAdmin: boolean("is_admin").default(false).notNull(),
	isDev: boolean("is_dev").default(false).notNull(),
});

export const loginToken = pgTable("login_token", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
	targetAddress: text("target_address").default("/account").notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull()
});

export const application = pgTable("application", {
	id: text("id").primaryKey(),
	owner: text("user_id").notNull().references(() => user.id),
	displayName: text("display_name").notNull(),
	redirectTo: text("redirect_to").notNull(),
	secretHash: text("secret").notNull(),
});

export const userRequestToken = pgTable("user_request_token", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id)
});

export type UserRequestTokenI = typeof userRequestToken.$inferInsert;
export type UserRequestToken = typeof userRequestToken.$inferSelect;

export type ApplicationI = typeof application.$inferInsert;
export type Application = typeof application.$inferSelect;

export type SessionI = typeof session.$inferInsert;
export type Session = typeof session.$inferSelect;

export type LoginTokenI = typeof loginToken.$inferInsert;
export type LoginToken = typeof loginToken.$inferSelect;

export type UserI = typeof user.$inferInsert;
export type User = typeof user.$inferSelect;
