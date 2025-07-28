import api from './axiosConfig';

export const getPermissions = () => api.get('/auth/permissions').then(r => r.data);
export const createPermission = (perm) => api.post('/auth/permissions', perm).then(r => r.data);
export const deletePermission = (id) => api.delete(`/auth/permissions/${id}`);
