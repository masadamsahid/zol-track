import { pgTable, index, text, timestamp, unique, boolean, foreignKey, serial, integer, bigserial, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const jobApplicationStatus = pgEnum("job_application_status", ['LISTED', 'APPLIED', 'INTERVIEW', 'OFFER', 'SIGNED', 'REJECTED', 'DECLINED'])
export const workLocationType = pgEnum("work_location_type", ['ONSITE', 'REMOTE', 'HYBRID'])


export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops")),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	index("account_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	index("session_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const companies = pgTable("companies", {
	id: serial().primaryKey().notNull(),
	slug: text(),
	name: text(),
	desc: text(),
	logoUrl: text("logo_url"),
	websiteUrl: text("website_url"),
	address: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("company_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	unique("companies_slug_unique").on(table.slug),
]);

export const applications = pgTable("applications", {
	id: serial().primaryKey().notNull(),
	companyId: integer("company_id"),
	userId: text("user_id").notNull(),
	position: text().notNull(),
	jobUrl: text("job_url"),
	jobDescription: text("job_description"),
	notes: text(),
	salaryCurrency: text("salary_currency"),
	minSalary: bigserial("min_salary", { mode: "bigint" }).notNull(),
	maxSalary: bigserial("max_salary", { mode: "bigint" }).notNull(),
	location: text(),
	remote: workLocationType().default('ONSITE').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	status: jobApplicationStatus().default('LISTED').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("job_application_companyId_idx").using("btree", table.companyId.asc().nullsLast().op("int4_ops")),
	index("job_application_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "applications_company_id_companies_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "applications_user_id_user_id_fk"
		}).onDelete("cascade"),
]);
