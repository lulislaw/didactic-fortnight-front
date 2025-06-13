// frontend/src/pages/AppealCreate.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAppeal } from '../api/appeals';
import { fetchAppealTypes, fetchSeverityLevels, fetchAppealStatuses } from '../api/reference';
import Loader from '../components/Loader';

const AppealCreate = () => {
  const navigate = useNavigate();

  // Справочники
  const [types, setTypes] = useState([]);
  const [severities, setSeverities] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  // Поля формы
  const [typeId, setTypeId] = useState('');
  const [severityId, setSeverityId] = useState('');
  const [statusId, setStatusId] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [reporterId, setReporterId] = useState('');
  const [source, setSource] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [payload, setPayload] = useState('{}');

  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [typesData, severitiesData, statusesData] = await Promise.all([
          fetchAppealTypes(),
          fetchSeverityLevels(),
          fetchAppealStatuses(),
        ]);
        setTypes(typesData);
        setSeverities(severitiesData);
        setStatuses(statusesData);
      } catch (err) {
        console.error('Ошибка загрузки справочников:', err);
        setError('Не удалось загрузить справочники.');
      } finally {
        setLoadingRefs(false);
      }
    };
    loadRefs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!typeId || !severityId || !statusId || !source) {
      setError('Заполните все обязательные поля.');
      return;
    }

    // Парсим payload как JSON
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(payload);
    } catch (err) {
      setError('Поле Payload должно быть валидным JSON.');
      return;
    }

    const dto = {
      type_id: parseInt(typeId, 10),
      severity_id: parseInt(severityId, 10),
      status_id: parseInt(statusId, 10),
      location: location || '',
      description: description || '',
      reporter_id: reporterId || null,
      source,
      assigned_to_id: assignedToId || null,
      payload: parsedPayload,
    };

    try {
      const created = await createAppeal(dto);
      // Перенаправляем на страницу деталей нового обращения
      navigate(`/appeals/${created.id}`);
    } catch (err) {
      console.error('Ошибка при создании обращения:', err);
      setError('Не удалось создать обращение.');
    }
  };

  if (loadingRefs) return <Loader />;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1>Создать новое обращение</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Тип обращения<span style={styles.required}>*</span>:
          <select
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            style={styles.select}
            required
          >
            <option value="">Выберите тип</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          Уровень серьёзности<span style={styles.required}>*</span>:
          <select
            value={severityId}
            onChange={(e) => setSeverityId(e.target.value)}
            style={styles.select}
            required
          >
            <option value="">Выберите уровень</option>
            {severities.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          Статус<span style={styles.required}>*</span>:
          <select
            value={statusId}
            onChange={(e) => setStatusId(e.target.value)}
            style={styles.select}
            required
          >
            <option value="">Выберите статус</option>
            {statuses.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          Локация:
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Описание:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.textarea}
          ></textarea>
        </label>

        <label style={styles.label}>
          Reporter ID (UUID):
          <input
            type="text"
            value={reporterId}
            onChange={(e) => setReporterId(e.target.value)}
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Source<span style={styles.required}>*</span>:
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            style={styles.input}
            required
          />
        </label>

        <label style={styles.label}>
          Assigned To ID (UUID):
          <input
            type="text"
            value={assignedToId}
            onChange={(e) => setAssignedToId(e.target.value)}
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Payload (JSON):
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            style={styles.textarea}
            rows={4}
          ></textarea>
        </label>

        <button type="submit" style={styles.button}>
          Создать
        </button>
      </form>
    </div>
  );
};

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '0.95rem',
    color: '#333',
  },
  required: {
    color: 'red',
    marginLeft: '4px',
  },
  select: {
    marginTop: '5px',
    padding: '8px',
    fontSize: '1rem',
  },
  input: {
    marginTop: '5px',
    padding: '8px',
    fontSize: '1rem',
  },
  textarea: {
    marginTop: '5px',
    padding: '8px',
    fontSize: '1rem',
  },
  button: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#3f51b5',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};

export default AppealCreate;
