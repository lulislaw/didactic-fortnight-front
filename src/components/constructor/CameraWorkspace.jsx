// src/components/constructor/CameraWorkspace.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Stack,
  TextField,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from '@mui/material';

export default function CameraWorkspace({
                                          camera,
                                          zones = [],
                                          onPropertyChange,
                                          onAssignZones,
                                          maxX,
                                          maxY,
                                        }) {
  if (!camera) {
    return null
  }

  // Текущие назначенные зоны
  const assigned = camera.assignedZones || [];

  // Хэндлер для полей ввода числа
  const handleNumberField = field => event => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      onPropertyChange(camera.id, field, value);
    }
  };

  // Хэндлер для слайдеров
  const handleSlider = field => (_, value) => {
    onPropertyChange(camera.id, field, value);
  };

  return (
    <Box p={2} sx={{ border: '1px solid #ddd', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Параметры камеры #{camera.id}
      </Typography>

      <Stack spacing={2}>
        {/* Положение */}
        <TextField
          label="X (px)"
          type="number"
          inputProps={{ min: 0, max: maxX }}
          value={camera.x}
          onChange={handleNumberField('x')}
          size="small"
          fullWidth
        />
        <TextField
          label="Y (px)"
          type="number"
          inputProps={{ min: 0, max: maxY }}
          value={camera.y}
          onChange={handleNumberField('y')}
          size="small"
          fullWidth
        />

        {/* Поворот */}
        <Box>
          <Typography gutterBottom>Поворот (°)</Typography>
          <Slider
            value={camera.rotation}
            onChange={handleSlider('rotation')}
            min={0}
            max={360}
            step={1}
            valueLabelDisplay="auto"
          />
        </Box>

        {/* Радиус зоны */}
        <Box>
          <Typography gutterBottom>Радиус зоны (px)</Typography>
          <Slider
            value={camera.viewRadius}
            onChange={handleSlider('viewRadius')}
            min={0}
            max={500}
            step={1}
            valueLabelDisplay="auto"
          />
        </Box>

        {/* Угол зоны */}
        <Box>
          <Typography gutterBottom>Угол зоны (°)</Typography>
          <Slider
            value={camera.viewAngle}
            onChange={handleSlider('viewAngle')}
            min={0}
            max={360}
            step={1}
            valueLabelDisplay="auto"
          />
        </Box>

        {/* Селектор зон */}
        <FormControl fullWidth size="small">
          <InputLabel>Назначенные зоны</InputLabel>
          <Select
            multiple
            value={assigned}
            onChange={e => onAssignZones(camera.id, e.target.value)}
            renderValue={vals => vals.map(id => `#${id}`).join(', ')}
            label="Назначенные зоны"
          >
            {zones.map(z => (
              <MenuItem key={z.id} value={z.id}>
                <Checkbox checked={assigned.includes(z.id)} />
                <ListItemText primary={`Зона #${z.id}`} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Box>
  );
}

CameraWorkspace.propTypes = {
  camera: PropTypes.shape({
    id: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    rotation: PropTypes.number.isRequired,
    viewRadius: PropTypes.number.isRequired,
    viewAngle: PropTypes.number.isRequired,
    size: PropTypes.number,
    assignedZones: PropTypes.arrayOf(PropTypes.number),
  }),
  zones: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      points: PropTypes.arrayOf(PropTypes.number).isRequired,
      fill: PropTypes.string,
    })
  ),
  onPropertyChange: PropTypes.func.isRequired,
  onAssignZones: PropTypes.func.isRequired,
  maxX: PropTypes.number,
  maxY: PropTypes.number,
};
