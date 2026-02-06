import apiClient from "./axios";
import type { APIResponse } from "./types";

export type Application = {
  status: "LISTED" | "APPLIED" | "INTERVIEW" | "OFFER" | "SIGNED" | "REJECTED" | "DECLINED";
  id: number;
  companyId: number | null;
  jobDescription: string | null;
  jobUrl: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  position: string;
  notes: string | null;
  salaryCurrency: string | null;
  minSalary: number;
  maxSalary: number;
  location: string | null;
  remote: "ONSITE" | "REMOTE" | "HYBRID";
  company: {
    id: number;
    name: string | null;
    slug: string | null;
    logoUrl: string | null;
  } | null;
}

export type GetMyApplicationsParams = {
  search?: string;
  location?: string;
  remote?: "ONSITE" | "REMOTE" | "HYBRID";
  companyIds?: number[];
}

export const getMyApplications = async (qParams?: GetMyApplicationsParams) => {
  const response = await apiClient.get<APIResponse<Application[]>>('/applications', {
    withCredentials: true,
    params: qParams,
    paramsSerializer: {
      indexes: null,
    }
  });
  const resBody = response.data;

  return resBody;
}

export const updateApplication = async (applicationId: number, data: Partial<Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'company'>>) => {
  const response = await apiClient.put<APIResponse<Application>>(`/applications/${applicationId}`, data, {
    withCredentials: true,
  });
  const resBody = response.data;

  return resBody;
}

export type CreateApplicationInput = Partial<Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'company'>> & {
  position: string;
  remote: "ONSITE" | "REMOTE" | "HYBRID";
  status: "LISTED" | "APPLIED" | "INTERVIEW" | "OFFER" | "SIGNED" | "REJECTED" | "DECLINED";
}

export const createApplication = async (data: CreateApplicationInput) => {
  const response = await apiClient.post<APIResponse<Application>>('/applications', data, {
    withCredentials: true,
  });
  const resBody = response.data;

  return resBody;
}

export const getApplicationById = async (applicationId: number) => {
  const response = await apiClient.get<APIResponse<Application>>(`/applications/${applicationId}`, {
    withCredentials: true,
  });
  const resBody = response.data;

  return resBody;
}
