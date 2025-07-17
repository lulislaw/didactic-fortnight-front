// src/components/FilterBar.jsx
import React from 'react';
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon      from '@mui/icons-material/Clear';
import SearchIcon     from '@mui/icons-material/Search';

export default function FilterBar({ tabs, activeTab, onTabChange, onSearch, onAdvanced, onClear }) {
  return (
      <Box
          display="flex"
          alignItems="center"
          mb={2}
      >
        {/* Кнопки‑фильтры */}
        <Box display="flex" gap={1} flexGrow={1}>
          {tabs.map(tab => (
              <Button
                  key={tab.key}
                  variant={activeTab === tab.key ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => onTabChange(tab.key)}
              >
                {tab.label} ({tab.count})
              </Button>
          ))}
        </Box>

        {/* Иконка фильтра */}
        <IconButton color="primary" sx={{ mr: 2 }} onClick={onAdvanced}>
          <FilterListIcon />
        </IconButton>
        <IconButton color="primary" sx={{ mr: 2 }} onClick={onClear}>
          <ClearIcon />
        </IconButton>
        {/* Поле поиска */}
        <TextField
            size="small"
            placeholder="Поиск…"
            onChange={e => onSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
              )
            }}
        />
      </Box>
  );
}
