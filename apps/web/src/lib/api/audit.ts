import { apiClient } from "./client";

export const fetchAuditEvents = async (limit: number = 50, offset: number = 0) => {
  const { data } = await apiClient.get(`/audit/events?limit=${limit}&offset=${offset}`);
  return data;
};

export const fetchAuditMetrics = async () => {
  const { data } = await apiClient.get("/audit/metrics");
  return data;
};
