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
                                          hardwareList = [],
                                          onPropertyChange,
                                          onAssignZones,
                                          onAssignHardware,
                                          maxX,
                                          maxY,
                                        }) {
  if (!camera) return null;

  // вычисляем пиксели из нормированных или старых полей
  const xPx = camera.xNorm != null ? camera.xNorm * maxX : camera.x ?? 0;
  const yPx = camera.yNorm != null ? camera.yNorm * maxY : camera.y ?? 0;
  const maxDim = Math.max(maxX, maxY);
  const rPx  = camera.viewRadiusNorm != null
      ? camera.viewRadiusNorm * maxDim
      : camera.viewRadius ?? 0;

  const assigned = camera.assignedZones || [];

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  // хендлер для X/Y: приводим к числу, режем в [0…dim], нормализуем
  const handleNumberField = (fieldNorm, dim) => e => {
    let vPx = parseFloat(e.target.value);
    if (!isNaN(vPx)) {
      vPx = clamp(vPx, 0, dim);
      onPropertyChange(camera.id, fieldNorm, vPx / dim);
    }
  };

  // хендлер для радиуса
  const handleRadiusSlider = (_, vPx) => {
    const rClamped = clamp(vPx, 0, maxDim);
    onPropertyChange(camera.id, 'viewRadiusNorm', rClamped / maxDim);
  };

  // хендлер для pivot и угла
  const handleSimple = field => (_, v) => {
    onPropertyChange(camera.id, field, v);
  };

  return (
      <Box p={2} sx={{ border: '1px solid #ddd', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Параметры камеры #{camera.id}
        </Typography>

        <Stack spacing={2}>
          {/* Положение X */}
          <TextField
              label="X (px)"
              type="number"
              value={Math.round(xPx)}
              onChange={handleNumberField('xNorm', maxX)}
              inputProps={{ min: 0, max: maxX - 15 }}
              size="small"
              fullWidth
          />

          {/* Положение Y */}
          <TextField
              label="Y (px)"
              type="number"
              value={Math.round(yPx)}
              onChange={handleNumberField('yNorm', maxY)}
              inputProps={{ min: 0, max: maxY - 15}}
              size="small"
              fullWidth
          />

          {/* Поворот */}
          <Box>
            <Typography gutterBottom>Поворот (°)</Typography>
            <Slider
                value={camera.rotation}
                onChange={handleSimple('rotation')}
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
                value={rPx}
                onChange={handleRadiusSlider}
                min={0}
                max={maxDim}
                step={1}
                valueLabelDisplay="auto"
            />
          </Box>

          {/* Угол зоны */}
          <Box>
            <Typography gutterBottom>Угол (°)</Typography>
            <Slider
                value={camera.viewAngle}
                onChange={handleSimple('viewAngle')}
                min={0}
                max={360}
                step={1}
                valueLabelDisplay="auto"
            />
          </Box>

          {/* Назначенные зоны */}
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

          {/* Привязка к «железной» камере */}
          <FormControl fullWidth size="small">
            <InputLabel>Железная камера</InputLabel>
            <Select
                value={camera.hardwareId || ''}
                onChange={e => onAssignHardware(camera.id, e.target.value)}
                label="Железная камера"
            >
              <MenuItem value="">
                <em>Не выбрано</em>
              </MenuItem>
              {hardwareList.map(hw => (
                  <MenuItem key={hw.id} value={hw.id}>
                    {hw.name}
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
    x: PropTypes.number,
    y: PropTypes.number,
    xNorm: PropTypes.number,
    yNorm: PropTypes.number,
    rotation: PropTypes.number.isRequired,
    viewRadius: PropTypes.number,
    viewRadiusNorm: PropTypes.number,
    viewAngle: PropTypes.number.isRequired,
    assignedZones: PropTypes.arrayOf(PropTypes.number),
    hardwareId: PropTypes.string,
  }),
  zones: PropTypes.array.isRequired,
  hardwareList: PropTypes.arrayOf(
      PropTypes.shape({ id: PropTypes.string, name: PropTypes.string })
  ).isRequired,
  onPropertyChange: PropTypes.func.isRequired,
  onAssignZones: PropTypes.func.isRequired,
  onAssignHardware: PropTypes.func.isRequired,
  maxX: PropTypes.number.isRequired,
  maxY: PropTypes.number.isRequired,
};
