import { apiClient as api } from "./client";

export type KnowledgeCategory =
  | "POLICY"
  | "SOP"
  | "ARCHITECTURE"
  | "TECHNICAL_DOC"
  | "HR_GUIDELINES"
  | "TRAINING_MATERIAL"
  | "COMPLIANCE";

export interface KnowledgeDoc {
  id: string;
  title: string;
  content: string;
  category: KnowledgeCategory;
  isPublished: boolean;
  slug: string;
  version: string;
  publishedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    officialEmail: string;
  };
}

export interface CreateKnowledgeDocDto {
  title: string;
  content: string;
  category: KnowledgeCategory;
  isPublished?: boolean;
  version?: string;
  slug?: string;
}

export interface UpdateKnowledgeDocDto {
  title?: string;
  content?: string;
  category?: KnowledgeCategory;
  isPublished?: boolean;
  version?: string;
  slug?: string;
}

export const knowledgeApi = {
  /** List / search knowledge docs */
  list: (params?: { q?: string; category?: KnowledgeCategory; isPublished?: boolean }) =>
    api.get<KnowledgeDoc[]>("/knowledge", { params }),

  /** Get single doc by ID */
  getById: (id: string) =>
    api.get<KnowledgeDoc>(`/knowledge/id/${id}`),

  /** Get single doc by slug */
  getBySlug: (slug: string) =>
    api.get<KnowledgeDoc>(`/knowledge/slug/${slug}`),

  /** Create a new knowledge doc (HR/Admin only) */
  create: (data: CreateKnowledgeDocDto) =>
    api.post<KnowledgeDoc>("/knowledge", data),

  /** Update a knowledge doc (HR/Admin only) */
  update: (id: string, data: UpdateKnowledgeDocDto) =>
    api.patch<KnowledgeDoc>(`/knowledge/${id}`, data),

  /** Delete a knowledge doc (HR/Admin only) */
  remove: (id: string) =>
    api.delete(`/knowledge/${id}`),

  /** Toggle publish state (HR/Admin only) */
  setPublished: (id: string, isPublished: boolean) =>
    api.patch(`/knowledge/${id}/publish`, { isPublished }),
};

/** Human-readable label for each category */
export const CATEGORY_LABELS: Record<KnowledgeCategory, string> = {
  POLICY: "Policy",
  SOP: "SOP",
  ARCHITECTURE: "Architecture",
  TECHNICAL_DOC: "Technical Doc",
  HR_GUIDELINES: "HR Guidelines",
  TRAINING_MATERIAL: "Training Material",
  COMPLIANCE: "Compliance",
};

/** Tailwind colour classes for category badges */
export const CATEGORY_COLORS: Record<KnowledgeCategory, { bg: string; text: string; border: string }> = {
  POLICY: { bg: "bg-slate-100", text: "text-slate-900", border: "border-slate-200" },
  SOP: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  ARCHITECTURE: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  TECHNICAL_DOC: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  HR_GUIDELINES: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  TRAINING_MATERIAL: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  COMPLIANCE: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};
