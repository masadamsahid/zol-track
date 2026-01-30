import { t } from "elysia";

export const findAllCompaniesSchema = t.Object({
  cursorId: t.Optional(t.Number()),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
  search: t.Optional(t.String()),
});

export type FindAllCompaniesSchema = typeof findAllCompaniesSchema.static;

export const createCompanySchema = t.Object({
  name: t.String(),
  slug: t.String({
    pattern: "^[a-z0-9-]+$",
    minLength: 3,
  }),
  address: t.Optional(t.String()),
  logoUrl: t.Optional(t.String({ format: "uri" })),
  websiteUrl: t.Optional(t.String({ format: "uri" })),
  desc: t.Optional(t.String()),
});

export type CreateCompanySchema = typeof createCompanySchema.static;
