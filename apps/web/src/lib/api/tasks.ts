import { apiClient } from "./client";

const API_BASE_URL = "/tasks";

export interface Task {
  id: string;
  issueKey?: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "QA" | "DONE" | "BLOCKED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  type: "STORY" | "TASK" | "BUG" | "EPIC";
  createdAt: string;
  assigneeId?: string;
  creatorId: string;
  reporterId?: string;
  projectId?: string;
  sprintId?: string;
  assignee?: { id: string; firstName: string; lastName: string };
  creator?: { id: string; firstName: string; lastName: string };
  reporter?: { id: string; firstName: string; lastName: string };
  project?: { id: string; name: string };
  sprint?: Sprint;
  comments?: TaskComment[];
  actions?: TaskAction[];
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author?: { id: string; firstName: string; lastName: string; photoUrl: string | null };
}

export interface TaskAction {
  id: string;
  taskId: string;
  actorId: string;
  type: string;
  notes?: string;
  createdAt: string;
  actor?: { id: string; firstName: string; lastName: string };
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "PLANNED" | "ACTIVE" | "COMPLETED";
  projectId: string;
  _count?: { tasks: number };
}

export const tasksApi = {
  getMyTasks: async (): Promise<Task[]> => {
    const response = await apiClient.get(API_BASE_URL);
    return response.data;
  },

  getProjectTasks: async (projectId: string): Promise<Task[]> => {
    const response = await apiClient.get(`${API_BASE_URL}/project/${projectId}`);
    return response.data;
  },

  createTask: async (data: Partial<Task>): Promise<Task> => {
    const response = await apiClient.post(API_BASE_URL, data);
    return response.data;
  },

  updateTask: async (id: string, data: Partial<Task>): Promise<Task> => {
    const response = await apiClient.patch(`${API_BASE_URL}/${id}`, data);
    return response.data;
  },

  updateTaskStatus: async (taskId: string, status: Task["status"]): Promise<Task> => {
    const response = await apiClient.patch(`${API_BASE_URL}/${taskId}`, { status });
    return response.data;
  },

  addComment: async (taskId: string, content: string, category?: string): Promise<TaskComment> => {
    const response = await apiClient.post(`${API_BASE_URL}/${taskId}/comments`, { content, category });
    return response.data;
  },

  addAction: async (taskId: string, type: string, notes?: string): Promise<TaskAction> => {
    const response = await apiClient.post(`${API_BASE_URL}/${taskId}/actions`, { type, notes });
    return response.data;
  },
  
  getProjectSprints: async (projectId: string): Promise<Sprint[]> => {
    const response = await apiClient.get(`/projects/${projectId}/sprints`);
    return response.data;
  },

  createSprint: async (projectId: string, data: Partial<Sprint>): Promise<Sprint> => {
    const response = await apiClient.post(`/projects/${projectId}/sprints`, data);
    return response.data;
  },
  
  updateStatus: async (id: string, status: "TODO" | "IN_PROGRESS" | "DONE"): Promise<Task> => {
    const response = await apiClient.patch(`${API_BASE_URL}/${id}/status`, { status });
    return response.data;
  },

  deleteTask: async (id: string): Promise<any> => {
    const response = await apiClient.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  }
};
