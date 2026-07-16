import { apiClient } from "./client";

const API_BASE_URL = "/knowledge";

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
  },

  create: async (payload: {
    title: string;
    content: string;
    category: string;
    isPublished?: boolean;
    slug?: string;
    version?: string;
    requiresSignature?: boolean;
  }): Promise<KnowledgeDoc> => {
    const response = await apiClient.post(API_BASE_URL, payload);
    return response.data;
  },

  update: async (
    id: string,
    payload: {
      title?: string;
      content?: string;
      category?: string;
      isPublished?: boolean;
      slug?: string;
      version?: string;
      requiresSignature?: boolean;
    }
  ): Promise<KnowledgeDoc> => {
    const response = await apiClient.patch(`${API_BASE_URL}/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  publish: async (id: string, isPublished: boolean): Promise<KnowledgeDoc> => {
    const response = await apiClient.patch(`${API_BASE_URL}/${id}/publish`, { isPublished });
    return response.data;
  }
};

