import { apiClient } from './client';

export const fetchMyProfile = async (): Promise<any> => {
  const { data } = await apiClient.get('/profile/me');
  return data;
};

export const updateMyProfile = async (payload: any): Promise<any> => {
  const { data } = await apiClient.put('/profile/me', payload);
  return data;
};

export const changePassword = async (payload: any): Promise<any> => {
  const { data } = await apiClient.post('/profile/change-password', payload);
  return data;
};
