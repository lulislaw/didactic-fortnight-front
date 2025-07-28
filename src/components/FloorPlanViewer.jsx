import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Stage, Layer, Image as KonvaImage, Circle, Arc, Line } from 'react-konva';
import useImage from 'use-image';
import { getConfigs, getConfig } from '@/api/building_configs';

const cameraIconSrc = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path fill="#000" d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2
      .9-2 2v12h20V7c0-1.1-.9-2-2-2zM12 17
      c-2.76 0-5-2.24-5-5s2.24-5 5-5 5
      2.24 5 5-2.24 5-5 5z"/>
  </svg>
`)}`;

export default function FloorPlanViewer({ onSelectionChange, onCameraClick }) {
  const [buildings, setBuildings] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);

  useEffect(() => {
    getConfigs()
        .then(data => {
          setBuildings(data);
          if (data.length > 0) {
            setSelectedBuildingId(data[0].id);
          }
        })
        .catch(() => setError('Не удалось загрузить список зданий'));
  }, []);

  useEffect(() => {
    if (!selectedBuildingId) return;
    setLoadingConfig(true);
    setError(null);
    getConfig(selectedBuildingId)
        .then(cfg => {
          setConfig(cfg);
          const { aboveCount, belowCount } = cfg.config;
          const floors = [
            ...Array.from({ length: belowCount }, (_, i) => -(belowCount - i)),
            ...Array.from({ length: aboveCount }, (_, i) => i + 1),
          ];
          setSelectedFloor(floors[0]);
        })
        .catch(() => setError('Не удалось загрузить конфигурацию здания'))
        .finally(() => setLoadingConfig(false));
  }, [selectedBuildingId]);

  useEffect(() => {
    if (!config || selectedBuildingId == null || selectedFloor == null) return;
    const cams = config.config.cameras?.[selectedFloor] || [];
    onSelectionChange(selectedBuildingId, selectedFloor, cams);
  }, [config, selectedBuildingId, selectedFloor, onSelectionChange]);

  if (error) {
    return (
        <Container sx={{ py: 4 }}>
          <Typography color="error">{error}</Typography>
        </Container>
    );
  }
  if (loadingConfig || !config) {
    return (
        <Container sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Container>
    );
  }

  const { name_build, config: cfg } = config;
  const bgFilename = cfg.backgrounds?.[selectedFloor];
  const bgUrl = bgFilename ? bgFilename : null;
  const winW = window.innerWidth;
  const canvasSize = winW > 1920 ? 800 : winW > 800 ? 400 : 200;

  return (
      <Container sx={{ py: 4 }}>
        {/* Выбрать здание и этаж */}
        <Box mb={3} display="flex" gap={2} flexWrap="wrap">
          <FormControl size="small">
            <InputLabel>Здание</InputLabel>
            <Select
                value={selectedBuildingId || ''}
                label="Здание"
                onChange={e => setSelectedBuildingId(e.target.value)}
            >
              {buildings.map(b => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name_build}
                  </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Этаж</InputLabel>
            <Select
                value={selectedFloor}
                label="Этаж"
                onChange={e => setSelectedFloor(e.target.value)}
            >
              {[
                ...Array.from({ length: cfg.belowCount }, (_, i) => -(cfg.belowCount - i)),
                ...Array.from({ length: cfg.aboveCount }, (_, i) => i + 1),
              ].map(f => (
                  <MenuItem key={f} value={f}>
                    {f > 0 ? `+${f}` : f}
                  </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Typography variant="h5" gutterBottom>
          {name_build} — этаж {selectedFloor > 0 ? `+${selectedFloor}` : selectedFloor}
        </Typography>

        <Box
            sx={{
              width: canvasSize,
              height: canvasSize,
              border: '1px solid #ccc',
              touchAction: 'none',
            }}
        >
          <FloorCanvas
              imageUrl={bgUrl}
              cameras={cfg.cameras[selectedFloor] || []}
              zones={cfg.zones[selectedFloor] || []}
              size={canvasSize}
              onCameraClick={onCameraClick}
          />
        </Box>
      </Container>
  );
}

FloorPlanViewer.propTypes = {
  onSelectionChange: PropTypes.func.isRequired,
  onCameraClick: PropTypes.func.isRequired,
};


function FloorCanvas({ imageUrl, cameras = [], zones = [], size, onCameraClick }) {
  const [bgImage] = useImage(imageUrl, 'anonymous');
  const [camIcon] = useImage(cameraIconSrc);

  return (
      <Stage width={size} height={size} listening>
        <Layer>
          {bgImage && <KonvaImage image={bgImage} x={0} y={0} width={size} height={size} />}
          {zones.map(z => {
            const pts = Array.isArray(z.points)
                ? z.points
                : Array.isArray(z.pointsNorm)
                    ? z.pointsNorm.map(v => (v <= 1 ? v * size : v))
                    : [];

            return (
                <Line
                    key={z.id}
                    points={pts}
                    closed
                    fill={z.fill || 'rgba(255,0,0,0.2)'}
                    stroke="gray"
                    strokeWidth={2}
                />
            );
          })}
          {cameras.map(cam => {
            const cx = cam.xNorm != null ? cam.xNorm * size : cam.x;
            const cy = cam.yNorm != null ? cam.yNorm * size : cam.y;
            const rawR = cam.viewRadiusNorm != null
                ? cam.viewRadiusNorm * size
                : cam.viewRadius;
            const iconSize = cam.size || 24;
            const half = iconSize / 2;

            return (
                <React.Fragment key={cam.id}>
                  <Arc
                      x={cx + half}
                      y={cy + half}
                      innerRadius={0}
                      outerRadius={rawR}
                      angle={cam.viewAngle}
                      rotation={cam.rotation}
                      fill="rgba(0,0,255,0.2)"
                      onClick={() => onCameraClick(cam)}
                  />
                  <Circle
                      x={cx + half}
                      y={cy + half}
                      radius={half + 2}
                      fill="white"
                      stroke="black"
                      strokeWidth={2}
                      onClick={() => onCameraClick(cam)}
                  />
                  {camIcon && (
                      <KonvaImage
                          image={camIcon}
                          x={cx}
                          y={cy}
                          width={iconSize}
                          height={iconSize}
                          onClick={() => onCameraClick(cam)}
                      />
                  )}
                </React.Fragment>
            );
          })}
        </Layer>
      </Stage>
  );
}

FloorCanvas.propTypes = {
  imageUrl: PropTypes.string,
  cameras: PropTypes.array.isRequired,
  zones: PropTypes.array.isRequired,
  size: PropTypes.number.isRequired,
  onCameraClick: PropTypes.func.isRequired,
};
