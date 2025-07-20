// src/pages/BuildingConstructorPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Circle } from 'react-konva';
import {
  Container,
  Box,
  Stack,
  Button,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

import FloorUploader from '@/components/constructor/FloorUploader.jsx';
import FloorBlock from '@/components/constructor/FloorBlock.jsx';
import PlatformBlock from '@/components/constructor/PlatformBlock.jsx';
import CameraCanvas from '@/components/constructor/CameraCanvas.jsx';
import CameraWorkspace from '@/components/constructor/CameraWorkspace.jsx';
import ElementTree from '@/components/constructor/ElementTree.jsx';
import ZoneWorkspace from '@/components/constructor/ZoneWorkspace.jsx';
import TextField from '@mui/material/TextField';

export default function BuildingConstructorPage() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const scrollRef = useRef(null);

  // размеры «плана этажей»
  const floorWidth = 120;
  const floorHeight = 40;
  const shapeHeight = floorHeight;
  const topMargin = 100;
  const containerWidth = 600;
  const containerHeight = 400;

  // ширина холста камеры
  const canvasSize = 800;

  // счётчики этажей
  const [aboveCount, setAboveCount] = useState(1);
  const [belowCount, setBelowCount] = useState(0);
  // фоны и камеры
  const [dataMap, setDataMap] = useState({});       // { floorId: dataUrl }
  const [camerasMap, setCamerasMap] = useState({}); // { floorId: [camera,…] }
  const [zonesMap, setZonesMap] = useState({});     // { floorId: [zone,…] }
  const [selectedZone, setSelectedZone] = useState(null);
  // выбранные элементы
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [hoveredFloor, setHoveredFloor] = useState(null);
  const [buildingName, setBuildingName] = useState('Новое здание');
  // сброс прокрутки при смене этажей
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [aboveCount, belowCount]);

  // списки этажей
  const negFloors = [];
  for (let i = -belowCount; i < 0; i++) negFloors.push(i);
  const posFloors = [];
  for (let i = 1; i <= aboveCount; i++) posFloors.push(i);
  const allFloors = [...negFloors, ...posFloors].sort((a, b) => b - a);

  // сохранить фон этажа
  const updateFloorSvg = (floorId, dataUrl) => {
    setDataMap(prev => ({ ...prev, [floorId]: dataUrl }));
  };

  // добавить камеру
  const addCamera = () => {
    if (selectedFloor == null) return;
    const cams = camerasMap[selectedFloor] || [];
    const newCam = {
      id: Date.now(),
      x: floorWidth / 2 - 12,
      y: floorHeight / 2 - 12,
      rotation: 0,
      viewRadius: 100,
      viewAngle: 60,
      size: 24,
      assignedZones: [],
    };
    setCamerasMap(prev => ({
      ...prev,
      [selectedFloor]: [...cams, newCam],
    }));
    setSelectedCamera(newCam.id);
  };

  // перемещение камеры
  const updateCameraPos = (camId, x, y) => {
    setCamerasMap(prev => ({
      ...prev,
      [selectedFloor]: (prev[selectedFloor] || []).map(cam =>
        cam.id === camId ? { ...cam, x, y } : cam
      ),
    }));
  };

  // изменение параметров камеры
  const handleCameraPropertyChange = (camId, field, value) => {
    setCamerasMap(prev => ({
      ...prev,
      [selectedFloor]: (prev[selectedFloor] || []).map(cam =>
        cam.id === camId ? { ...cam, [field]: value } : cam
      ),
    }));
  };

  // текущие камеры и выбранная
  const addZone = () => {
    if (selectedFloor == null) return;
    const zs = zonesMap[selectedFloor] || [];
    const newZone = {
      id: Date.now(),
      points: [50, 50, 150, 50, 100, 150],
      fill: 'rgba(255,0,0,0.2)',
    };
    setZonesMap(prev => ({
      ...prev,
      [selectedFloor]: [...zs, newZone],
    }));
    setSelectedZone(newZone.id);
  };

  // перетаскивание вершины зоны
  const handleZonePointDrag = (zoneId, ptIdx, x, y) => {
    setZonesMap(prev => ({
      ...prev,
      [selectedFloor]: (prev[selectedFloor] || []).map(z =>
        z.id !== zoneId
          ? z
          : {
            ...z,
            points: z.points.map((v, i) =>
              i === ptIdx * 2 ? x
                : i === ptIdx * 2 + 1 ? y
                  : v
            )
          }
      )
    }));
  };

  // текущие камеры и выбранная

  const cameras = camerasMap[selectedFloor] || [];
  const zones = zonesMap[selectedFloor] || [];
  const currentCamera =
    selectedFloor != null && selectedCamera != null
      ? cameras.find(cam => cam.id === selectedCamera)
      : null;
  // параметры сцены этажей
  const centerY = aboveCount * shapeHeight + topMargin;
  const stageHeight =
    (aboveCount + belowCount) * shapeHeight +
    shapeHeight +
    topMargin * 2;
  const originX = (containerWidth - floorWidth) / 2;
  const handleExport = () => {
    // Собираем структуру
    const payload = {
      aboveCount,
      belowCount,
      backgrounds: dataMap,
      cameras: camerasMap,
      zones: zonesMap,
      buildingName,
    };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'building.json';
    a.click();
    URL.revokeObjectURL(url);
  };

