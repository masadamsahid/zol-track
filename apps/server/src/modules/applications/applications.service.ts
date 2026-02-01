import { NotFoundException } from "elysia-http-exception";
import ApplicationsRepository from "./applications.repository";
import type { FindAllMyApplicationsSchema, InsertApplicationSchema } from "./applications.schema";

abstract class ApplicationsService {
  static async findAllApplicationsByUserId(userId: string, options: FindAllMyApplicationsSchema) {
    const applications = await ApplicationsRepository.findAllApplicationsByUserId(userId, options);
    if (applications.length < 1) {
      throw new NotFoundException("No applications found");
    }
    return applications;
  }

  static async findApplicationById(id: number) {
    const application = await ApplicationsRepository.findById(id);
    if (!application) {
      throw new NotFoundException("Application not found");
    }
    return application;
  }

  static async createApplication(data: InsertApplicationSchema & { userId: string }) {
    const newApplication = await ApplicationsRepository.insert(data);
    return newApplication;
  }

  static async updateApplicationById(id: number, data: Partial<InsertApplicationSchema>) {
    const application = await this.findApplicationById(id);

    const updatedApplication = await ApplicationsRepository.updateById(application.id, data);
    return updatedApplication;
  }
}

export default ApplicationsService;