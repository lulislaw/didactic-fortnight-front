import api from './axiosConfig';

export async function login({ username, password }) {
  const params = new URLSearchParams({
    grant_type: 'password',
    username,
    password,
  }).toString();

  const { data } = await api.post('/auth/token', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return data; // { access_token, token_type }
}

export async function signup(userData) {
  const { data } = await api.post('/auth/users_reg', userData);
  return data; // новый пользователь
}

export async function fetchMe() {
  const { data } = await api.get('/auth/users_me');
  return data; // профиль
}
