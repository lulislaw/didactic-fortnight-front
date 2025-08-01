// src/components/FullPageSpinner.jsx
import React from 'react';
import { Box, CircularProgress } from '@mui/material';

export default function FullPageSpinner() {
  return (
      <Box
          sx={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
      >
        <CircularProgress />
      </Box>
  );
}
