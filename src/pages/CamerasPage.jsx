// src/pages/CamerasPage.jsx
import React from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import HlsPlayer from '@/components/HlsPlayer.jsx';

// Список ваших камер — здесь для примера тестовый Mux‑HLS
const cameraStreams = [
  {
    id: 1,
    name: 'BigBuckBunny (test)',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  },
  {
    id: 2,
    name: 'Sintel (test)',
    url: 'https://test-streams.mux.dev/test_001/stream.m3u8',
  },
  // Добавьте сюда реальные URL ваших камер/стримов
];

export default function CamerasPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Мониторинг камер
      </Typography>
      <Grid container spacing={4}>
        {cameraStreams.map(cam => (
          <Grid key={cam.id} item xs={12} sm={6} md={4}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {cam.name}
            </Typography>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                // сохраняем 16:9
                pt: '56.25%',
                bgcolor: 'black',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              >
                <HlsPlayer url={cam.url} controls />
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
