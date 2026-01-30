import { betterAuthMacro } from "@/macros/auth.macros";
import Elysia, { t } from "elysia";
import ApplicationsService from "./applications.service";


const applicationsRoutes = new Elysia({ prefix: "/applications" })
  .use(betterAuthMacro);

applicationsRoutes
  .post("/", async (c) => {
    const data = c.body;
    const newApplication = await ApplicationsService.createApplication({
      companyId: data.companyId,
      userId: c.user.id,
      position: data.position,
      notes: data.description,
    });
    c.set.status = 201;
    return { message: "Application created successfully", data: newApplication };
  }, {
    body: t.Object({
      name: t.String(),
      description: t.Optional(t.String()),
      companyId: t.Number(),
      position: t.String(),
    }),
    detail: {
      summary: "Create a New Application",
      tags: ["Applications"],
    },
    auth: true,
  })
  .get("/", async (c) => {
    const query = c.query;
    const applications = await ApplicationsService.findAllApplicationsByUserId(c.user.id, {
      cursorId: query.cursorId,
      limit: query.limit,
      search: query.search,
    });
    return { message: "Success retrieving applications", data: applications };
  }, {
    query: t.Object({
      cursorId: t.Optional(t.Number()),
      limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
      search: t.Optional(t.String()),
    }),
    detail: {
      summary: "Get All Applications for Authenticated User",
      tags: ["Applications"],
    },
    auth: true,
  })
  .get("/:applicationId", async (c) => {
    const { applicationId } = c.params;
    const application = await ApplicationsService.findApplicationById(Number(applicationId));
    return { message: "Success retrieving application", data: application };
  }, {
    detail: {
      summary: "Get Application by ID",
      tags: ["Applications"],
    },
    auth: true,
  })
  .put("/:applicationId", async (c) => {
    const { applicationId } = c.params;
    const data = c.body;
    const updatedApplication = await ApplicationsService.updateApplicationById(Number(applicationId), {
      position: data.position,
      notes: data.description,
      location: data.location,
    });
    return { message: "Application updated successfully", data: updatedApplication };
  }, {
    body: t.Object({
      position: t.Optional(t.String()),
      description: t.Optional(t.String()),
      location: t.Optional(t.String()),
    }),
    detail: {
      summary: "Update Application by ID",
      tags: ["Applications"],
    },
    auth: true,
  })
  .post("/:applicationId/archive", async (c) => {
    const { applicationId } = c.params;
    const archivedApplication = await ApplicationsService.archiveApplicationById(Number(applicationId));
    return { message: "Application archived successfully", data: archivedApplication };
  }, {
    detail: {
      summary: "Archive Application by ID",
      tags: ["Applications"],
    },
    auth: true,
  });

export default applicationsRoutes;