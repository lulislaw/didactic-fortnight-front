
import api from './axiosConfig';


export const fetchAppeals = async (skip = 0, limit = 100) => {
  const response = await api.get(`/appeals?skip=${skip}&limit=${limit}`);
  return response.data;
};


export const fetchAppealById = async (id) => {
  const response = await api.get(`/appeals/${id}`);
  return response.data;
};

export const createAppeal = async (payload) => {
  const response = await api.post('/appeals/', payload);
  return response.data;
};


export const updateAppeal = async (id, payload) => {
  const response = await api.patch(`/appeals/${id}`, payload);
  return response.data;
};

export const deleteAppeal = async (id) => {
  const response = await api.delete(`/appeals/${id}`);
  return response.data;
};


export const fetchAppealHistory = async (id) => {
  const response = await api.get(`/appeals/${id}/history`);
  return response.data;
};

