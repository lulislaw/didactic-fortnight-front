import api from './axiosConfig';

// Получить всех пользователей
export const getUsers = () =>
    api.get('/auth/users').then(r => r.data);

// Получить одного пользователя по ID (если нужно)
export const getUser = (userId) =>
    api.get(`/auth/users/${userId}`).then(r => r.data);

// Создать пользователя
// data: { username, full_name, email, phone, tg_id, password, role_ids: [id,…] }
export const createUser = (data) =>
    api.post('/auth/users', data).then(r => r.data);

// Обновить пользователя целиком
// data: { full_name, email, phone, tg_id?, password?, role_ids: [ … ] }
export const updateUser = (userId, data) =>
    api.put(`/auth/users/${userId}`, data).then(r => r.data);

// Удалить пользователя
export const deleteUser = (userId) =>
    api.delete(`/auth/users/${userId}`).then(r => r.data);

// Удобная обёртка только для смены роли
export const updateUserRole = (userId, roleId) =>
    updateUser(userId, { role_ids: roleId ? [roleId] : [] });
