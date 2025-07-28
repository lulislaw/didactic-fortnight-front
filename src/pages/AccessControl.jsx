// src/pages/AccessControl.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  getPermissions, createPermission, deletePermission
} from '../api/permissions';
import {
  getRoles, createRole, updateRole, deleteRole
} from '../api/roles';
import {
  getUsers, updateUserRole
} from '../api/users';

export default function AccessControl() {
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);

  const [permDialogOpen, setPermDialogOpen] = useState(false);
  const [newPermName, setNewPermName] = useState('');

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null); // { id, name, permissions: [] }
  const [roleName, setRoleName] = useState('');
  const [rolePerms, setRolePerms] = useState([]);

  // загрузка при старте
  useEffect(() => {
    refreshAll();
  }, []);

  const refreshAll = () => {
    getPermissions().then(setPermissions);
    getRoles().then(setRoles);
    getUsers().then(setUsers);
  };

  // --- Permissions ---
  const handleAddPerm = () => {
    createPermission({ name: newPermName.trim() })
        .then(() => {
          setNewPermName('');
          setPermDialogOpen(false);
          getPermissions().then(setPermissions);
        });
  };

  const handleDeletePerm = (id) => {
    deletePermission(id).then(() =>
        setPermissions(perms => perms.filter(p => p.id !== id))
    );
  };

  // --- Roles ---
  const openNewRole = () => {
    setEditingRole(null);
    setRoleName('');
    setRolePerms([]);
    setRoleDialogOpen(true);
  };

  const openEditRole = (role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRolePerms(role.permissions.map(p => p.id));
    setRoleDialogOpen(true);
  };

  const handleSaveRole = () => {
    const payload = { name: roleName.trim(), permission_ids: rolePerms };
    const req = editingRole
        ? updateRole(editingRole.id, payload)
        : createRole(payload);
    req.then(() => {
      setRoleDialogOpen(false);
      refreshAll();
    });
  };

  const handleDeleteRole = (id) => {
    deleteRole(id).then(() => setRoles(rs => rs.filter(r => r.id !== id)));
  };

  // --- User role assignment ---
  const handleChangeUserRole = (userId, newRoleId) => {
    updateUserRole(userId, newRoleId).then(() => {
      setUsers(us => us.map(u =>
          u.id === userId ? { ...u, role_id: newRoleId } : u
      ));
    });
  };

  return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Управление правами и ролями
        </Typography>

        {/* Permissions */}
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6">Права</Typography>
            <Button variant="contained" onClick={() => setPermDialogOpen(true)}>
              + Добавить право
            </Button>
          </Box>
          <DataGrid
              rows={permissions}
              autoHeight
              columns={[
                { field: 'name', headerName: 'Название', flex: 1 },
                {
                  field: 'actions', headerName: '',
                  width: 80, sortable: false,
                  renderCell: ({ row }) => (
                      <Button color="error" size="small"
                              onClick={() => handleDeletePerm(row.id)}>
                        Удалить
                      </Button>
                  )
                }
              ]}
              getRowId={r => r.id}
              hideFooter
          />
        </Box>

        {/* Roles */}
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6">Роли</Typography>
            <Button variant="contained" onClick={openNewRole}>
              + Создать роль
            </Button>
          </Box>
          <DataGrid
              rows={roles}
              autoHeight
              columns={[
                { field: 'name', headerName: 'Роль', flex: 1 },
                {
                  field: 'permissions', headerName: 'Права',
                  flex: 2,
                  renderCell: ({ row }) => (
                      row.permissions.map(p => (
                          <Chip key={p.id} label={p.name} size="small" sx={{ m: 0.5 }} />
                      ))
                  )
                },
                {
                  field: 'actions', headerName: '',
                  width: 140, sortable: false,
                  renderCell: ({ row }) => (
                      <>
                        <Button size="small" onClick={() => openEditRole(row)}>
                          ✎
                        </Button>
                        <Button color="error" size="small"
                                onClick={() => handleDeleteRole(row.id)}>
                          🗑
                        </Button>
                      </>
                  )
                }
              ]}
              getRowId={r => r.id}
              hideFooter
          />
        </Box>

        {/* Users */}
        <Box>
          <Typography variant="h6" mb={1}>Пользователи</Typography>
          <DataGrid
              rows={users}
              autoHeight
              columns={[
                { field: 'username', headerName: 'Логин', flex: 1 },
                { field: 'full_name', headerName: 'Имя', flex: 1 },
                {
                  field: 'role_id', headerName: 'Роль', flex: 1,
                  renderCell: ({ row }) => (
                      <FormControl fullWidth size="small">
                        <Select
                            value={row.role_id || ''}
                            onChange={e => handleChangeUserRole(row.id, e.target.value)}
                        >
                          <MenuItem value="">—</MenuItem>
                          {roles.map(r => (
                              <MenuItem key={r.id} value={r.id}>
                                {r.name}
                              </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                  )
                }
              ]}
              getRowId={r => r.id}
              hideFooter
          />
        </Box>

        {/* Dialog: новая permission */}
        <Dialog open={permDialogOpen} onClose={() => setPermDialogOpen(false)}>
          <DialogTitle>Добавить право</DialogTitle>
          <DialogContent>
            <TextField
                autoFocus fullWidth
                label="Название"
                value={newPermName}
                onChange={e => setNewPermName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPermDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleAddPerm} disabled={!newPermName.trim()}>
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog: новая/редактируемая роль */}
        <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>{editingRole ? 'Редактировать роль' : 'Создать роль'}</DialogTitle>
          <DialogContent>
            <Box mb={2}>
              <TextField
                  fullWidth label="Название роли"
                  value={roleName}
                  onChange={e => setRoleName(e.target.value)}
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Права</InputLabel>
              <Select
                  multiple
                  value={rolePerms}
                  onChange={e => setRolePerms(e.target.value)}
                  renderValue={selected => selected
                      .map(id => permissions.find(p => p.id === id)?.name)
                      .join(', ')
                  }
              >
                {permissions.map(p => (
                    <MenuItem key={p.id} value={p.id}>
                      <Chip label={p.name} size="small" /> {p.name}
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
      </Container>
  );
}
