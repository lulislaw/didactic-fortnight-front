// src/pages/Unauthorized.jsx
import React from 'react';
import { Container, Typography } from '@mui/material';

export default function Unauthorized() {
  return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Доступ запрещён
        </Typography>
        <Typography>
          У вас нет прав для просмотра этой страницы.
        </Typography>
      </Container>
  );
}
