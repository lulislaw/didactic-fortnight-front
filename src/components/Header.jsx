import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

const Header = () => {
  const { pathname } = useLocation();

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Service
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={RouterLink}
            to="/appeals"
            color={pathname === '/appeals' ? 'secondary' : 'inherit'}
            variant={pathname === '/appeals' ? 'outlined' : 'text'}
          >
            Список
          </Button>
          <Button
            component={RouterLink}
            to="/appeals/new"
            color={pathname === '/appeals/new' ? 'secondary' : 'inherit'}
            variant={pathname === '/appeals/new' ? 'outlined' : 'text'}
          >
            Новое обращение
          </Button>
          <Button
            component={RouterLink}
            to="/building"
            color={pathname === '/building' ? 'secondary' : 'inherit'}
            variant={pathname === '/building' ? 'outlined' : 'text'}
          >
            Здания
          </Button>
          <Button
              component={RouterLink}
              to="/cameras"
              color={pathname === '/cameras' ? 'secondary' : 'inherit'}
              variant={pathname === '/cameras' ? 'outlined' : 'text'}
          >
            Камеры
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
