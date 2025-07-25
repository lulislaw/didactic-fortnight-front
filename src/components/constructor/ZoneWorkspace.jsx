import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Stack, TextField, Button } from '@mui/material';

export default function ZoneWorkspace({
                                        zone,
                                        onUpdatePoint,
                                        onAddPoint,
                                        onRemovePoint,
                                      }) {
  const raw = Array.isArray(zone?.pointsNorm)
      ? zone.pointsNorm
      : Array.isArray(zone?.points)
          ? zone.points
          : null;
  if (!raw) return null;
  const pts = [];
  for (let i = 0; i < raw.length; i += 2) {
    const x = raw[i];
    const y = raw[i + 1];
    if (typeof x === 'number' && typeof y === 'number') {
      pts.push({ x, y });
    }
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
                    onChange={e =>
                        onUpdatePoint(
                            zone.id,
                            idx,
                            'x',
                            parseFloat(e.target.value) || 0
                        )
                    }
                />
                <TextField
                    label={`Y${idx}`}
                    type="number"
                    size="small"
                    value={pt.y}
                    onChange={e =>
                        onUpdatePoint(
                            zone.id,
                            idx,
                            'y',
                            parseFloat(e.target.value) || 0
                        )
                    }
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
                // disable if only 3 points left (triangle)
                disabled={pts.length <= 3}
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
    points: PropTypes.arrayOf(PropTypes.number),
    pointsNorm: PropTypes.arrayOf(PropTypes.number),
    fill: PropTypes.string,
  }),
  onUpdatePoint: PropTypes.func.isRequired,
  onAddPoint: PropTypes.func.isRequired,
  onRemovePoint: PropTypes.func.isRequired,
};
