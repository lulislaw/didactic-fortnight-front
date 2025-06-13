import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={styles.container}>
    <h1>404</h1>
    <p>Страница не найдена.</p>
    <Link to="/appeals" style={styles.link}>
      Вернуться к списку
    </Link>
  </div>
);

const styles = {
  container: {
    textAlign: 'center',
    marginTop: '50px',
  },
  link: {
    color: '#3f51b5',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};

export default NotFound;
