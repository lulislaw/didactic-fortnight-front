import React, { useEffect, useState, useRef } from 'react';
import { fetchAppeals } from '../api/appeals';

import AppealCard from '../components/AppealCard';
import Loader from '../components/Loader';
import ExportButton from '../components/ExportButton.jsx';

const AppealsList = () => {
  const [appeals, setAppeals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const wsRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadAppeals = async () => {
      try {

        const data = await fetchAppeals(0, 50);

        if (isMounted) {
          setAppeals(data);
        }
      } catch (err) {
        console.error('Ошибка загрузки списка:', err);
        if (isMounted) {
          setError('Не удалось загрузить список обращений');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAppeals();

    const ws = new WebSocket('ws://' + import.meta.env.VITE_API_URL + '/ws/appeals');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket открыт');
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { event_type, appeal } = payload;

        setAppeals((prev) => {
          switch (event_type) {
            case 'create':
              if (prev.find((item) => item.id === appeal.id)) {
                return prev;
              }
              return [appeal, ...prev];

            case 'update':
              return prev.map((item) =>
                item.id === appeal.id ? { ...item, ...appeal } : item
              );

            case 'delete':
              return prev.filter((item) => item.id !== appeal.id);

            default:
              return prev;
          }
        });
      } catch (err) {
        console.error('Не удалось распарсить WebSocket сообщение:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket ошибка:', err);
    };

    ws.onclose = (event) => {
      console.log('WebSocket закрылся:', event.code, event.reason);
    };

    return () => {
      isMounted = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  if (loading) return <Loader/>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Список обращений</h1>
           <ExportButton/>

      <div style={{ marginTop: '20px' }}>
        {appeals.map((appeal) => (
          <AppealCard key={appeal.id} appeal={appeal}/>
        ))}
      </div>
    </div>
  );
};

export default AppealsList;
