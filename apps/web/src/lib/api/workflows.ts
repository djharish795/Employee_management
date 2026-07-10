import { apiClient } from "./client";

export interface WorkflowInstance {
  id: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  workflowId: string;
  workflow: {
    id: string;
    type: "ONBOARDING" | "OFFBOARDING" | "PROBATION_REVIEW";
  };
  initiatedBy: {
    id: string;
    firstName: string;
    lastName: string;
    officialEmail: string;
    avatarUrl?: string;
  };
  updatedAt: string;
}

export const workflowsApi = {
  getKanbanWorkflows: async (): Promise<WorkflowInstance[]> => {
    const response = await apiClient.get("/hr/workflows/kanban");
    return response.data;
  },

  updateStatus: async (id: string, status: string): Promise<any> => {
    const response = await apiClient.patch(`/hr/workflows/${id}/status`, { status });
    return response.data;
  }
};