// Импортируем JSON и заливаем в стейт
  const handleImport = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        // Раскладываем обратно в стейт
        if (typeof obj.buildingName === 'string') {
          setBuildingName(obj.buildingName);
        }
        if (typeof obj.aboveCount === 'number') setAboveCount(obj.aboveCount);
        if (typeof obj.belowCount === 'number') setBelowCount(obj.belowCount);
        if (obj.backgrounds) setDataMap(obj.backgrounds);
        if (obj.cameras) setCamerasMap(obj.cameras);
        if (obj.zones) setZonesMap(obj.zones);
      } catch (err) {
        console.error('Ошибка парсинга JSON', err);
        alert('Не удалось импортировать: неверный формат JSON');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ p: isMdUp ? 2 : 1 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
      >
        {/* 1) Левая панель (дерево) */}

        <Box
          sx={{
            flexShrink: 0,
            width: { xs: '100%', md: 240 },
            height: '89vh',
            bgcolor: 'background.paper',
            borderRight: { md: '1px solid #ddd' },
            p: 1,
            overflowY: 'auto',
            position: 'sticky',
            top: 0,
          }}
        >
          {/* Импорт/Экспорт */}
          <Box sx={{ my: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
            <Button variant="outlined" onClick={handleExport}>
              Экспорт JSON
            </Button>
            <Button variant="outlined" component="label">
              Импорт JSON
              <input
                type="file"
                accept="application/json"
                hidden
                onChange={handleImport}
              />
            </Button>
          </Box>
          <Box sx={{ mb: 1, px: 2 }}>
            <TextField
              label="Название здания"
              value={buildingName}
              onChange={e => setBuildingName(e.target.value)}
              fullWidth
              size="small"
            />
          </Box>
          <ElementTree
            buildingName={buildingName}
            floors={allFloors}
            camerasMap={camerasMap}
            selectedFloorId={selectedFloor}
            selectedCameraId={selectedCamera}
            onSelectFloor={floorId => {
              setSelectedFloor(floorId);
              setSelectedCamera(null);
            }}
            onSelectCamera={camId => {
              const floorOfCam = allFloors.find(f =>
                (camerasMap[f] || []).some(c => c.id === camId)
              );
              if (floorOfCam != null) setSelectedFloor(floorOfCam);
              setSelectedCamera(camId);
            }}
          />
        </Box>

        {/* 2) Средняя панель: схема этажей */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}>
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              display: 'flex',                // превращаем Box в flex‑контейнер
              justifyContent: 'center',      // центрируем по горизонтали
              alignItems: 'center',
            }}>

            <Box
              ref={scrollRef}
              sx={{
                width: containerWidth,
                height: containerHeight,
                border: '1px solid #ccc',
                position: 'relative',
                overflowY: 'auto',
                overflowX: 'hidden',
                resize: 'vertical',
                backgroundColor: '#fff'

              }}
            >
              <Stage
                width={containerWidth}
                height={stageHeight}
                style={{ position: 'absolute', top: 0, left: 0 }}
              >
                <Layer>
                  {negFloors.map(id => (
                    <FloorBlock
                      key={id}
                      id={id}
                      floorWidth={floorWidth}
                      floorHeight={floorHeight}
                      originX={originX}
                      groupY={centerY}
                      isSelected={id === selectedFloor}
                      isHovered={id === hoveredFloor}
                      onClick={() => {
                        setSelectedFloor(id);
                        setSelectedCamera(null);
                      }}
                      onMouseEnter={() => setHoveredFloor(id)}
                      onMouseLeave={() => setHoveredFloor(null)}
                    />
                  ))}
                  <PlatformBlock
                    floorWidth={floorWidth}
                    originX={originX}
                    centerY={centerY}
                  />
                  <Circle
                    x={originX + floorWidth / 2}
                    y={centerY}
                    radius={5}
                    fill="#ff0"
                  />
                  {posFloors.map(id => (
                    <FloorBlock
                      key={id}
                      id={id}
                      floorWidth={floorWidth}
                      floorHeight={floorHeight}
                      originX={originX}
                      groupY={centerY}
                      isSelected={id === selectedFloor}
                      isHovered={id === hoveredFloor}
                      onClick={() => {
                        setSelectedFloor(id);
                        setSelectedCamera(null);
                      }}
                      onMouseEnter={() => setHoveredFloor(id)}
                      onMouseLeave={() => setHoveredFloor(null)}
                    />
                  ))}
                </Layer>
              </Stage>
              <Box sx={{ pt: 1, pb: 1, margin: 1, border: '1px solid #ccc', }}>
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={belowCount === 0}
                    onClick={() => setBelowCount(v => Math.max(0, v - 1))}
                  >
                    – подзем
                  </Button>
                  <Typography variant="body2" sx={{ px: 1, lineHeight: '32px' }}>
                    ╳ {belowCount}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setBelowCount(v => v + 1)}
                  >
                    + подзем
                  </Button>
                  <Divider orientation="vertical" flexItem sx={{ mx: 1 }}/>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={aboveCount === 1}
                    onClick={() => setAboveCount(v => Math.max(1, v - 1))}
                  >
                    – надзем
                  </Button>
                  <Typography variant="body2" sx={{ px: 1, lineHeight: '32px' }}>
                    ╳ {aboveCount}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setAboveCount(v => v + 1)}
                  >
                    + надзем
                  </Button>
                </Stack>
              </Box>
            </Box>

          </Box>

        </Box>
        {/* 3) Правая панель: план этажа и загрузка */}


        {selectedFloor != null && (
          <>

            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                display: 'flex',                // превращаем Box в flex‑контейнер
                justifyContent: 'center',      // центрируем по горизонтали
                alignItems: 'center',
              }}
            >
              <CameraCanvas

                imageSrc={dataMap[selectedFloor]}
                width={canvasSize}
                height={canvasSize}
                cameras={cameras}
                onCameraDragEnd={updateCameraPos}
                onSelectCamera={setSelectedCamera}
                onCameraPropertyChange={handleCameraPropertyChange}

                zones={zonesMap[selectedFloor] || []}
                selectedZoneId={selectedZone}
                onSelectZone={setSelectedZone}
                onZonePointDrag={handleZonePointDrag}
              />

            </Box>


          </>
        )}


        {/* 4) Правая панель: настройки камеры */}
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: '100%', md: 240 },
            height: '89vh',
            bgcolor: 'background.paper',
            borderLeft: { md: '1px solid #ddd' },
            p: 1,
            overflowY: 'auto',
            position: 'sticky',
            top: 0,
          }}
        >
          {selectedFloor != null && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="h6" gutterBottom>
                План этажа #{selectedFloor}
              </Typography>
              <FloorUploader
                onUpload={dataUrl => updateFloorSvg(selectedFloor, dataUrl)}
                resetKey={selectedFloor}
                initialPreview={dataMap[selectedFloor] || null}
              />
            </Box>
          )}
          {selectedFloor == null && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="h6" gutterBottom>
                Выберите этаж
              </Typography>
            </Box>
          )}

          {selectedFloor != null && (
            <Box
              sx={{
                pt: 1,
                display: 'flex',
                justifyContent: 'center',
                gap: 1,          // отступ между кнопками
              }}
            >
              <Button
                variant="contained"
                startIcon={<CameraAltIcon/>}
                onClick={addCamera}
                fullWidth={!isMdUp}
              >
                Добавить камеру
              </Button>
              <Button
                variant="outlined"
                onClick={addZone}
              >
                Добавить зону
              </Button>
            </Box>
          )}

          <CameraWorkspace
            camera={currentCamera}

            zones={zonesMap[selectedFloor] || []}               // все зоны этажа
            onAssignZones={(camId, assignedZones) => {
              setCamerasMap(prev => ({
                ...prev,
                [selectedFloor]: (prev[selectedFloor] || []).map(c =>
                  c.id === camId ? { ...c, assignedZones } : c
                )
              }));
            }}
            onPropertyChange={handleCameraPropertyChange}
            maxX={canvasSize - (currentCamera?.size || 0)}
            maxY={canvasSize - (currentCamera?.size || 0)}
          />

          <Box mt={2}>
            <ZoneWorkspace
              zone={zones.find(z => z.id === selectedZone)}
              onUpdatePoint={(zoneId, idx, axis, value) => {
                handleZonePointDrag(
                  zoneId,
                  idx,
                  axis === 'x' ? value : zonesMap[selectedFloor].find(z => z.id === zoneId).points[idx * 2],
                  axis === 'y' ? value : zonesMap[selectedFloor].find(z => z.id === zoneId).points[idx * 2 + 1]
                );
              }}
              onAddPoint={zoneId => {
                setZonesMap(prev => ({
                  ...prev,
                  [selectedFloor]: prev[selectedFloor].map(z => {
                    if (z.id !== zoneId) return z;
                    const pts = z.points;
                    // координаты между первой и второй
                    const x0 = pts[0], y0 = pts[1];
                    const x1 = pts[2], y1 = pts[3];
                    const mx = (x0 + x1) / 2;
                    const my = (y0 + y1) / 2;
                    // вставляем [mx,my] между 0 и 1 индексами
                    const newPoints = [
                      x0, y0,
                      mx, my,
                      ...pts.slice(2),
                    ];
                    return { ...z, points: newPoints };
                  }),
                }));
              }}
              onRemovePoint={zoneId => {
                setZonesMap(prev => ({
                  ...prev,
                  [selectedFloor]: prev[selectedFloor].map(z =>
                    z.id !== zoneId
                      ? z
                      : {
                        ...z,
                        points: z.points.slice(0, -2),
                      }
                  )
                }));
              }}
            />
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
