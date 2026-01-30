import { createCompanySchema, findAllCompaniesSchema } from "@/modules/companies/companies.schema";
import Elysia from "elysia";
import CompaniesService from "./companies.service";

const companiesRoutes = new Elysia({ prefix: "/companies" });

companiesRoutes
  .post("/", async (c) => {
    const data = c.body;
    const newCompany = await CompaniesService.createCompany(data);

    c.set.status = 201;
    return { message: "Company created successfully", data: newCompany };
  }, {
    body: createCompanySchema,
    detail: {
      summary: "Create a New Company",
      tags: ["Companies"],
    },
  })
  .get("/", async (c) => {
    const query = c.query;
    const companies = await CompaniesService.findAllCompanies(query);
    return { message: "Success retrieving companies", data: companies };
  }, {
    query: findAllCompaniesSchema,
    detail: {
      summary: "Get All Companies",
      tags: ["Companies"],
    },
  })
  .get("/:companyId", async (c) => {
    const { companyId } = c.params;
    const company = await CompaniesService.findCompanyById(Number(companyId));
    return { message: "Success retrieving company", data: company };
  }, {
    detail: {
      summary: "Get Company by ID",
      tags: ["Companies"],
    },
  })
  .get("/slug/:slug", async (c) => {
    const { slug } = c.params;
    const company = await CompaniesService.findCompanyBySlug(slug);
    return { message: "Success retrieving company", data: company };
  }, {
    detail: {
      summary: "Get Company by Slug",
      tags: ["Companies"],
    },
  })
  .put("/:companyId", async (c) => {
    const { companyId } = c.params;
    const data = c.body;
    const updatedCompany = await CompaniesService.updateCompany(Number(companyId), data);
    return { message: "Company updated successfully", data: updatedCompany };
  }, {
    body: createCompanySchema,
    detail: {
      summary: 'Update Company by ID',
      tags: ["Companies"],
    },
  });

export default companiesRoutes;