import { Company } from "@zol-track/db/schema/schema";
import type { CreateCompanySchema, FindAllCompaniesSchema } from "./companies.schema";
import { and, asc, db, eq, like } from "@zol-track/db";

abstract class CompaniesRepository {
  static async findAll(options: FindAllCompaniesSchema) {
    const companies = await db.select()
      .from(Company)
      .where(and(
        options.cursorId ? eq(Company.id, options.cursorId) : undefined,
        options.search ? like(Company.name, `%${options.search}%`) : undefined,
      ))
      .limit(options.limit || 20)
      .orderBy(asc(Company.id))
      ;
    return companies;
  }

  static async findById(id: number) {
    const [company] = await db
      .select()
      .from(Company)
      .where(eq(Company.id, id))
      .limit(1);

    return company;
  }

  static async findOneBySlug(slug: string) {
    const [company] = await db
      .select()
      .from(Company)
      .where(eq(Company.slug, slug))
      .limit(1);
    return company;
  }

  static async insert(data: CreateCompanySchema) {
    const [newCompany] = await db
      .insert(Company)
      .values({
        name: data.name,
        slug: data.slug,
        address: data.address,
        logoUrl: data.logoUrl,
        websiteUrl: data.websiteUrl,
        desc: data.desc,
      })
      .returning();
    return newCompany;
  }

  static async update(id: number, data: Partial<CreateCompanySchema>) {
    const [updatedCompany] = await db
      .update(Company)
      .set({
        name: data.name,
        slug: data.slug,
        address: data.address,
        logoUrl: data.logoUrl,
        websiteUrl: data.websiteUrl,
        desc: data.desc,
      })
      .where(eq(Company.id, id))
      .returning();
    return updatedCompany;
  }

  static async removeById(id: number) {
    const [deleted] = await db
      .update(Company)
      .set({ deletedAt: new Date() })
      .where(eq(Company.id, id))
      .returning();
    return deleted;
  }
  
  static async restoreById(id: number) {
    const [restoredCompany] = await db
      .update(Company)
      .set({ deletedAt: null })
      .where(eq(Company.id, id))
      .returning();
    return restoredCompany;
  }
  
  static async destroyById(id: number) {
    const [destroyed] = await db
      .delete(Company)
      .where(eq(Company.id, id))
      .returning();
    return destroyed;
  }
}

export default CompaniesRepository;