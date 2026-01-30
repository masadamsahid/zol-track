import { ConflictException, InternalServerErrorException, NotFoundException } from "elysia-http-exception";
import type { CreateCompanySchema, FindAllCompaniesSchema } from "./companies.schema";
import CompaniesRepository from "./companies.repository";

abstract class CompaniesService {
  static async findAllCompanies(options: FindAllCompaniesSchema) {
    const companies = await CompaniesRepository.findAll(options);
    if (companies.length < 1) {
      throw new NotFoundException("No companies found");
    }
    return companies;
  }
  
  static async findCompanyById(id: number) {
    const company = await CompaniesRepository.findById(id);
    if (!company) {
      throw new NotFoundException("Company not found");
    }
    return company;
  }

  static async findCompanyBySlug(slug: string) {
    const company = await CompaniesRepository.findOneBySlug(slug);
    if (!company) {
      throw new NotFoundException("Company not found");
    }
    return company;
  }
  
  static async createCompany(data: CreateCompanySchema) {
    const existingCompany = await CompaniesRepository.findOneBySlug(data.slug);
    if (existingCompany) {
      throw new ConflictException("Company with this slug already exists");
    }

    const newCompany = await CompaniesRepository.insert(data);
    if (!newCompany) {
      throw new InternalServerErrorException("Failed to create company");
    }
    
    return newCompany;
  }
  
  static async updateCompany(id: number, data: Partial<CreateCompanySchema>) {
    const company = await this.findCompanyById(id);

    const updatedCompany = await CompaniesRepository.update(company.id, data);
    if (!updatedCompany) {
      throw new InternalServerErrorException("Failed to update company");
    }

    return updatedCompany;
  }
  
  static async removeCompany(id: number) {
    const company = await this.findCompanyById(id);

    const deletedCompany = await CompaniesRepository.removeById(company.id);
    if (!deletedCompany) {
      throw new InternalServerErrorException("Failed to remove company");
    }

    return deletedCompany;
  }
  
  static async restoreCompany(id: number) {
    const company = await this.findCompanyById(id);

    const restoredCompany = await CompaniesRepository.restoreById(company.id);
    if (!restoredCompany) {
      throw new InternalServerErrorException("Failed to restore company");
    }

    return restoredCompany;
  }
  
  static async destroyCompany(id: number) {
    const company = await this.findCompanyById(id);

    const destroyedCompany = await CompaniesRepository.destroyById(company.id);
    if (!destroyedCompany) {
      throw new InternalServerErrorException("Failed to destroy company");
    }

    return destroyedCompany;
  }
}

export default CompaniesService;