import api from './axiosConfig';

export async function getConfigs(params = {}) {
  const { data } = await api.get('/building-configs/', { params });
  return data;
}

export async function getConfig(id) {
  const { data } = await api.get(`/building-configs/${id}`);
  return data;
}

export async function createConfig(payload) {
  const { data } = await api.post('/building-configs/', payload);
  return data;
}

export async function updateConfig(id, payload) {
  const { data } = await api.put(`/building-configs/${id}`, payload);
  return data;
}

export async function deleteConfig(id) {
  const { data } = await api.delete(`/building-configs/${id}`);
  return data;
}
