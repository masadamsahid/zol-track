import type { APIResponse } from "./types";
import apiClient from "./axios";

export interface Company {
	id: number;
	name: string;
	slug: string;
	address: string | null;
	logoUrl: string | null;
	websiteUrl: string | null;
	desc: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface SearchCompaniesParams {
	search?: string;
	limit?: number;
	cursorId?: number;
}

export interface CreateCompanyInput {
	name: string;
	slug: string;
	desc?: string;
	websiteUrl?: string;
	logoUrl?: string;
	address?: string;
}

export const createCompany = async (data: CreateCompanyInput) => {
	const response = await apiClient.post<APIResponse<Company>>('/companies', data, {
		withCredentials: true,
	});
	return response.data;
};

export const searchCompanies = async (params: SearchCompaniesParams = {}) => {
	const response = await apiClient.get<APIResponse<Company[]>>('/companies', {
		params,
		withCredentials: true,
	});
	return response.data;
};

export const getCompanyBySlug = async (slug: string) => {
	const response = await apiClient.get<APIResponse<Company>>(`/companies/slug/${slug}`, {
		withCredentials: true,
	});
	return response.data;
};
