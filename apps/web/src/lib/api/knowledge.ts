import { apiClient } from "./client";

const API_BASE_URL = "/api/v1/knowledge";

export interface KnowledgeDoc {
  id: string;
  title: string;
  content: string;
  category: string;
  isPublished: boolean;
  publishedAt: string;
  slug: string;
  version: string;
  requiresSignature: boolean;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  acknowledgements?: {
    id: string;
    employeeId: string;
    signatureName: string;
    acknowledgedAt: string;
  }[];
}

export const knowledgeApi = {
  list: async (params?: { q?: string; category?: string }): Promise<KnowledgeDoc[]> => {
    const response = await apiClient.get(API_BASE_URL, { params });
    return response.data;
  },

  getBySlug: async (slug: string): Promise<KnowledgeDoc> => {
    const response = await apiClient.get(`${API_BASE_URL}/slug/${slug}`);
    return response.data;
  },

  acknowledge: async (id: string, signatureName: string): Promise<any> => {
    const response = await apiClient.post(`${API_BASE_URL}/${id}/acknowledge`, { signatureName });
    return response.data;
  }
};
