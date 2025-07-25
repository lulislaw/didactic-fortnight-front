// src/pages/AppealsList.jsx
import React, {useState, useEffect, useRef, useMemo} from 'react';
import {Container, Typography, Box} from '@mui/material';
import {fetchAppeals, fetchAppealById} from '../api/appeals';
import FilterBar from '../components/FilterBar.jsx';
import FilterDialog from '../components/FilterDialog.jsx';
import Loader from '../components/Loader';
import ExportButton from '../components/ExportButton';
import AppealsTable from '../components/AppealsTable.jsx';
import FloorPlanViewer from "../components/FloorPlanViewer.jsx";
import HardwareStreams from "../components/HardwareStreams.jsx"
import { getCameras as getHardware } from '@/api/camera_hardware'

const defaultAdvFilters = {
  searchText: '',
  severities: [],
  dateFrom: '',
  dateTo: '',
};

export default function AppealsList() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hardwareList, setHardwareList] = useState([])
  const [selBuilding, setSelBuilding] = useState(null)
  const [selFloor, setSelFloor] = useState(null)
  const [selHardware, setSelHardware] = useState(null);
  const [camerasOnFloor, setCamerasOnFloor] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  // расширенные
  const [advFilters, setAdvFilters] = useState(defaultAdvFilters);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const wsRef = useRef(null);
  useEffect(() => {
    getHardware().then(setHardwareList).catch(console.error)
  }, [])
  // ————— Загрузка данных и WS —————
  useEffect(() => {
    let mounted = true;
    fetchAppeals(0, 100)
        .then(data => mounted && setAppeals(data))
        .catch(() => mounted && setError('Не удалось загрузить список'))
        .finally(() => mounted && setLoading(false));

    const ws = new WebSocket(
        `ws://${import.meta.env.VITE_API_URL.replace(/^https?:\/\//, '')}/ws/appeals`
    );
    wsRef.current = ws;
    ws.onmessage = async ({data}) => {
      const {event_type, id} = JSON.parse(data);
      if (event_type === 'delete') {
        setAppeals(prev => prev.filter(a => a.id !== id));
      } else {
        const fresh = await fetchAppealById(id);
        setAppeals(prev => {
          if (event_type === 'create' && !prev.some(a => a.id === id)) {
            return [fresh, ...prev];
          }
          if (event_type === 'update') {
            return prev.map(a => a.id === id ? fresh : a);
          }
          return prev;
        });
      }
    };
    ws.onerror = () => console.error('WebSocket ошибка');
    ws.onclose = () => console.log('WebSocket закрыт');
    return () => {
      mounted = false;
      ws.close();
    };
  }, []);

  const handleClearAll = () => {
    setSearch('');
    setActiveTab('all');
    setAdvFilters(defaultAdvFilters);
  };

  const effectiveSearch = advFilters.searchText.trim() !== ''
      ? advFilters.searchText
      : search;

  const filteredData = useMemo(() => {
    return appeals
        .filter(a => !advFilters.severities.length || advFilters.severities.includes(a.severity_id))
        .filter(a => {
          if (!effectiveSearch) return true;
          const q = effectiveSearch.toLowerCase();
          return a.location.toLowerCase().includes(q)
              || (a.description || '').toLowerCase().includes(q)
              || String(a.ticket_number || a.id).includes(q);
        })
        .filter(a => {
          const dt = new Date(a.created_at);
          if (advFilters.dateFrom && dt < new Date(advFilters.dateFrom)) return false;
          if (advFilters.dateTo && dt > new Date(advFilters.dateTo)) return false;
          return true;
        });
  }, [
    appeals,
    effectiveSearch,
    advFilters.severities,
    advFilters.dateFrom,
    advFilters.dateTo,
  ]);

  const tabs = useMemo(() => [
    {key: 'all', label: 'Все', count: filteredData.length},
    {key: 1, label: 'Новые', count: filteredData.filter(a => a.status_id === 1).length},
    {key: 2, label: 'Ожидает', count: filteredData.filter(a => a.status_id === 2).length},
    {key: 3, label: 'Закрыто', count: filteredData.filter(a => a.status_id === 3).length},
  ], [filteredData]);

  const displayed = useMemo(() => {
    if (activeTab === 'all') return filteredData;
    return filteredData.filter(a => a.status_id === activeTab);
  }, [filteredData, activeTab]);

  if (loading) return <Loader/>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
      <Container sx={{py: 4, px: 0}}>
        <Typography variant="h4" gutterBottom sx={{px: 2}}>
          Список обращений
        </Typography>

        {/* flex-контейнер: слева — список, справа — план этажа */}
        <Box
            sx={{
              display: 'flex',
              flexDirection: {xs: 'column', md: 'row'},
              height: {md: 'calc(70vh - 100px)'},
            }}
        >
          {/* Левая панель */}
          <Box
              sx={{
                flex: 1,
                px: 2,
                pb: 2,

              }}
          >
            <Box
            sx = {{
              display:'flex',
              flexDirection: {xs:'row'},
              alignItems: 'center',
            }}>
              <Typography variant="subtitle1">
                Показано {displayed.length} из {filteredData.length}
                {displayed.length !== filteredData.length && ' (отфильтровано)'}
              </Typography>
              <Box sx={{my: 2}}>
                <ExportButton/>
              </Box>
            </Box>


            <FilterBar
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onSearch={setSearch}
                onAdvanced={() => setDialogOpen(true)}
                onClear={handleClearAll}
            />

            <FilterDialog
                open={isDialogOpen}
                initialFilters={advFilters}
                onApply={f => {
                  setAdvFilters(f);
                  setDialogOpen(false);
                }}
                onClose={() => setDialogOpen(false)}
            />


            <Box sx={{
              height: '100%',
              overflowY: 'auto',
              overflowX: 'hidden'

            }}>
              <AppealsTable data={displayed}/>
            </Box>

          </Box>

          {/* правая панель */}
          <Box sx={{ flexShrink:0, width:{ xs:'100%', md:600 }, p:2 }}>
            <Typography variant="h6">План этажа</Typography>
            <FloorPlanViewer
                initialBuildingId={selBuilding}
                initialFloorId={selFloor}
                onSelectionChange={(buildingId, floor, cams) => {
                  setSelBuilding(buildingId);
                  setSelFloor(floor);
                  setSelHardware(null);
                  setCamerasOnFloor(cams);
                }}
                onCameraClick={cam => {
                  setSelHardware(cam.hardwareId)
                }}
            />

            <Box mt={2}>
              <Typography variant="h6">Потоки железных камер</Typography>
              <HardwareStreams
                hardwareList={hardwareList}
                camerasOnFloor={camerasOnFloor}
                selectedHardwareId={selHardware}
                onSelectHardware={setSelHardware}
              />
            </Box>
          </Box>
        </Box>
      </Container>
  );
}
