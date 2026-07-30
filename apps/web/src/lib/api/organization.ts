import { apiClient } from "./client";

export const fetchDepartments = async () => {
  const { data } = await apiClient.get("/departments");
  // Handle different API wrapper structures
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (data.data && Array.isArray(data.data.data)) return data.data.data;
  return [];
};

export const updateDepartment = async (id: string, updateData: any) => {
  const { data } = await apiClient.patch(`/departments/${id}`, updateData);
  return data;
};
