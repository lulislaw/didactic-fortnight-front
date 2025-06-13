import React from 'react';

const AppealHistory = ({ history }) => {
  if (!history || history.length === 0) {
    return <p>История отсутствует.</p>;
  }

  return (
    <div>
      <h2>История изменений</h2>
      {history.map((event) => (
        <div key={event.id} style={styles.event}>
          <p>
            <strong>Время:</strong> {new Date(event.event_time).toLocaleString()}
          </p>
          <p>
            <strong>Тип:</strong> {event.event_type}
          </p>
          {event.payload && (
            <div>
              <strong>Изменённые поля:</strong>
              <pre style={styles.pre}>{JSON.stringify(event.payload, null, 2)}</pre>
            </div>
          )}
          <hr />
        </div>
      ))}
    </div>
  );
};

const styles = {
  event: {
    background: '#fafafa',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
  },
  pre: {
    background: '#f0f0f0',
    color: '#333',
    padding: '8px',
    borderRadius: '4px',
    overflowX: 'auto',
    fontSize: '0.85rem',
  },
};

export default AppealHistory;
