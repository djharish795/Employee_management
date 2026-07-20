import { apiClient } from './client';

export const crmApi = {
  // Client Management
  getClients: async () => {
    return apiClient.get('/crm/clients');
  },
  
  getIncomingClients: async () => {
    return apiClient.get('/crm/clients/incoming');
  },
  
  createClient: async (data: any) => {
    return apiClient.post('/crm/clients', data);
  },
  
  acceptClient: async (id: string) => {
    return apiClient.post(`/crm/clients/${id}/accept`, {});
  },
  
  clarifyClient: async (id: string) => {
    return apiClient.post(`/crm/clients/${id}/clarify`, {});
  },
  
  rejectClient: async (id: string) => {
    return apiClient.post(`/crm/clients/${id}/reject`, {});
  },
  
  transferToCrm: async (id: string) => {
    return apiClient.post(`/crm/clients/${id}/transfer-to-crm`, {});
  },
  
  updateClientStage: async (id: string, stage: number) => {
    return apiClient.put(`/crm/clients/${id}/stage`, { stage });
  },
  
  updateClientHealth: async (id: string, health: string) => {
    return apiClient.put(`/crm/clients/${id}/health`, { health });
  },
  
  addClientNote: async (id: string, note: string) => {
    return apiClient.post(`/crm/clients/${id}/notes`, { note });
  },
  
  addClientCall: async (id: string, call: string) => {
    return apiClient.post(`/crm/clients/${id}/calls`, { call });
  },
  
  addClientRequirement: async (id: string, item: any) => {
    return apiClient.post(`/crm/clients/${id}/requirements`, item);
  },

  updateClientRequirementStatus: async (clientId: string, reqId: string, status: string) => {
    return apiClient.put(`/crm/clients/${clientId}/requirements/${reqId}/status`, { status });
  },

  addClientChangeRequest: async (clientId: string, item: any) => {
    return apiClient.post(`/crm/clients/${clientId}/change-requests`, item);
  },

  updateClientChangeRequestStatus: async (clientId: string, crId: string, status: string) => {
    return apiClient.put(`/crm/clients/${clientId}/change-requests/${crId}/status`, { status });
  },

  closeDeal: async (id: string) => {
    return apiClient.post(`/crm/clients/${id}/close-deal`, {});
  },

  addClientAttachment: async (clientId: string, attachment: string) => {
    return apiClient.post(`/crm/clients/${clientId}/attachments`, { attachment });
  },

  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/documents/upload', formData);
  },

  getDownloadUrl: async (objectKey: string) => {
    return apiClient.get(`/documents/view-url?objectKey=${encodeURIComponent(objectKey)}`);
  },

  // Requirements
  getRequirements: async () => {
    return apiClient.get('/crm/requirements');
  },
  
  createRequirement: async (data: any) => {
    return apiClient.post('/crm/requirements', data);
  },
  
  updateRequirement: async (id: string, data: any) => {
    return apiClient.put(`/crm/requirements/${id}`, data);
  },
  
  updateRequirementStatus: async (id: string, status: string) => {
    return apiClient.put(`/crm/requirements/${id}/status`, { status });
  },
  
  deleteRequirement: async (id: string) => {
    return apiClient.delete(`/crm/requirements/${id}`);
  },

  // Dashboard & Reports
  getRecentActivity: async () => {
    return apiClient.get('/crm/activity');
  },
  
  getPipelineSummary: async () => {
    return apiClient.get('/crm/reports/pipeline-summary');
  },
  
  getLeadActivityReport: async () => {
    return apiClient.get('/crm/reports/lead-activity');
  },

  // CRM Meetings
  getMeetings: async () => {
    return apiClient.get('/crm/meetings');
  },

  getClientMeetings: async (clientId: string) => {
    return apiClient.get(`/crm/clients/${clientId}/meetings`);
  },

  createMeeting: async (data: any) => {
    return apiClient.post('/crm/meetings', data);
  }
};

