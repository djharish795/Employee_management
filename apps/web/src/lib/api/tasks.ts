import axios from "axios";

const API_BASE_URL = "/api/v1/tasks";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  assigneeId?: string;
  creatorId: string;
  assignee?: { id: string; firstName: string; lastName: string };
  creator?: { id: string; firstName: string; lastName: string };
}

export const tasksApi = {
  getMyTasks: async (): Promise<Task[]> => {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  },

  createTask: async (data: Partial<Task>): Promise<Task> => {
    const response = await axios.post(API_BASE_URL, data);
    return response.data;
  },

  updateStatus: async (id: string, status: "TODO" | "IN_PROGRESS" | "DONE"): Promise<Task> => {
    const response = await axios.patch(`${API_BASE_URL}/${id}/status`, { status });
    return response.data;
  }
};
