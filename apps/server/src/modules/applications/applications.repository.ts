import { and, asc, db, eq, like } from "@zol-track/db";
import { Application } from "@zol-track/db/schema/schema";
import type { FindAllApplicationsSchema } from "./applications.schema";


abstract class ApplicationsRepository {
  static async findAllApplicationsByUserId(userId: string, options: FindAllApplicationsSchema) {
    const applications = await db
      .select()
      .from(Application)
      .where(and(
        eq(Application.userId, userId),
        options.cursorId ? eq(Application.id, options.cursorId) : undefined,
        options.search ? like(Application.position, `%${options.search}%`) : undefined,
      ))
      .limit(options.limit || 20)
      .orderBy(asc(Application.id));
    return applications;
  }

  static async findById(id: number) {
    const [application] = await db
      .select()
      .from(Application)
      .where(eq(Application.id, id))
      .limit(1);
    return application;
  }

  static async insert(data: { companyId: number; userId: string; position: string; notes?: string }) {
    const [newApplication] = await db
      .insert(Application)
      .values({
        companyId: data.companyId,
        userId: data.userId,
        position: data.position,
        notes: data.notes,
      })
      .returning();
    return newApplication;
  }
  
  static async updateById(id: number, data: Partial<{ position: string; notes: string; location: string }>) {
    const [updatedApplication] = await db
      .update(Application)
      .set({
        position: data.position,
        notes: data.notes,
        location: data.location,
      })
      .where(eq(Application.id, id))
      .returning();
    return updatedApplication;
  }
  
  static async archiveById(id: number) {
    const [archivedApplication] = await db
      .update(Application)
      .set({
        archivedAt: new Date(),
      })
      .where(eq(Application.id, id))
      .returning();
    return archivedApplication;
  }
}

export default ApplicationsRepository;