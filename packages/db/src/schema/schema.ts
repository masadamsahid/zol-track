import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index, integer, bigserial, serial, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const Company = pgTable(
  "companies",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").unique(),
    name: text("name"),
    desc: text("desc"),
    logoUrl: text("logo_url"),
    websiteUrl: text("website_url"),
    address: text("address"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("company_slug_idx").on(table.slug),
  ],
);

// export const applicationStatus = pgEnum("job_application_status", [
//   "LISTED",
//   "APPLIED",
//   "INTERVIEW",
//   "OFFER",
//   "REJECTED",
//   "DECLINED",
//   "SIGNED",
// ]);

export const WorkLocationType = pgEnum("work_location_type", [
  "ONSITE",
  "REMOTE",
  "HYBRID",
]);

export const Application = pgTable(
  "applications",
  {
    id: serial("id").primaryKey(),
    companyId: integer("company_id")
      .notNull()
      .references(() => Company.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    position: text("position").notNull(),
    jobUrl: text("job_url"),
    jobDescription: text("job_description"),
    notes: text("notes"),
    salaryCurrency: text("salary_currency"),
    minSalary: bigserial("min_salary", { mode: "number" }),
    maxSalary: bigserial("max_salary", { mode: "number" }),
    location: text("location"),
    remote: WorkLocationType("remote").default("ONSITE").notNull(),
    // status: applicationStatus("status").default("LISTED").notNull(),
    listedAt: timestamp("listed_at").defaultNow().notNull(),
    appliedAt: timestamp("applied_at"),
    interviewAt: timestamp("interview_at"),
    offerAt: timestamp("offer_at"),
    rejectedAt: timestamp("rejected_at"),
    declinedAt: timestamp("declined_at"),
    signedAt: timestamp("signed_at"),
    archivedAt: timestamp("archived_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("job_application_companyId_idx").on(table.companyId),
    index("job_application_userId_idx").on(table.userId),
  ],
);

export const companyRelations = relations(Company, ({ many }) => ({
  applications: many(Application),
}));

export const applicationsRelations = relations(Application, ({ one }) => ({
  company: one(Company, {
    fields: [Application.companyId],
    references: [Company.id],
  }),
  user: one(user, {
    fields: [Application.userId],
    references: [user.id],
  }),
}));





