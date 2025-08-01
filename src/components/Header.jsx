// src/components/Header.jsx
import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHasPermission } from '../hooks/useHasPermission';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export default function Header() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  // глобальное право
  const canReadAll        = useHasPermission('read_all');
  // конкретные права
  const canViewAppeals    = useHasPermission('view_appeals');
  const canCreateAppeal   = useHasPermission('create_appeal');
  const canViewBuildings  = useHasPermission('view_buildings');
  const canViewCameras    = useHasPermission('view_cameras');
  const canManageRoles    = useHasPermission('manage_roles');

  // для чтения — либо глобальное read_all, либо своё
  const showAppealsList   = canReadAll || canViewAppeals;
  const showBuildings     = canReadAll || canViewBuildings;
  const showCameras       = canReadAll || canViewCameras;
  // для управления ролями обычно нужен manage_roles
  const showRoles         = canManageRoles;

  return (
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Service
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {user ? (
                <>
                  {showAppealsList && (
                      <Button
                          component={RouterLink}
                          to="/appeals"
                          color={pathname === '/appeals' ? 'secondary' : 'inherit'}
                          variant={pathname === '/appeals' ? 'outlined' : 'text'}
                      >
                        Список
                      </Button>
                  )}

                  {canCreateAppeal && (
                      <Button
                          component={RouterLink}
                          to="/appeals/new"
                          color={pathname === '/appeals/new' ? 'secondary' : 'inherit'}
                          variant={pathname === '/appeals/new' ? 'outlined' : 'text'}
                      >
                        Новое обращение
                      </Button>
                  )}

                  {showBuildings && (
                      <Button
                          component={RouterLink}
                          to="/building"
                          color={pathname === '/building' ? 'secondary' : 'inherit'}
                          variant={pathname === '/building' ? 'outlined' : 'text'}
                      >
                        Здания
                      </Button>
                  )}

                  {showCameras && (
                      <Button
                          component={RouterLink}
                          to="/cameras"
                          color={pathname === '/cameras' ? 'secondary' : 'inherit'}
                          variant={pathname === '/cameras' ? 'outlined' : 'text'}
                      >
                        Камеры
                      </Button>
                  )}

                  {showRoles && (
                      <Button
                          component={RouterLink}
                          to="/control"
                          color={pathname === '/control' ? 'secondary' : 'inherit'}
                          variant={pathname === '/control' ? 'outlined' : 'text'}
                      >
                        Роли
                      </Button>
                  )}

                  <Button onClick={logout} color="inherit">
                    Выйти
                  </Button>
                </>
            ) : (
<>


                <Button
                    component={RouterLink}
                    to="/login"
                    color={pathname === '/login' ? 'secondary' : 'inherit'}
                    variant={pathname === '/login' ? 'outlined' : 'text'}
                >
                  Войти
                </Button>
  <Button
      component={RouterLink}
      to="/register"
      color={pathname === '/register' ? 'secondary' : 'inherit'}
      variant={pathname === '/register' ? 'outlined' : 'text'}
  >
    Регистрация
  </Button>

</>
            )
            }
          </Box>
        </Toolbar>
      </AppBar>
  );
}
