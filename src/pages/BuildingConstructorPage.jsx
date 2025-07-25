import React, {useState, useRef, useEffect} from 'react';
import {Stage, Layer, Circle} from 'react-konva';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Container,
  Box,
  Stack,
  Button,
  Typography,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import {getCameras as fetchHardwareCameras} from '@/api/camera_hardware';
import FloorUploader from '@/components/constructor/FloorUploader.jsx';
import FloorBlock from '@/components/constructor/FloorBlock.jsx';
import PlatformBlock from '@/components/constructor/PlatformBlock.jsx';
import CameraCanvas from '@/components/constructor/CameraCanvas.jsx';
import CameraWorkspace from '@/components/constructor/CameraWorkspace.jsx';
import ElementTree from '@/components/constructor/ElementTree.jsx';
import ZoneWorkspace from '@/components/constructor/ZoneWorkspace.jsx';
import TextField from '@mui/material/TextField';
import {getUploadsFile} from "@/api/images";
import {createConfig, updateConfig, getConfig} from '@/api/building_configs';
import {useParams, useNavigate} from 'react-router-dom';

export default function BuildingConstructorPage() {
  function useWindowSize() {
    const isClient = typeof window === 'object';
    const [size, setSize] = useState({
      width: isClient ? window.innerWidth : undefined, height: isClient ? window.innerHeight : undefined,
    });

    useEffect(() => {
      if (!isClient) return;

      function handleResize() {
        setSize({width: window.innerWidth, height: window.innerHeight});
      }

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [isClient]);

    return size;
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {id} = useParams();
  const isNew = !id;
  const isEdit = Boolean(id);
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const scrollRef = useRef(null);
  const MAX_CONTAINER = 800;
  const {width: winW, height: winH} = useWindowSize();
  const floorWidth = winW > 1920 ? 200 : winW > 800 ? 120 : 80;
  const floorHeight = winH > 1080 ? 60 : winH > 600 ? 40 : 30;
  const topMargin = winW > 1920 ? 120 : winW > 800 ? 120 : 80;
  const containerWidth = winW > 1920
      ? Math.floor(winW * 0.4)
      : winW > 800
          ? Math.floor(winW * 0.2)
          : Math.floor(winW * 0.4);
  const containerHeight = winH > 1080
      ? Math.floor(winH * 0.4)
      : winH > 800
          ? Math.floor(winH * 0.2)
          : Math.floor(winH * 0.4);
  const canvasSize = winW > 1920 ? 800 : winW > 800 ? 400 : 200;
  const shapeHeight = floorHeight;
  const [aboveCount, setAboveCount] = useState(1);
  const [belowCount, setBelowCount] = useState(0);
  const [dataMap, setDataMap] = useState({});
  const [camerasMap, setCamerasMap] = useState({});
  const [zonesMap, setZonesMap] = useState({});
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [hoveredFloor, setHoveredFloor] = useState(null);
  const [buildingName, setBuildingName] = useState('Новое здание');
  const [idBuild, setIdBuild] = useState(1);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [aboveCount, belowCount]);
  const negFloors = [];
  for (let i = -belowCount; i < 0; i++) negFloors.push(i);
  const posFloors = [];
  for (let i = 1; i <= aboveCount; i++) posFloors.push(i);
  const allFloors = [...negFloors, ...posFloors].sort((a, b) => b - a);

  const updateFloorSvg = (floorId, dataUrl) => {
    setDataMap(prev => ({...prev, [floorId]: dataUrl}));
  };
  const [hardwareList, setHardwareList] = useState([]);
  const [configId, setConfigId] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const handleMenuOpen = (e) => setMenuAnchor(e.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);

  const handlePublish = async () => {
    const payloadCreate = {
      id_build: idBuild,
      name_build: buildingName,
      config: {
        aboveCount,
        belowCount,
        backgrounds: dataMap,
        cameras: camerasMap,
        zones: zonesMap,
      },
    };

    const payloadUpdate = {
      id_build: idBuild,
      name_build: buildingName,
      config: payloadCreate.config,
    };

    try {
      let res;
      if (isEdit) {
        res = await updateConfig(id, payloadUpdate);
      } else {
        res = await createConfig(payloadCreate);
        navigate(`/constructor/${res.id}`, {replace: true});
      }
      alert(`Конфигурация успешно ${isEdit ? 'обновлена' : 'создана'}.`);
    } catch (err) {
      console.error('Ошибка публикации:', err.response?.data || err);
      alert(
          'Не удалось опубликовать конфигурацию:\n' +
          JSON.stringify(err.response?.data || err, null, 2)
      );
    }
  };

  useEffect(() => {
    fetchHardwareCameras()
        .then(data => setHardwareList(data))
        .catch(err => console.error(err));
  }, []);

  const handleAssignHardware = (camId, hardwareId) => {
    handleCameraPropertyChange(camId, 'hardwareId', hardwareId);
  };
  const addCamera = () => {
    if (selectedFloor == null) return;
    const cams = camerasMap[selectedFloor] || [];
    const newCam = {
      id: Date.now(),
      xNorm: 0.5,
      yNorm: 0.5,
      rotation: 0,
      viewRadiusNorm: 0.2,
      viewAngle: 60,
      sizeNorm: 0.03,
      assignedZones: [],
    };
    setCamerasMap(prev => ({
      ...prev, [selectedFloor]: [...cams, newCam],
    }));
    setSelectedCamera(newCam.id);
  };

  const updateCameraPos = (camId, xNorm, yNorm) => {
    setCamerasMap(prev => ({
      ...prev,
      [selectedFloor]: prev[selectedFloor].map(c =>
          c.id === camId ? {...c, xNorm, yNorm} : c
      ),
    }));
  };

  const handleCameraPropertyChange = (camId, field, value) => {
    setCamerasMap(prev => ({
      ...prev,
      [selectedFloor]: (prev[selectedFloor] || []).map(cam => cam.id === camId ? {...cam, [field]: value} : cam),
    }));
  };

  const addZone = () => {
    if (selectedFloor == null) return;
    const zs = zonesMap[selectedFloor] || [];
    const newZone = {
      id: Date.now(), pointsNorm: [0.1, 0.1, 0.4, 0.1, 0.2, 0.3], fill: 'rgba(255,0,0,0.2)',
    };
    setZonesMap(prev => ({
      ...prev, [selectedFloor]: [...zs, newZone],
    }));
    setSelectedZone(newZone.id);
  };

  const handleZonePointDrag = (zoneId, ptIdx, xNorm, yNorm) => {
    setZonesMap(prev => ({
      ...prev,
      [selectedFloor]: (prev[selectedFloor] || []).map(z => {
        if (z.id !== zoneId) return z;
        const pn = [...(z.pointsNorm || [])];
        pn[ptIdx * 2] = xNorm;
        pn[ptIdx * 2 + 1] = yNorm;
        return {...z, pointsNorm: pn};
      }),
    }));
  };
  const cameras = camerasMap[selectedFloor] || [];
  const zones = zonesMap[selectedFloor] || [];
  const currentCamera = selectedFloor != null && selectedCamera != null ? cameras.find(cam => cam.id === selectedCamera) : null;
  const centerY = aboveCount * shapeHeight + topMargin;
  const stageHeight = (aboveCount + belowCount) * shapeHeight + shapeHeight + topMargin * 2;
  const originX = (containerWidth - floorWidth) / 2;
  const handleExport = () => {
    const backgroundsFilenames = Object.fromEntries(
        Object.entries(dataMap).map(([floorId, url]) => {
          const filename = url.split('/').pop();
          return [floorId, filename];
        })
    );
    console.log(dataMap)
    const payload = {
      aboveCount, belowCount, backgrounds: backgroundsFilenames, cameras: camerasMap, zones: zonesMap, buildingName,
    };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'building.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleImport = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        if (typeof obj.buildingName === 'string') {
          setBuildingName(obj.buildingName);
        }
        if (typeof obj.aboveCount === 'number') setAboveCount(obj.aboveCount);
        if (typeof obj.belowCount === 'number') setBelowCount(obj.belowCount);
        if (obj.backgrounds) setDataMap(obj.backgrounds);
        if (obj.cameras) setCamerasMap(obj.cameras);
        if (obj.zones) setZonesMap(obj.zones);
        if (obj.backgrounds) {
          const restoredBackgrounds = Object.fromEntries(
              Object.entries(obj.backgrounds).map(([floorId, filename]) => {
                return [floorId, getUploadsFile(filename)];
              })
          );
          setDataMap(restoredBackgrounds);
        }
      } catch (err) {
        console.error('Ошибка парсинга JSON', err);
        alert('Не удалось импортировать: неверный формат JSON');
      }
    };
    reader.readAsText(file);
  };
  const importConfigToState = cfg => {
    if (typeof cfg.buildingName === 'string') setBuildingName(cfg.buildingName);
    if (typeof cfg.aboveCount === 'number') setAboveCount(cfg.aboveCount);
    if (typeof cfg.belowCount === 'number') setBelowCount(cfg.belowCount);
    if (cfg.backgrounds) setDataMap(cfg.backgrounds);
    if (cfg.cameras) setCamerasMap(cfg.cameras);
    if (cfg.zones) setZonesMap(cfg.zones);
  };
  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    getConfig(id)
        .then(data => {
          importConfigToState(data.config);
          setBuildingName(data.name_build);
        })
        .catch(err => {
          console.error(err);
          setError('Не удалось загрузить конфигурацию');
        })
        .finally(() => {
          setLoading(false);
        });
  }, [id, isNew]);
  if (loading) {
    return (
        <Box
            sx={{
              width: '100vw', height: '100vh',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
        >
          <CircularProgress/>
        </Box>
    );
  }
  return (<Container maxWidth={false} disableGutters sx={{p: isMdUp ? 2 : 1}}>
    <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
    >
      <Alert onClose={() => setError(null)} severity="error" sx={{width: '100%'}}>
        {error}
      </Alert>
    </Snackbar>
    <Stack
        direction={{xs: 'column', md: 'row'}}
        spacing={2}
    >
      <Box
          sx={{
            flexShrink: 0,
            width: {xs: '100%', md: 240},
            height: '100%',
            maxHeight: '80vh',
            bgcolor: 'background.paper',
            borderRight: {md: '1px solid #ddd'},
            p: 1,
            overflowY: 'auto',
            position: 'sticky',
            top: 0,
          }}
      >
        <Box sx={{my: 2, display: 'flex', justifyContent: 'center'}}>
          <IconButton onClick={handleMenuOpen}>
            <Typography>Edit</Typography>
            <MoreVertIcon/>
          </IconButton>
          <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
          >
            <MenuItem
                onClick={() => {
                  handlePublish();
                  handleMenuClose();
                }}
            >
              Опубликовать
            </MenuItem>
            <MenuItem
                onClick={() => {
                  handleExport();
                  handleMenuClose();
                }}
            >
              Экспорт JSON
            </MenuItem>
            <MenuItem component="label">
              Импорт JSON
              <input
                  type="file"
                  accept="application/json"
                  hidden
                  onChange={(e) => {
                    handleImport(e);
                    handleMenuClose();
                  }}
              />
            </MenuItem>
          </Menu>
        </Box>
        <Box sx={{mb: 1, px: 2}}>
          <TextField
              label="Название здания"
              value={buildingName}
              onChange={e => setBuildingName(e.target.value)}
              fullWidth
              size="small"
          />
        </Box>
        <Box sx={{pt: 1, pb: 1, margin: 1, border: '1px solid #ccc',}}>
          <Stack direction="row" spacing={0} alignItems="center">
            <Typography sx={{width: 80, ml: 1}}>Надзем</Typography>
            <Typography
                variant="body1"
                sx={{width: 40, textAlign: "start"}}
            >
              {aboveCount}
            </Typography>
            <Stack spacing={0.5}>
              <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setAboveCount(v => v + 1)}
              >+</Button>
              <Button
                  variant="outlined"
                  size="small"
                  disabled={aboveCount === 1}
                  onClick={() => setAboveCount(v => Math.max(1, v - 1))}
              >–</Button>
            </Stack>
          </Stack>
          <Stack spacing={1}>
            <Stack direction="row" spacing={0} alignItems="center">
              <Typography sx={{width: 80, ml: 1}}>Подзем</Typography>
              <Typography
                  variant="body1"
                  sx={{width: 40, textAlign: "start"}}
              >
                {belowCount}
              </Typography>
              <Stack spacing={0.5}>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setBelowCount(v => v + 1)}
                >+</Button>
                <Button
                    variant="outlined"
                    size="small"
                    disabled={belowCount === 0}
                    onClick={() => setBelowCount(v => Math.max(0, v - 1))}
                >–</Button>
              </Stack>
            </Stack>
          </Stack>
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
              const floorOfCam = allFloors.find(f => (camerasMap[f] || []).some(c => c.id === camId));
              if (floorOfCam != null) setSelectedFloor(floorOfCam);
              setSelectedCamera(camId);
            }}
        />
      </Box>
      <Box
          sx={{
            flex: 1, display: 'flex', flexDirection: 'column',
          }}>
        <Box
            sx={{
              flex: 1, overflow: 'auto', display: 'flex',
              justifyContent: 'center',
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
                backgroundColor: '#fff',
                minHeight: '41vh',
              }}
          >
            <Stage
                width={containerWidth}
                height={stageHeight}
                style={{position: 'absolute', top: 0, left: 0}}
            >
              <Layer>
                {negFloors.map(id => (<FloorBlock
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
                />))}
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
                {posFloors.map(id => (<FloorBlock
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
                />))}
              </Layer>
            </Stage>
          </Box>
        </Box>
      </Box>
      {selectedFloor != null && (<>
        <Box
            sx={{
              flex: 1, overflow: 'auto', display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
        >
          <CameraCanvas
              imageSrc={dataMap[selectedFloor]}
              cameras={cameras}
              zones={zonesMap[selectedFloor] || []}
              selectedZoneId={selectedZone}
              onSelectZone={setSelectedZone}
              onZonePointDrag={handleZonePointDrag}
              onCameraDragEnd={updateCameraPos}
              onSelectCamera={setSelectedCamera}
              onCameraPropertyChange={handleCameraPropertyChange}
              canvasSize={canvasSize}
          />
        </Box>
      </>)}
      <Box
          sx={{
            flexShrink: 0,
            width: {xs: '100%', md: 240},
            height: '80vh',
            maxHeight: '80vh',
            bgcolor: 'background.paper',
            borderLeft: {md: '1px solid #ddd'},
            p: 1,
            overflowY: 'auto',
            position: 'sticky',
            top: 0,
          }}
      >
        {selectedFloor != null && (<Box sx={{mb: 1}}>
          <Typography variant="h6" gutterBottom>
            План этажа #{selectedFloor}
          </Typography>
          <FloorUploader
              onUpload={dataUrl => updateFloorSvg(selectedFloor, dataUrl)}
              resetKey={selectedFloor}
              initialPreview={dataMap[selectedFloor] || null}
          />
        </Box>)}
        {selectedFloor == null && (<Box sx={{mb: 1}}>
          <Typography variant="h6" gutterBottom>
            Выберите этаж
          </Typography>
        </Box>)}
        {selectedFloor != null && (<Box
            sx={{
              pt: 1, display: 'flex', justifyContent: 'center', gap: 1,
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
        </Box>)}
        <CameraWorkspace
            camera={currentCamera}

            zones={zonesMap[selectedFloor] || []}
            onAssignZones={(camId, assignedZones) => {
              setCamerasMap(prev => ({
                ...prev,
                [selectedFloor]: (prev[selectedFloor] || []).map(c => c.id === camId ? {...c, assignedZones} : c)
              }));
            }}
            onPropertyChange={handleCameraPropertyChange}
            maxX={canvasSize - (currentCamera?.size || 0)}
            maxY={canvasSize - (currentCamera?.size || 0)}
            hardwareList={hardwareList}
            onAssignHardware={handleAssignHardware}
        />
        {selectedZone != null && (() => {
          const currentZone = zones.find(z => z.id === selectedZone);
          return currentZone ? (
              <Box mt={2}>
                <ZoneWorkspace
                    zone={currentZone}
                    onUpdatePoint={(zoneId, idx, axis, value) => {
                      handleZonePointDrag(
                          zoneId,
                          idx,
                          axis === 'x'
                              ? value
                              : zonesMap[selectedFloor].find(z => z.id === zoneId).points[idx * 2],
                          axis === 'y'
                              ? value
                              : zonesMap[selectedFloor].find(z => z.id === zoneId).points[idx * 2 + 1]
                      );
                    }}
                    onAddPoint={zoneId => {
                      setZonesMap(prev => ({
                        ...prev,
                        [selectedFloor]: prev[selectedFloor].map(z => {
                          if (z.id !== zoneId) return z;
                          const coords = z.pointsNorm ?? z.points;
                          const isNorm = !!z.pointsNorm;
                          const [x0, y0, x1, y1] = coords;
                          const mx = (x0 + x1) / 2;
                          const my = (y0 + y1) / 2;
                          const newCoords = [x0, y0, mx, my, ...coords.slice(2)];
                          return {
                            ...z,
                            ...(isNorm
                                ? {pointsNorm: newCoords}
                                : {points: newCoords}),
                          };
                        }),
                      }));
                    }}
                    onRemovePoint={zoneId => {
                      setZonesMap(prev => ({
                        ...prev,
                        [selectedFloor]: prev[selectedFloor].map(z => {
                          if (z.id !== zoneId) return z;
                          const coords = z.pointsNorm ?? z.points;
                          const isNorm = !!z.pointsNorm;
                          const newCoords = coords.slice(0, -2);
                          return {
                            ...z,
                            ...(isNorm
                                ? {pointsNorm: newCoords}
                                : {points: newCoords}),
                          };
                        }),
                      }));
                    }}
                />
              </Box>
          ) : null;
        })()}
      </Box>
    </Stack>
  </Container>);
}
