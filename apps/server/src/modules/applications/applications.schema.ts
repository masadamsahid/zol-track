import { t } from "elysia";

export const findAllMyApplicationsSchema = t.Object({
  search: t.Optional(t.String({ examples: ["Engineer"] })),
  location: t.Optional(t.String({ examples: ["New York"] })),
  remote: t.Optional(t.Union([
    t.Literal("ONSITE"),
    t.Literal("REMOTE"),
    t.Literal("HYBRID"),
  ], { examples: ["REMOTE"] })),
  companyIds: t.Optional(t.Array(t.Number({ examples: [1, 2, 3] }))),
});

export type FindAllMyApplicationsSchema = typeof findAllMyApplicationsSchema.static;


export const insertApplicationSchema = t.Object({
  companyId: t.Optional(t.Number({ examples: [1] })),
  position: t.String({ examples: ["Software Engineer"] }),
  notes: t.Optional(t.String({ examples: ["Exciting opportunity at a growing startup"] })),
  salaryCurrency: t.Optional(t.String({ examples: ["IDR"] })),
  minSalary: t.Optional(t.Number({ examples: [15500000] })),
  maxSalary: t.Optional(t.Number({ examples: [16800000] })),
  location: t.Optional(t.String({ examples: ["New York, NY"] })),
  jobDescription: t.Optional(t.String({ examples: ["Responsible for developing and maintaining web applications."] })),
  remote: t.Optional(t.Union([
    t.Literal("ONSITE"),
    t.Literal("REMOTE"),
    t.Literal("HYBRID"),
  ], { examples: ["HYBRID"] })),
  status: t.Optional(t.Enum({
    LISTED: "LISTED",
    APPLIED: "APPLIED",
    INTERVIEW: "INTERVIEW",
    OFFER: "OFFER",
    SIGNED: "SIGNED",
    REJECTED: "REJECTED",
    DECLINED: "DECLINED",
  }, { examples: ["APPLIED"] })),
});

export type InsertApplicationSchema = typeof insertApplicationSchema.static;

// export const updateApplicationSchema = t.Object({
//   companyId: t.Optional(t.Number({ examples: [1] })),
//   position: t.Optional(t.String({ examples: ["Software Engineer"] })),
//   notes: t.Optional(t.String({ examples: ["Exciting opportunity at a growing startup"] })),
//   salaryCurrency: t.Optional(t.String({ examples: ["IDR"] })),
//   minSalary: t.Optional(t.Number({ examples: [15500000] })),
//   maxSalary: t.Optional(t.Number({ examples: [16800000] })),
//   location: t.Optional(t.String({ examples: ["New York, NY"] })),
//   jobDescription: t.Optional(t.String({ examples: ["Responsible for developing and maintaining web applications."] })),
//   remote: t.Optional(t.Union([
//     t.Literal("ONSITE"),
//     t.Literal("REMOTE"),
//     t.Literal("HYBRID"),
//   ], { examples: ["HYBRID"] })),
//   status: t.Optional(t.Enum({
//     LISTED: "LISTED",
//     APPLIED: "APPLIED",
//     INTERVIEW: "INTERVIEW",
//     OFFER: "OFFER",
//     SIGNED: "SIGNED",
//     REJECTED: "REJECTED",
//     DECLINED: "DECLINED",
//   }, { examples: ["APPLIED"] })),
// });

// export type UpdateApplicationSchema = typeof updateApplicationSchema.static;