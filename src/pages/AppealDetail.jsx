import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';

import {
  fetchAppealById,
  fetchAppealHistory,
  updateAppeal,
  deleteAppeal,
} from '../api/appeals';

import Loader from '../components/Loader';
import AppealHistory from '../components/AppealHistory';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const AppealDetail = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const [appeal, setAppeal] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [statusId, setStatusId] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [a, hist] = await Promise.all([
          fetchAppealById(id),
          fetchAppealHistory(id),
        ]);
        setAppeal(a);
        setHistory(hist);

        // Инициализация полей редактирования
        setStatusId(a.status_id);
        setAssignedToId(a.assigned_to_id || '');
        setLocation(a.location || '');
        setDescription(a.description || '');
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить данные обращения.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) return <Loader/>;
  if (!appeal) {
    return (
        <Container maxWidth="md" sx={{mt: 4, mb: 4}}>
          <Typography variant="h6" color="textSecondary">
            Обращение не найдено.
          </Typography>
        </Container>
    );
  }

  const handleEditToggle = () => {
    setEditing((prev) => !prev);
    setError(null);
  };

  const handleUpdate = async () => {
    const updates = {
      status_id: parseInt(statusId, 10),
      assigned_to_id: assignedToId || null,
      location: location || '',
      description: description || '',
    };

    try {
      const updated = await updateAppeal(id, updates);
      setAppeal(updated);
      const hist = await fetchAppealHistory(id);
      setHistory(hist);
      setEditing(false);
    } catch (err) {
      console.error('Ошибка при обновлении:', err);
      setError('Не удалось обновить обращение.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить это обращение?')) return;
    try {
      await deleteAppeal(id);
      navigate('/appeals');
    } catch (err) {
      console.error('Ошибка при удалении:', err);
      setError('Не удалось удалить обращение.');
    }
  };

  return (
      <Container maxWidth="md" sx={{mt: 4, mb: 4}}>
        <Typography variant="h4" gutterBottom>
          Детали обращения
        </Typography>
        {error && (
            <Box sx={{mb: 2}}>
              <Typography variant="body1" color="error">
                {error}
              </Typography>
            </Box>
        )}

        {!editing ? (
            <Paper variant="outlined" sx={{p: 3}}>
              <Typography variant="body1" gutterBottom>
                <strong>ID:</strong> {appeal.id}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Дата создания:</strong>{' '}
                {new Date(appeal.created_at).toLocaleString()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Тип:</strong> {appeal.type_name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Уровень:</strong> {appeal.severity_name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Статус:</strong> {appeal.status_name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Локация:</strong> {appeal.location}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Описание:</strong> {appeal.description}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Источник:</strong> {appeal.source}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Reporter ID:</strong> {appeal.reporter_id || '—'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Assigned To ID:</strong> {appeal.assigned_to_id || '—'}
              </Typography>

              <Box sx={{mt: 2}}>
                <Typography variant="body1" gutterBottom>
                  <strong>Payload:</strong>
                </Typography>
                <Paper
                    variant="outlined"
                    sx={{
                      backgroundColor: '#f0f0f0',
                      p: 2,
                      borderRadius: 1,
                      overflowX: 'auto',
                      whiteSpace: 'pre-wrap',
                      fontFamily: '"Source Code Pro", monospace',
                      fontSize: '0.9rem',
                    }}
                >
                  {JSON.stringify(appeal.payload, null, 2)}
                </Paper>
              </Box>

              <Typography variant="body1" sx={{mt: 2}}>
                <strong>Удалено:</strong> {appeal.is_deleted ? 'Да' : 'Нет'}
              </Typography>

              <Box sx={{mt: 3, display: 'flex', gap: 2}}>
                <Button variant="contained" color="primary" onClick={handleEditToggle}>
                  Редактировать
                </Button>
                <Button variant="contained" color="error" onClick={handleDelete}>
                  Удалить
                </Button>
              </Box>

              <Box sx={{mt: 4}}>
                <AppealHistory history={history}/>
              </Box>
            </Paper>
        ) : (
            <Paper variant="outlined" sx={{p: 3}}>
              <Typography variant="h5" gutterBottom>
                Редактировать обращение
              </Typography>
              {error && (
                  <Box sx={{mb: 2}}>
                    <Typography variant="body1" color="error">
                      {error}
                    </Typography>
                  </Box>
              )}

              <FormControl fullWidth sx={{mb: 2}}>
                <InputLabel id="status-select-label">Статус</InputLabel>
                <Select
                    labelId="status-select-label"
                    value={statusId}
                    label="Статус"
                    onChange={(e) => setStatusId(e.target.value)}
                >
                  <MenuItem value={1}>Новое</MenuItem>
                  <MenuItem value={2}>В работе</MenuItem>
                  <MenuItem value={3}>Решено</MenuItem>
                  <MenuItem value={4}>Закрыто</MenuItem>
                </Select>
              </FormControl>

              <TextField
                  label="Assigned To ID"
                  fullWidth
                  sx={{mb: 2}}
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
              />

              <TextField
                  label="Локация"
                  fullWidth
                  sx={{mb: 2}}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
              />

              <TextField
                  label="Описание"
                  multiline
                  rows={4}
                  fullWidth
                  sx={{mb: 2}}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
              />

              <Box sx={{mt: 3, display: 'flex', gap: 2}}>
                <Button variant="contained" color="primary" onClick={handleUpdate}>
                  Сохранить
                </Button>
                <Button variant="outlined" color="secondary" onClick={handleEditToggle}>
                  Отмена
                </Button>
              </Box>
            </Paper>
        )}
      </Container>
  );
};

export default AppealDetail;
