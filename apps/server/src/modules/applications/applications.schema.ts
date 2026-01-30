import { t } from "elysia";

export const findAllApplicationsSchema = t.Object({
  cursorId: t.Optional(t.Number()),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
  search: t.Optional(t.String()),
});

export type FindAllApplicationsSchema = typeof findAllApplicationsSchema.static;