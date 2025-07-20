// src/components/constructor/ZoneWorkspace.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Stack, TextField, Button } from '@mui/material';

export default function ZoneWorkspace({
                                        zone,
                                        onUpdatePoint,
                                        onAddPoint,
                                        onRemovePoint,
                                      }) {
  if (!zone) {
    return null
  }

  // по парам координат собираем массив вида [{x,y},…]
  const pts = [];
  for (let i = 0; i < zone.points.length; i += 2) {
    pts.push({ x: zone.points[i], y: zone.points[i + 1] });
  }

  return (
    <Box p={2} sx={{ border: '1px solid #ddd', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Редактирование зоны #{zone.id}
      </Typography>

      <Stack spacing={2}>
        {pts.map((pt, idx) => (
          <Stack key={idx} direction="row" spacing={1} alignItems="center">
            <TextField
              label={`X${idx}`}
              type="number"
              size="small"
              value={pt.x}
              onChange={e => onUpdatePoint(zone.id, idx, 'x', parseFloat(e.target.value))}
            />
            <TextField
              label={`Y${idx}`}
              type="number"
              size="small"
              value={pt.y}
              onChange={e => onUpdatePoint(zone.id, idx, 'y', parseFloat(e.target.value))}
            />
          </Stack>
        ))}

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => onAddPoint(zone.id)}>
            + Точка
          </Button>
          <Button
            variant="outlined"
            color="error"
            disabled={zone.points.length <= 6}
            onClick={() => onRemovePoint(zone.id)}
          >
            – Точка
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

ZoneWorkspace.propTypes = {
  zone: PropTypes.shape({
    id: PropTypes.number.isRequired,
    points: PropTypes.arrayOf(PropTypes.number).isRequired,
    fill: PropTypes.string,
  }),
  onUpdatePoint: PropTypes.func.isRequired,
  onAddPoint: PropTypes.func.isRequired,
  onRemovePoint: PropTypes.func.isRequired,
};
