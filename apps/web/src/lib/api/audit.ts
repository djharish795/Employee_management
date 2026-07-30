import { apiClient } from "./client";

export const fetchAuditEvents = async (
  limit: number = 50,
  offset: number = 0,
  filters?: { module?: string; status?: string; actorId?: string; search?: string }
) => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if (filters?.module) params.append("module", filters.module);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.actorId) params.append("actorId", filters.actorId);
  if (filters?.search) params.append("search", filters.search);

  const { data } = await apiClient.get(`/audit/events?${params.toString()}`);
  return data;
};

export const fetchAuditMetrics = async () => {
  const { data } = await apiClient.get("/audit/metrics");
  return data;
};

export const searchAuditUsers = async (query: string) => {
  if (!query) return [];
  const { data } = await apiClient.get(`/employees/search-directory?q=${encodeURIComponent(query)}`);
  return data;
};
