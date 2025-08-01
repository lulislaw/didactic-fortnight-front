// src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import AppRoutes from './routes';

function App() {
  return (
      <BrowserRouter>
        <AuthProvider>
          <Header />
          <main style={{ padding: '20px' }}>
            <AppRoutes />
          </main>
        </AuthProvider>
      </BrowserRouter>
  );
}

export default App;
