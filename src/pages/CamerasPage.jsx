import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  List,

  IconButton,
  Box,
  CircularProgress,
  Stack,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import HlsPreview from "@/components/HlsPreview.jsx";
import {
  getCameras,
  createCamera,
  deleteCamera,
} from '../api/camera_hardware';


export default function CamerasPage() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCameras();
      setCameras(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    const name = newName.trim();
    const url = newUrl.trim();
    if (!name || !url) return;
    setSubmitting(true);
    try {
      await createCamera({ name, stream_url: url });
      setNewName('');
      setNewUrl('');
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async id => {
    try {
      await deleteCamera(id);
      setCameras(cameras.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Управление камерами
        </Typography>

        <Paper sx={{ p: 2, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                  label="Имя камеры"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  fullWidth
                  size="small"
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                  label="URL HLS-потока"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="https://.../stream.m3u8"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={20}/> : <AddIcon />}
                  onClick={handleAdd}
                  disabled={submitting || !newName.trim() || !newUrl.trim()}
                  fullWidth
              >
                Добавить
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {loading ? (
            <Box textAlign="center"><CircularProgress /></Box>
        ) : (
            <List>
              {cameras.length === 0 && (
                  <Typography color="text.secondary">Список пуст</Typography>
              )}
              {cameras.map(cam => (
                  <Paper key={cam.id} sx={{ mb: 2, p: 2 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h4">{cam.name}</Typography>
                        <Typography variant="body2">#{cam.id}</Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                          {cam.stream_url}
                        </Typography>
                      </Box>
                      <Box sx={{ width: 200, height: 120 }}>
                        <HlsPreview url={cam.stream_url} />
                      </Box>
                      <Box>
                        <IconButton
                            edge="end"
                            onClick={() => handleDelete(cam.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Stack>
                  </Paper>
              ))}
            </List>
        )}
      </Container>
  );
}
