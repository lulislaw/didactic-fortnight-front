// src/components/FilterDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText
} from '@mui/material';

export default function FilterDialog({
                                       open,
                                       initialFilters,
                                       onApply,
                                       onClose,
                                     }) {
  const [filters, setFilters] = useState(initialFilters);

  // при открытии диалога синхронизируем локальный стейт
  useEffect(() => {
    if (open) {
      setFilters(initialFilters);
    }
  }, [open, initialFilters]);

  // сброс полей внутри диалога
  const handleClear = () => {
    setFilters({
      searchText: '',
      statuses: [],
      severities: [],
      dateFrom: '',
      dateTo: '',
    });
  };

  return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Расширенный фильтр</DialogTitle>
        <DialogContent dividers>
          <TextField
              fullWidth
              label="Текст поиска"
              value={filters.searchText}
              onChange={e => setFilters(f => ({ ...f, searchText: e.target.value }))}
              margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Приоритет</InputLabel>
            <Select
                multiple
                value={filters.severities}
                onChange={e => setFilters(f => ({ ...f, severities: e.target.value }))}
                renderValue={selected => selected.join(', ')}
            >
              {[1,2,3].map(id => (
                  <MenuItem key={id} value={id}>
                    <Checkbox checked={filters.severities.includes(id)} />
                    <ListItemText primary={`Уровень ${id}`} />
                  </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
              fullWidth
              type="date"
              label="С"
              InputLabelProps={{ shrink: true }}
              value={filters.dateFrom}
              onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
              margin="normal"
          />
          <TextField
              fullWidth
              type="date"
              label="По"
              InputLabelProps={{ shrink: true }}
              value={filters.dateTo}
              onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
              margin="normal"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClear}>Очистить</Button>
          <Button onClick={onClose}>Отмена</Button>
          <Button variant="contained" onClick={() => onApply(filters)}>
            Применить
          </Button>
        </DialogActions>
      </Dialog>
  );
}
