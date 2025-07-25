import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import Header from './components/Header';
import AppRoutes from './routes';
function App() {
  return (
    <BrowserRouter>
      <Header />
      <main style={{ padding: '20px' }}>
        <AppRoutes />
      </main>
    </BrowserRouter>
  );
}

export default App;
