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

export const searchCompanies = async (params: SearchCompaniesParams = {}) => {
	const response = await apiClient.get<APIResponse<Company[]>>('/companies', {
		params,
		withCredentials: true,
	});
	return response.data;
};
