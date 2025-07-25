// src/pages/BuildingListPage.jsx
import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  TextField,
} from '@mui/material';
import {Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon} from '@mui/icons-material';
import {getConfigs, deleteConfig} from '@/api/building_configs';

export default function BuildingListPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const data = await getConfigs();
      setConfigs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Точно удалить эту конфигурацию?')) return;
    setDeletingId(id);
    try {
      await deleteConfig(id);
      setConfigs((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };
  const sorted = [...configs].sort((a, b) => {
    const da = new Date(a.updated_at || 0);
    const db = new Date(b.updated_at || 0);
    return db - da;
  });
  const filtered = sorted.filter(cfg =>
      cfg.name_build.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
      <Container maxWidth="md" sx={{py: 4}}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Конфигурации зданий</Typography>
          <Button
              variant="contained"
              startIcon={<AddIcon/>}
              onClick={() => navigate('/constructor')}
          >
            Создать новое
          </Button>
        </Box>
        <Box mb={2}>
          <TextField
              label="Поиск по названию"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              fullWidth
              size="small"
          />
        </Box>
        {loading ? (
            <Box textAlign="center"><CircularProgress/></Box>
        ) : (
            <Paper>
              <List>
                {filtered.length === 0 && (
                    <ListItem>
                      <ListItemText
                          primary={searchTerm ? 'Ничего не найдено' : 'Список пуст'}
                      />
                    </ListItem>
                )}
                {filtered.map((cfg) => (
                    <ListItem key={cfg.id} divider>
                      <ListItemText
                          primary={cfg.name_build}
                          secondary={cfg.updated_at
                              ? new Date(cfg.updated_at).toLocaleString()
                              : null
                          }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={() => navigate(`/constructor/${cfg.id}`)}
                        >
                          <EditIcon/>
                        </IconButton>
                        <IconButton
                            edge="end"
                            aria-label="delete"
                            disabled={deletingId === cfg.id}
                            onClick={() => handleDelete(cfg.id)}
                        >
                          {deletingId === cfg.id
                              ? <CircularProgress size={24}/>
                              : <DeleteIcon/>
                          }
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                ))}
              </List>
            </Paper>
        )}
      </Container>
  );
}
