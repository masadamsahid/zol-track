import { and, asc, db, eq, ilike, inArray, like } from "@zol-track/db";
import { Application } from "@zol-track/db/schema/schema";
import type { FindAllMyApplicationsSchema, InsertApplicationSchema } from "./applications.schema";


abstract class ApplicationsRepository {
  static async findAllApplicationsByUserId(userId: string, options: FindAllMyApplicationsSchema) {
    
    const applications = await db.query.Application.findMany({
      columns: {
        id: true,
        position: true,
        notes: true,
        salaryCurrency: true,
        minSalary: true,
        maxSalary: true,
        location: true,
        remote: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      where: and(
        eq(Application.userId, userId),
        options.search ? ilike(Application.position, `%${options.search}%`) : undefined,
        options.location ? ilike(Application.location, `%${options.location}%`) : undefined,
        options.remote ? eq(Application.remote, options.remote) : undefined,
        options.companyIds ? inArray(Application.companyId, options.companyIds) : undefined,
      ),
      with: {
        company: {
          columns: { id: true, name: true, slug: true, logoUrl: true },
        },
      },
    });

    return applications;
  }

  static async findById(id: number) {
    const application = await db.query.Application.findFirst({
      where: eq(Application.id, id),
      with: {
        company: {
          columns: { id: true, name: true, slug: true, logoUrl: true },
        },
      },
    });
    return application;
  }

  static async insert(data: InsertApplicationSchema & { userId: string }) {
    const [newApplication] = await db
      .insert(Application)
      .values({
        companyId: data.companyId,
        userId: data.userId,
        position: data.position,
        notes: data.notes,
        salaryCurrency: data.salaryCurrency,
        minSalary: data.minSalary,
        maxSalary: data.maxSalary,
        location: data.location,
        jobDescription: data.jobDescription,
        remote: data.remote,
        status: data.status,
      }).returning();
    return newApplication;
  }

  static async updateById(id: number, data: Partial<InsertApplicationSchema>) {
    const [updatedApplication] = await db
      .update(Application)
      .set({
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
      })
      .where(eq(Application.id, id))
      .returning();
    return updatedApplication;
  }
}

export default ApplicationsRepository;