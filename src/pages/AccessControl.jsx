// src/pages/AccessControl.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';
import {DataGrid} from '@mui/x-data-grid';
import {
  getPermissions,
  createPermission,
  deletePermission
} from '../api/permissions';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole
} from '../api/roles';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '../api/users';
import PermissionDialog from '../components/accessControl/PermissionDialog.jsx';
import RoleDialog from '../components/accessControl/RoleDialog.jsx';
import UserDialog from '../components/accessControl/UserDialog.jsx';

const PERM_GRID_HEIGHT = 300;
const ROLE_GRID_HEIGHT = 300;
const USER_GRID_HEIGHT = 400;

export default function AccessControl() {
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const [permDialogOpen, setPermDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const refreshAll = useCallback(() => {
    getPermissions().then(setPermissions).catch(handleError);
    getRoles().then(setRoles).catch(handleError);
    getUsers().then(setUsers).catch(handleError);
  }, []);

  useEffect(refreshAll, [refreshAll]);

  const handleError = useCallback((e, fallback) => {
    if (!e.response) {
      console.warn('Network/CORS error:', e.message);
      fallback && fallback();
    } else {
      const {status, data} = e.response;
      setError(data?.detail || `Ошибка ${status}: ${JSON.stringify(data)}`);
    }
  }, []);

  const handleSavePermission = useCallback((data) => {
    createPermission(data)
        .then(() => {
          setPermDialogOpen(false);
          refreshAll();
        })
        .catch(e => handleError(e, () => {
          setPermDialogOpen(false);
          refreshAll();
        }));
  }, [refreshAll, handleError]);

  const handleDeletePermission = useCallback(id => {
    deletePermission(id)
        .then(() => setPermissions(ps => ps.filter(p => p.id !== id)))
        .catch(handleError);
  }, [handleError]);

  const openRoleDialog = useCallback(role => {
    setEditingRole(role || null);
    setRoleDialogOpen(true);
  }, []);

  const handleSaveRole = useCallback((data) => {
    const action = editingRole
        ? updateRole(editingRole.id, data)
        : createRole(data);
    action
        .then(() => {
          setRoleDialogOpen(false);
          refreshAll();
        })
        .catch(e => handleError(e, () => {
          if (e.response) {
            console.error('Server error details:', e.response.data);
            setError(e.response.data.detail || JSON.stringify(e.response.data));
          } else {
            console.warn('Network error:', e.message);
            setError(`Сервер не отвечает: ${e.message}`);
          }
        }));
  }, [editingRole, refreshAll, handleError]);

  const handleDeleteRole = useCallback(id => {
    deleteRole(id)
        .then(() => setRoles(rs => rs.filter(r => r.id !== id)))
        .catch(handleError);
  }, [handleError]);

  const openUserDialog = useCallback(user => {
    setEditingUser(user || null);
    setUserDialogOpen(true);
  }, []);

  const handleSaveUser = useCallback((data) => {
    const action = editingUser
        ? updateUser(editingUser.id, data)
        : createUser(data);
    action
        .then(() => {
          setUserDialogOpen(false);
          refreshAll();
        })
        .catch(e => handleError(e, () => {
          setUserDialogOpen(false);
          refreshAll();
        }));
  }, [editingUser, refreshAll, handleError]);

  const handleDeleteUser = useCallback(id => {
    deleteUser(id)
        .then(() => setUsers(us => us.filter(u => u.id !== id)))
        .catch(handleError);
  }, [handleError]);

  const permColumns = useMemo(() => [
    {field: 'code', headerName: 'Код', flex: 1},
    {field: 'description', headerName: 'Описание', flex: 2},
    {
      field: 'actions',
      headerName: '',
      width: 100,
      sortable: false,
      renderCell: ({row}) => (
          <Button
              color="error"
              size="small"
              onClick={() => handleDeletePermission(row.id)}
          >
            Удалить
          </Button>
      )
    }
  ], [handleDeletePermission]);

  const roleColumns = useMemo(() => [
    {field: 'name', headerName: 'Название', flex: 1},
    {field: 'description', headerName: 'Описание', flex: 2},
    {
      field: 'permissions',
      headerName: 'Права',
      flex: 2,
      renderCell: ({row}) => row.permissions.map(p => (
          <Chip key={p.id} label={p.code} size="small" sx={{m: 0.5}}/>
      ))
    },
    {
      field: 'actions',
      headerName: '',
      width: 160,
      sortable: false,
      renderCell: ({row}) => (
          <>
            <Button size="small" onClick={() => openRoleDialog(row)}>✎</Button>
            <Button
                color="error"
                size="small"
                onClick={() => handleDeleteRole(row.id)}
            >🗑</Button>
          </>
      )
    }
  ], [openRoleDialog, handleDeleteRole]);

  const userColumns = useMemo(() => [
    {field: 'username', headerName: 'Логин', flex: 1},
    {field: 'full_name', headerName: 'Имя', flex: 1},
    {field: 'email', headerName: 'Email', flex: 1},
    {field: 'phone', headerName: 'Телефон', flex: 1},
    {field: 'tg_id', headerName: 'Telegram ID', flex: 1},
    {
      field: 'roles',
      headerName: 'Роли',
      flex: 1,
      sortable: false,
      renderCell: ({row}) => row.roles.map(r => (
          <Chip key={r.id} label={r.name} size="small" sx={{m: 0.5}}/>
      ))
    },
    {
      field: 'actions',
      headerName: '',
      width: 160,
      sortable: false,
      renderCell: ({row}) => (
          <>
            <Button size="small" onClick={() => openUserDialog(row)}>✎</Button>
            <Button
                color="error"
                size="small"
                onClick={() => handleDeleteUser(row.id)}
            >🗑</Button>
          </>
      )
    }
  ], [openUserDialog, handleDeleteUser]);

  return (
      <Container sx={{py: 4}}>
        <Typography variant="h4" gutterBottom>
          Управление правами, ролями и пользователями
        </Typography>

        <Section title="Права" onAdd={() => setPermDialogOpen(true)}>
          <Box sx={{height: PERM_GRID_HEIGHT, width: '100%'}}>
            <DataGrid
                rows={permissions}
                columns={permColumns}
                getRowId={r => r.id}
                hideFooter
            />
          </Box>
        </Section>

        <Section title="Роли" onAdd={() => openRoleDialog(null)}>
          <Box sx={{height: ROLE_GRID_HEIGHT, width: '100%'}}>
            <DataGrid
                rows={roles}
                columns={roleColumns}
                getRowId={r => r.id}
                hideFooter
            />
          </Box>
        </Section>

        <Section title="Пользователи" onAdd={() => openUserDialog(null)}>
          <Box sx={{height: USER_GRID_HEIGHT, width: '100%'}}>
            <DataGrid
                rows={users}
                columns={userColumns}
                getRowId={r => r.id}
                hideFooter
            />
          </Box>
        </Section>

        <PermissionDialog
            open={permDialogOpen}
            onClose={() => setPermDialogOpen(false)}
            onSave={handleSavePermission}
        />

        <RoleDialog
            open={roleDialogOpen}
            onClose={() => setRoleDialogOpen(false)}
            onSave={handleSaveRole}
            permissions={permissions}
            initialData={editingRole}
        />

        <UserDialog
            open={userDialogOpen}
            onClose={() => setUserDialogOpen(false)}
            onSave={handleSaveUser}
            roles={roles}
            initialData={editingUser}
        />

        <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={() => setError('')}
        >
          <Alert
              onClose={() => setError('')}
              severity="error"
              sx={{width: '100%'}}
          >
            {error}
          </Alert>
        </Snackbar>
      </Container>
  );
}

const Section = React.memo(function Section({title, onAdd, children}) {
  return (
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6">{title}</Typography>
          <Button variant="contained" onClick={onAdd}>+ Добавить</Button>
        </Box>
        {children}
      </Box>
  );
});
