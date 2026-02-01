import { betterAuthMacro } from "@/macros/auth.macros";
import Elysia, { t } from "elysia";
import ApplicationsService from "./applications.service";
import { findAllMyApplicationsSchema, insertApplicationSchema } from "./applications.schema";


const applicationsRoutes = new Elysia({ prefix: "/applications" })
  .use(betterAuthMacro);

applicationsRoutes
  .post("/", async (c) => {
    const data = c.body;
    const newApplication = await ApplicationsService.createApplication({
      companyId: data.companyId,
      userId: c.user.id,
      position: data.position,
      notes: data.notes,
      salaryCurrency: data.salaryCurrency,
      minSalary: data.minSalary,
      maxSalary: data.maxSalary,
      location: data.location,
      jobDescription: data.jobDescription,
      remote: data.remote,
      status: data.status,
    });
    c.set.status = 201;
    return { message: "Application created successfully", data: newApplication };
  }, {
    body: insertApplicationSchema,
    detail: {
      summary: "Create a New Application",
      tags: ["Applications"],
    },
    auth: true,
  })
  
  .get("/", async (c) => {
    const query = c.query;    
    const applications = await ApplicationsService.findAllApplicationsByUserId(c.user.id, query);
    return { message: "Success retrieving applications", data: applications };
  }, {
    query: findAllMyApplicationsSchema,
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
    params: t.Object({
      applicationId: t.Number({ examples: [1] }),
    }),
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
      companyId: data.companyId,
      position: data.position,
      notes: data.notes,
      salaryCurrency: data.salaryCurrency,
      minSalary: data.minSalary,
      maxSalary: data.maxSalary,
      location: data.location,
      jobDescription: data.jobDescription,
      remote: data.remote,
      status: data.status,
    });
    return { message: "Application updated successfully", data: updatedApplication };
  }, {
    body: t.Partial(insertApplicationSchema),
    detail: {
      summary: "Update Application by ID",
      tags: ["Applications"],
    },
    auth: true,
  });

export default applicationsRoutes;