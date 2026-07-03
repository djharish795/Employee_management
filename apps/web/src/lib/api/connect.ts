import { apiClient as api } from "./client";

export interface CreateMeetDto {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: "ONE_ON_ONE" | "DEPARTMENT";
  assigneeId?: string;
  departmentId?: string;
}

export interface RescheduleMeetDto {
  startTime: string;
  endTime: string;
}

export const connectApi = {
  createMeet: (data: CreateMeetDto) => 
    api.post("/connect/request", data),

  acceptMeet: (id: string) => 
    api.post(`/connect/${id}/accept`),

  rejectMeet: (id: string) => 
    api.post(`/connect/${id}/reject`),

  rescheduleMeet: (id: string, data: RescheduleMeetDto) => 
    api.post(`/connect/${id}/reschedule`, data),

  updateWorkspace: (id: string, data: { agenda?: any; actionItems?: any }) =>
    api.patch(`/connect/${id}/workspace`, data),

  getMyMeetings: () => 
    api.get("/connect/my-meetings"),

  getAvailability: (employeeId: string, date: string) =>
    api.get(`/connect/availability/${employeeId}?date=${date}`),

  getSettings: () => 
    api.get("/connect/settings"),

  updateSettings: (data: any) => 
    api.post("/connect/settings", data),
};
