import { apiClient } from "./client";

export interface ApiCompanyHoliday {
  id: string;
  name: string;
  date: string;
  description?: string | null;
}

export const fetchCompanyHolidays = async (): Promise<ApiCompanyHoliday[]> => {
  const { data } = await apiClient.get("/holidays");
  return data;
};
