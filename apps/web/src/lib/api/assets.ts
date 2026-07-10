import { apiClient } from "./client";

const BASE = "/assets";

export const assetsApi = {
  // ─── Inventory ──────────────────────────────────────────────────────────

  list: async (params?: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await apiClient.get(BASE, { params });
    return data.data ?? data;
  },

  getMy: async () => {
    const { data } = await apiClient.get(`${BASE}/my`);
    return data.data ?? data;
  },

  activity: async () => {
    const { data } = await apiClient.get(`${BASE}/activity`);
    return data.data ?? data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return data.data ?? data;
  },

  create: async (payload: {
    assetTag: string;
    name: string;
    category: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    purchaseCost?: number;
    purchaseDate?: string;
    notes?: string;
    status?: string;
  }) => {
    const { data } = await apiClient.post(BASE, payload);
    return data.data ?? data;
  },

  update: async (
    id: string,
    payload: {
      name?: string;
      category?: string;
      brand?: string;
      model?: string;
      serialNumber?: string;
      purchaseCost?: number;
      purchaseDate?: string;
      notes?: string;
      status?: string;
    }
  ) => {
    const { data } = await apiClient.patch(`${BASE}/${id}`, payload);
    return data.data ?? data;
  },

  delete: async (id: string) => {
    const { data } = await apiClient.delete(`${BASE}/${id}`);
    return data.data ?? data;
  },

  assign: async (
    assetId: string,
    payload: { employeeId: string; assignedById: string; notes?: string }
  ) => {
    const { data } = await apiClient.post(`${BASE}/${assetId}/assign`, payload);
    return data.data ?? data;
  },

  returnAsset: async (assetId: string, returnedCondition?: string) => {
    const { data } = await apiClient.post(`${BASE}/${assetId}/return`, {
      returnedCondition,
    });
    return data.data ?? data;
  },

  // ─── Asset Requests ─────────────────────────────────────────────────────

  listRequests: async (statusFilter?: string) => {
    const { data } = await apiClient.get(`${BASE}/requests`, {
      params: statusFilter ? { status: statusFilter } : undefined,
    });
    return data.data ?? data;
  },

  createRequest: async (payload: {
    category: string;
    description: string;
    justification: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  }) => {
    const { data } = await apiClient.post(`${BASE}/requests`, payload);
    return data.data ?? data;
  },

  respondToRequest: async (
    id: string,
    payload: { status: "APPROVED" | "REJECTED"; notes?: string }
  ) => {
    const { data } = await apiClient.patch(`${BASE}/requests/${id}/respond`, payload);
    return data.data ?? data;
  },

  // ─── KPIs ────────────────────────────────────────────────────────────────

  kpiSummary: async () => {
    const { data } = await apiClient.get(`${BASE}/kpis/summary`);
    return data.data ?? data;
  },

  kpiCategories: async () => {
    const { data } = await apiClient.get(`${BASE}/kpis/categories`);
    return data.data ?? data;
  },

  kpiFinancials: async () => {
    const { data } = await apiClient.get(`${BASE}/kpis/financials`);
    return data.data ?? data;
  },
};
