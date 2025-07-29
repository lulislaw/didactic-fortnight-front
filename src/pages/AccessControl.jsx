import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Snackbar,
  Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
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

export default function AccessControl() {
  // --- State ---
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  // Permissions dialog
  const [permDialogOpen, setPermDialogOpen] = useState(false);
  const [newPermName, setNewPermName] = useState('');
  const [newPermDescription, setNewPermDescription] = useState('');

  // Roles dialog
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [rolePerms, setRolePerms] = useState([]);

  // Users dialog
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userData, setUserData] = useState({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    tg_id: '',
    password: '',
    role_ids: []
  });

  useEffect(() => {
    refreshAll();
  }, []);

  const refreshAll = () => {
    getPermissions().then(setPermissions).catch(e => handleCatch(e));
    getRoles().then(setRoles).catch(e => handleCatch(e));
    getUsers().then(setUsers).catch(e => handleCatch(e));
  };

  // catch helper: show real errors and optionally run fallback on network errors
  const handleCatch = (e, onNetworkFallback) => {
    if (!e.response) {
      // Network or CORS error
      console.warn('Network/CORS error:', e.message);
      if (onNetworkFallback) onNetworkFallback();
    } else {
      const { status, data } = e.response;
      if (data?.detail) {
        setError(data.detail);
      } else {
        const body = typeof data === 'string' ? data : JSON.stringify(data);
        setError(`Ошибка ${status}: ${body}`);
      }
    }
  };

  // --- Permissions handlers ---
  const handleAddPerm = () => {
    createPermission({ code: newPermName.trim(), description: newPermDescription.trim() })
        .then(() => {
          setNewPermName('');
          setNewPermDescription('');
          setPermDialogOpen(false);
          refreshAll();
        })
        .catch(e =>
            handleCatch(e, () => {
              setPermDialogOpen(false);
              refreshAll();
            })
        );
  };

  const handleDeletePerm = (id) => {
    deletePermission(id)
        .then(() => setPermissions(ps => ps.filter(p => p.id !== id)))
        .catch(e => handleCatch(e));
  };

  // --- Roles handlers ---
  const openRoleDialog = (role = null) => {
    if (role) {
      setEditingRole(role);
      setRoleName(role.name);
      setRoleDescription(role.description || '');
      setRolePerms(role.permissions.map(p => p.id));
    } else {
      setEditingRole(null);
      setRoleName('');
      setRoleDescription('');
      setRolePerms([]);
    }
    setRoleDialogOpen(true);
  };

  const handleSaveRole = () => {
    const payload = {
      name: roleName.trim(),
      description: roleDescription.trim(),
      permission_ids: rolePerms
    };
    const action = editingRole
        ? updateRole(editingRole.id, payload)
        : createRole(payload);

    action
        .then(() => {
          setRoleDialogOpen(false);
          refreshAll();
        })
        .catch(e =>
            handleCatch(e, () => {
              setRoleDialogOpen(false);
              refreshAll();
            })
        );
  };

  const handleDeleteRole = (id) => {
    deleteRole(id)
        .then(() => setRoles(rs => rs.filter(r => r.id !== id)))
        .catch(e => handleCatch(e));
  };

  // --- Users handlers ---
  const openUserDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserData({
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || '',
        tg_id: user.tg_id || '',
        password: '',
        role_ids: [user.role_id].filter(Boolean)
      });
    } else {
      setEditingUser(null);
      setUserData({
        username: '',
        full_name: '',
        email: '',
        phone: '',
        tg_id: '',
        password: '',
        role_ids: []
      });
    }
    setUserDialogOpen(true);
  };

  const handleSaveUser = () => {
    const payload = { ...userData };
    const action = editingUser
        ? updateUser(editingUser.id, payload)
        : createUser(payload);

    action
        .then(() => {
          setUserDialogOpen(false);
          refreshAll();
        })
        .catch(e =>
            handleCatch(e, () => {
              setUserDialogOpen(false);
              refreshAll();
            })
        );
  };

  const handleDeleteUser = (id) => {
    deleteUser(id)
        .then(() => setUsers(us => us.filter(u => u.id !== id)))
        .catch(e => handleCatch(e));
  };

  return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Управление правами, ролями и пользователями
        </Typography>

        <Section title="Права" onAdd={() => setPermDialogOpen(true)}>
          <DataGrid
              rows={permissions}
              autoHeight
              hideFooter
              getRowId={r => r.id}
              columns={[
                { field: 'code', headerName: 'Код', flex: 1 },
                { field: 'description', headerName: 'Описание', flex: 2 },
                {
                  field: 'actions',
                  headerName: '',
                  width: 100,
                  sortable: false,
                  renderCell: ({ row }) => (
                      <Button
                          color="error"
                          size="small"
                          onClick={() => handleDeletePerm(row.id)}
                      >
                        Удалить
                      </Button>
                  )
                }
              ]}
          />
        </Section>

        <Section title="Роли" onAdd={() => openRoleDialog()}>
          <DataGrid
              rows={roles}
              autoHeight
              hideFooter
              getRowId={r => r.id}
              columns={[
                { field: 'name', headerName: 'Название', flex: 1 },
                { field: 'description', headerName: 'Описание', flex: 2 },
                {
                  field: 'permissions',
                  headerName: 'Права',
                  flex: 2,
                  renderCell: ({ row }) =>
                      row.permissions.map(p => (
                          <Chip
                              key={p.id}
                              label={p.code}
                              size="small"
                              sx={{ m: 0.5 }}
                          />
                      ))
                },
                {
                  field: 'actions',
                  headerName: '',
                  width: 140,
                  sortable: false,
                  renderCell: ({ row }) => (
                      <>
                        <Button size="small" onClick={() => openRoleDialog(row)}>
                          ✎
                        </Button>
                        <Button
                            color="error"
                            size="small"
                            onClick={() => handleDeleteRole(row.id)}
                        >
                          🗑
                        </Button>
                      </>
                  )
                }
              ]}
          />
        </Section>

        <Section title="Пользователи" onAdd={() => openUserDialog()}>
          <DataGrid
              rows={users}
              autoHeight
              hideFooter
              getRowId={r => r.id}
              columns={[
                { field: 'username', headerName: 'Логин', flex: 1 },
                { field: 'full_name', headerName: 'Имя', flex: 1 },
                { field: 'email', headerName: 'Email', flex: 1 },
                { field: 'phone', headerName: 'Телефон', flex: 1 },
                { field: 'tg_id', headerName: 'Telegram ID', flex: 1 },
                {
                  field: 'role_id',
                  headerName: 'Роль',
                  flex: 1,
                  renderCell: ({ row }) =>
                      roles.find(r => r.id === row.role_id)?.name || '—'
                },
                {
                  field: 'actions',
                  headerName: '',
                  width: 160,
                  sortable: false,
                  renderCell: ({ row }) => (
                      <>
                        <Button
                            size="small"
                            onClick={() => openUserDialog(row)}
                        >
                          ✎
                        </Button>
                        <Button
                            color="error"
                            size="small"
                            onClick={() => handleDeleteUser(row.id)}
                        >
                          🗑
                        </Button>
                      </>
                  )
                }
              ]}
          />
        </Section>

        {/* Permission Dialog */}
        <Dialog
            open={permDialogOpen}
            onClose={() => setPermDialogOpen(false)}
        >
          <DialogTitle>Добавить право</DialogTitle>
          <DialogContent>
            <TextField
                fullWidth
                label="Код"
                value={newPermName}
                onChange={e => setNewPermName(e.target.value)}
                sx={{ mb: 2 }}
            />
            <TextField
                fullWidth
                label="Описание"
                multiline
                minRows={2}
                value={newPermDescription}
                onChange={e => setNewPermDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPermDialogOpen(false)}>Отмена</Button>
            <Button
                onClick={handleAddPerm}
                disabled={!newPermName.trim()}
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>

        {/* Role Dialog */}
        <Dialog
            open={roleDialogOpen}
            onClose={() => setRoleDialogOpen(false)}
            fullWidth
            maxWidth="sm"
        >
          <DialogTitle>
            {editingRole ? 'Редактировать роль' : 'Создать роль'}
          </DialogTitle>
          <DialogContent>
            <TextField
                fullWidth
                label="Название"
                value={roleName}
                onChange={e => setRoleName(e.target.value)}
                sx={{ mb: 2 }}
            />
            <TextField
                fullWidth
                label="Описание"
                multiline
                minRows={2}
                value={roleDescription}
                onChange={e => setRoleDescription(e.target.value)}
                sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Права</InputLabel>
              <Select
                  multiple
                  value={rolePerms}
                  onChange={e => setRolePerms(e.target.value)}
                  renderValue={sel =>
                      sel.map(id => permissions.find(p => p.id === id)?.code).join(', ')
                  }
              >
                {permissions.map(p => (
                    <MenuItem key={p.id} value={p.id}>
                      <Chip
                          label={p.code}
                          size="small"
                          sx={{ mr: 1 }}
                      />
                      {p.description}
                    </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRoleDialogOpen(false)}>Отмена</Button>
            <Button
                onClick={handleSaveRole}
                disabled={!roleName.trim()}
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>

        {/* User Dialog */}
        <Dialog
            open={userDialogOpen}
            onClose={() => setUserDialogOpen(false)}
            fullWidth
            maxWidth="sm"
        >
          <DialogTitle>
            {editingUser ? 'Редактировать пользователя' : 'Создать пользователя'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              {['username', 'full_name', 'email', 'phone', 'tg_id', 'password'].map(field => (
                  <Grid item xs={12} key={field}>
                    <TextField
                        fullWidth
                        label={
                          field === 'full_name'
                              ? 'Полное имя'
                              : field === 'tg_id'
                                  ? 'Telegram ID'
                                  : field.charAt(0).toUpperCase() + field.slice(1)
                        }
                        type={field === 'password' ? 'password' : 'text'}
                        value={userData[field]}
                        onChange={e =>
                            setUserData(d => ({ ...d, [field]: e.target.value }))
                        }
                    />
                  </Grid>
              ))}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Роль</InputLabel>
                  <Select
                      value={userData.role_ids[0] || ''}
                      onChange={e =>
                          setUserData(d => ({
                            ...d,
                            role_ids: e.target.value ? [e.target.value] : []
                          }))
                      }
                  >
                    <MenuItem value="">—</MenuItem>
                    {roles.map(r => (
                        <MenuItem key={r.id} value={r.id}>
                          {r.name}
                        </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUserDialogOpen(false)}>Отмена</Button>
            <Button
                onClick={handleSaveUser}
                disabled={!userData.username.trim()}
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>

        {/* Error Snackbar */}
        <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={() => setError('')}
        >
          <Alert
              onClose={() => setError('')}
              severity="error"
              sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Container>
  );
}

function Section({ title, onAdd, children }) {
  return (
      <Box mb={4}>
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
        >
          <Typography variant="h6">{title}</Typography>
          <Button variant="contained" onClick={onAdd}>
            + Добавить
          </Button>
        </Box>
        {children}
      </Box>
  );
}
