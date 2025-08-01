// src/contexts/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';
import api from '../api/axiosConfig';

const AuthContext = createContext({
  token: null,
  user: null,
  loading: true,         // <— добавили
  login: async () => {},
  logout: () => {},
  signup: async () => {},
});

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (token) {
      setLoading(true);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      authApi
          .fetchMe()
          .then(u => setUser(u))
          .catch(() => {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          })
          .finally(() => setLoading(false));
    } else {
      // нет токена — не грузим профиль
      delete api.defaults.headers.common.Authorization;
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = useCallback(async credentials => {
    const { access_token } = await authApi.login(credentials);
    localStorage.setItem('token', access_token);
    setToken(access_token);
    navigate('/');
    return access_token;
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  }, [navigate]);

  const signup = useCallback(
      async userData => {
        await authApi.signup(userData);
        return login({
          username: userData.username,
          password: userData.password,
        });
      },
      [login]
  );

  return (
      <AuthContext.Provider value={{ token, user, loading, login, logout, signup }}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
