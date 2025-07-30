import api from './axiosConfig';

export const getUsers = () =>
    api.get('/auth/users').then(r => r.data);

export const getUser = (userId) =>
    api.get(`/auth/users/${userId}`).then(r => r.data);

export const createUser = (data) =>
    api.post('/auth/users', data).then(r => r.data);

export const updateUser = (userId, data) =>
    api.put(`/auth/users/${userId}`, data).then(r => r.data);

export const deleteUser = (userId) =>
    api.delete(`/auth/users/${userId}`).then(r => r.data);

export const updateUserRole = (userId, roleId) =>
    updateUser(userId, { role_ids: roleId ? [roleId] : [] });
