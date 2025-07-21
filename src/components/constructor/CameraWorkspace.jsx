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
                                          scaleCoef,
                                        }) {
  if (!camera) return null;

  const assigned = camera.assignedZones || [];

  const handleNumberField = field => e => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) onPropertyChange(camera.id, field, v);
  };
  const handleSlider = field => (_, v) => onPropertyChange(camera.id, field, v);

  return (
      <Box p={2} sx={{ border: '1px solid #ddd', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Параметры камеры #{camera.id}
        </Typography>

        <Stack spacing={2}>
          {/* положение */}
          <TextField
              label="X (px)" type="number"
              inputProps={{ min: 0, max: maxX }}
              value={camera.x} onChange={handleNumberField('x')}
              size="small" fullWidth
          />
          <Typography>X: {(camera.x / scaleCoef).toFixed(1)}</Typography>

          <TextField
              label="Y (px)" type="number"
              inputProps={{ min: 0, max: maxY }}
              value={camera.y} onChange={handleNumberField('y')}
              size="small" fullWidth
          />
          <Typography>Y: {(camera.y / scaleCoef).toFixed(1)}</Typography>

          {/* поворот */}
          <Box>
            <Typography gutterBottom>Поворот (°)</Typography>
            <Slider
                value={camera.rotation}
                onChange={handleSlider('rotation')}
                min={0} max={360} step={1}
                valueLabelDisplay="auto"
            />
          </Box>

          {/* радиус */}
          <Box>
            <Typography gutterBottom>Радиус (px)</Typography>
            <Slider
                value={camera.viewRadius}
                onChange={handleSlider('viewRadius')}
                min={0} max={500} step={1}
                valueLabelDisplay="auto"
            />
          </Box>

          {/* угол */}
          <Box>
            <Typography gutterBottom>Угол (°)</Typography>
            <Slider
                value={camera.viewAngle}
                onChange={handleSlider('viewAngle')}
                min={0} max={360} step={1}
                valueLabelDisplay="auto"
            />
          </Box>

          {/* назначенные зоны */}
          <FormControl fullWidth size="small">
            <InputLabel>Назначенные зоны</InputLabel>
            <Select
                multiple
                value={assigned}
                onChange={e => onAssignZones(camera.id, e.target.value)}
                renderValue={v => v.map(id => `#${id}`).join(', ')}
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

          {/* привязка к реальной камере */}
          <FormControl fullWidth size="small">
            <InputLabel>Железная камера</InputLabel>
            <Select
                value={camera.hardwareId || ''}
                onChange={e => onAssignHardware(camera.id, e.target.value)}
                label="Железная камера"
            >
              <MenuItem value=""><em>Не выбрано</em></MenuItem>
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
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    rotation: PropTypes.number.isRequired,
    viewRadius: PropTypes.number.isRequired,
    viewAngle: PropTypes.number.isRequired,
    size: PropTypes.number,
    assignedZones: PropTypes.arrayOf(PropTypes.number),
    hardwareId: PropTypes.string,           // UUID строки
  }),
  zones: PropTypes.array.isRequired,
  hardwareList: PropTypes.arrayOf(
      PropTypes.shape({ id: PropTypes.string, name: PropTypes.string })
  ).isRequired,
  onPropertyChange: PropTypes.func.isRequired,
  onAssignZones: PropTypes.func.isRequired,
  onAssignHardware: PropTypes.func.isRequired,
  maxX: PropTypes.number,
  maxY: PropTypes.number,
  scaleCoef: PropTypes.number,
};
