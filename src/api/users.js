import api from './axiosConfig';

export const getUsers = () => api.get('/auth/users').then(r => r.data);
export const updateUserRole = (userId, roleId) =>
    api.put(`/auth/users/${userId}/role`, { role_id: roleId }).then(r => r.data);