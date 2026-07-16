import { apiClient } from "./client";

export const fetchDepartments = async () => {
  const { data } = await apiClient.get("/departments");
  return data.data; // Paginated result returns data inside 'data' property
};

export const updateDepartment = async (id: string, updateData: any) => {
  const { data } = await apiClient.patch(`/departments/${id}`, updateData);
  return data;
};
