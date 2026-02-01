import { relations } from "drizzle-orm/relations";
import { user, account, session, companies, applications } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	applications: many(applications),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const applicationsRelations = relations(applications, ({one}) => ({
	company: one(companies, {
		fields: [applications.companyId],
		references: [companies.id]
	}),
	user: one(user, {
		fields: [applications.userId],
		references: [user.id]
	}),
}));

export const companiesRelations = relations(companies, ({many}) => ({
	applications: many(applications),
}));