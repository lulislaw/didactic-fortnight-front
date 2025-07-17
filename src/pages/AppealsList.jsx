// src/pages/AppealsList.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Container, Typography } from '@mui/material';
import { fetchAppeals, fetchAppealById } from '../api/appeals';
import FilterBar      from '../components/FilterBar.jsx';
import FilterDialog   from '../components/FilterDialog.jsx';
import Loader         from '../components/Loader';
import ExportButton   from '../components/ExportButton';
import AppealsTable   from '../components/AppealsTable.jsx';

const defaultAdvFilters = {
  searchText: '',
  severities: [],
  dateFrom: '',
  dateTo: '',
};

export default function AppealsList() {
  const [appeals, setAppeals]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // базовые фильтры
  const [search, setSearch]           = useState('');
  const [activeTab, setActiveTab]     = useState('all');
  // расширенные
  const [advFilters, setAdvFilters]   = useState(defaultAdvFilters);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const wsRef = useRef(null);

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
    ws.onmessage = async ({ data }) => {
      const { event_type, id } = JSON.parse(data);
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

  // Сброс всех фильтров
  const handleClearAll = () => {
    setSearch('');
    setActiveTab('all');
    setAdvFilters(defaultAdvFilters);
  };

  // Если в расширенном поиске есть текст — он перекрывает обычный
  const effectiveSearch = advFilters.searchText.trim() !== ''
      ? advFilters.searchText
      : search;

  // Основной отфильтрованный массив
  const filteredData = useMemo(() => {
    return appeals
        // по severity из расширенных
        .filter(a => !advFilters.severities.length || advFilters.severities.includes(a.severity_id))
        // строковый поиск (location, description, ticket_number)
        .filter(a => {
          if (!effectiveSearch) return true;
          const q = effectiveSearch.toLowerCase();
          return a.location.toLowerCase().includes(q)
              || (a.description || '').toLowerCase().includes(q)
              || String(a.ticket_number || a.id).includes(q);
        })
        // по диапазону дат
        .filter(a => {
          const dt = new Date(a.created_at);
          if (advFilters.dateFrom && dt < new Date(advFilters.dateFrom)) return false;
          if (advFilters.dateTo   && dt > new Date(advFilters.dateTo))   return false;
          return true;
        });
  }, [
    appeals,
    effectiveSearch,
    advFilters.severities,
    advFilters.dateFrom,
    advFilters.dateTo,
  ]);

  // Таб‑счётчики строим по filteredData
  const tabs = useMemo(() => [
    { key: 'all', label: 'Все',     count: filteredData.length },
    { key: 1,     label: 'Новые',   count: filteredData.filter(a => a.status_id === 1).length },
    { key: 2,     label: 'Ожидает', count: filteredData.filter(a => a.status_id === 2).length },
    { key: 3,     label: 'Закрыто', count: filteredData.filter(a => a.status_id === 3).length },
  ], [filteredData]);

  // Отображаемая часть с учётом активного таба
  const displayed = useMemo(() => {
    if (activeTab === 'all') return filteredData;
    return filteredData.filter(a => a.status_id === activeTab);
  }, [filteredData, activeTab]);

  if (loading) return <Loader />;
  if (error)   return <Typography color="error">{error}</Typography>;

  return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Список обращений</Typography>

        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Показано {displayed.length} из {filteredData.length}
          {displayed.length !== filteredData.length && ' (данные отфильтрованы)'}
        </Typography>

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
            onApply={f => { setAdvFilters(f); setDialogOpen(false); }}
            onClose={() => setDialogOpen(false)}
        />

        <ExportButton />
        <AppealsTable data={displayed} />
      </Container>
  );
}
