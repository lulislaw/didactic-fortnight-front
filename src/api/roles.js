import api from './axiosConfig';

export const getRoles = () => api.get('/auth/roles').then(r => r.data);
export const createRole = (role) => api.post('/auth/roles', role).then(r => r.data);
export const updateRole = (id, role) => api.put(`/auth/roles/${id}`, role).then(r => r.data);
export const deleteRole = (id) => api.delete(`/auth/roles/${id}`);