import { apiClient } from "./client";

export interface ApiFieldWorkRequest {
  id: string;
  employeeId: string;
  approverId?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  destination: string;
  client?: string | null;
  purpose: string;
  description: string;
  transportation: string;
  returnTime: string;
  contact: string;
  remarks?: string | null;
  fileName?: string | null;
  objectKey?: string | null;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string | null;
  employeeName?: string;
  employeeIdStr?: string; // mapping alphanumeric employeeId
  department?: string;
  reportingManager?: string;
}

export const fetchMyFieldWork = async (): Promise<ApiFieldWorkRequest[]> => {
  const { data } = await apiClient.get("/field-work-requests/my");
  return data;
};

export const fetchFieldWorkApprovals = async (): Promise<ApiFieldWorkRequest[]> => {
  const { data } = await apiClient.get("/field-work-requests/team");
  return data;
};

export const fetchFieldWorkDetails = async (id: string): Promise<ApiFieldWorkRequest> => {
  const { data } = await apiClient.get(`/field-work-requests/${id}`);
  return data;
};

export const createFieldWork = async (payload: any): Promise<ApiFieldWorkRequest> => {
  const { data } = await apiClient.post("/field-work-requests", payload);
  return data;
};

export const updateFieldWork = async (id: string, payload: any): Promise<ApiFieldWorkRequest> => {
  const { data } = await apiClient.patch(`/field-work-requests/${id}`, payload);
  return data;
};

export const approveFieldWork = async (id: string): Promise<ApiFieldWorkRequest> => {
  const { data } = await apiClient.post(`/field-work-requests/${id}/approve`);
  return data;
};

export const rejectFieldWork = async (id: string, reason: string): Promise<ApiFieldWorkRequest> => {
  const { data } = await apiClient.post(`/field-work-requests/${id}/reject`, { reason });
  return data;
};

export const getS3UploadUrl = async (
  fileName: string,
  contentType: string
): Promise<{ uploadUrl: string; objectKey: string }> => {
  const { data } = await apiClient.post("/documents/upload-url", {
    fileName,
    contentType,
  });
  return data.data; // Structure matches DocumentsController return: { data: { uploadUrl, objectKey } }
};

export const uploadFileToS3 = async (uploadUrl: string, file: File): Promise<void> => {
  // Put directly to S3 without using authorization header, so we use a clean axios request
  const axiosInstance = require("axios").default;
  await axiosInstance.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type,
    },
  });
};
