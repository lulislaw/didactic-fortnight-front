import React, { useState } from 'react';
import { Box, TextField, Button, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await login(form);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        // составляем «поле: сообщение»
        setError(detail.map(d => `${d.loc.slice(-1)[0]}: ${d.msg}`).join('; '));
      } else {
        setError(err.response?.data?.detail || err.message);
      }
    }
  };

  return (
      <Box component="form" onSubmit={handleSubmit} sx={{ width: 300, mx: 'auto' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
            fullWidth label="Username" value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            sx={{ mb: 2 }}
        />
        <TextField
            fullWidth label="Password" type="password" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            sx={{ mb: 2 }}
        />
        <Button fullWidth variant="contained" type="submit">
          Войти
        </Button>
      </Box>
  );
}
