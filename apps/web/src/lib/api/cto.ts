import { apiClient } from './client';

export const fetchCtoDashboard = async (): Promise<any> => {
  const { data } = await apiClient.get('/dashboard/cto-overview');
  return data.data ? data.data : data; // Handle both cases based on NestJS wrapping
};

export const fetchCtoAssets = async (): Promise<any> => {
  const { data } = await apiClient.get('/assets/cto');
  return data.data ? data.data : data;
};

export const fetchCtoTeam = async (): Promise<any> => {
  const { data } = await apiClient.get('/employees/cto-team');
  return data.data ? data.data : data;
};

