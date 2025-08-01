import React, { useState } from 'react';
import { Box, TextField, Button, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await signup(form);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  return (
      <Box component="form" onSubmit={handleSubmit} sx={{ width: 300, mx: 'auto' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
            fullWidth label="Username"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            sx={{ mb: 2 }}
        />
        <TextField
            fullWidth label="Email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            sx={{ mb: 2 }}
        />
        <TextField
            fullWidth label="Password" type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            sx={{ mb: 2 }}
        />
        <Button fullWidth variant="contained" type="submit">
          Зарегистрироваться
        </Button>
      </Box>
  );
}
