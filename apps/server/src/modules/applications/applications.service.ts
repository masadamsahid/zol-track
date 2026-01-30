import { NotFoundException } from "elysia-http-exception";
import ApplicationsRepository from "./applications.repository";
import type { FindAllApplicationsSchema } from "./applications.schema";

abstract class ApplicationsService {
  static async findAllApplicationsByUserId(userId: string, options: FindAllApplicationsSchema) {
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

  static async createApplication(data: { companyId: number; userId: string; position: string; notes?: string }) {
    const newApplication = await ApplicationsRepository.insert(data);
    return newApplication;
  }

  static async updateApplicationById(id: number, data: Partial<{ position: string; notes: string; location: string }>) {
    const application = await this.findApplicationById(id);

    const updatedApplication = await ApplicationsRepository.updateById(application.id, data);
    return updatedApplication;
  }
  
  static async archiveApplicationById(id: number) {
    const application = await this.findApplicationById(id);
    
    const archivedApplication = await ApplicationsRepository.archiveById(application.id);
    return archivedApplication;
  }
}

export default ApplicationsService;