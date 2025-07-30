// src/components/RoleDialog.jsx
import React, {useEffect} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Chip
} from '@mui/material';
import {useForm, Controller} from 'react-hook-form';

export default React.memo(function RoleDialog({
                                                open,
                                                onClose,
                                                onSave,
                                                permissions,
                                                initialData = {}
                                              }) {
  const data = initialData || {}
  const defaultValues = {
    name: '',
    description: '',
    permission_ids: [],
    ...initialData
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: {isDirty, errors}
  } = useForm({defaultValues});

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, reset]);

  const onSubmit = data => {
    onSave(data);
  };

  return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {data.id ? 'Редактировать роль' : 'Создать роль'}
        </DialogTitle>

        <DialogContent>
          <Box
              component="form"
              id="role-form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{mt: 1}}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                    name="name"
                    control={control}
                    rules={{required: 'Название обязательно'}}
                    render={({field}) => (
                        <TextField
                            {...field}
                            fullWidth
                            label="Название"
                            size="small"
                            variant="outlined"
                            error={!!errors.name}
                            helperText={errors.name?.message}
                        />
                    )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                    name="description"
                    control={control}
                    render={({field}) => (
                        <TextField
                            {...field}
                            fullWidth
                            label="Описание"
                            multiline
                            minRows={2}
                            size="small"
                            variant="outlined"
                        />
                    )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                    name="permission_ids"
                    control={control}
                    rules={{
                      validate: v => (v.length > 0) || 'Нужно выбрать хотя бы одно право'
                    }}
                    render={({field}) => (
                        <FormControl fullWidth size="small">
                          <InputLabel id="perm-select-label">Права</InputLabel>
                          <Select
                              labelId="perm-select-label"
                              multiple
                              value={field.value}
                              label="Права"
                              onChange={e => field.onChange(e.target.value)}
                              renderValue={selected => (
                                  <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                    {selected.map(id => {
                                      const p = permissions.find(x => x.id === id);
                                      return <Chip key={id} label={p?.code} size="small"/>;
                                    })}
                                  </Box>
                              )}
                              error={!!errors.permission_ids}
                          >
                            {permissions.map(p => (
                                <MenuItem key={p.id} value={p.id}>
                                  {p.code} — {p.description}
                                </MenuItem>
                            ))}
                          </Select>
                          {errors.permission_ids && (
                              <Box sx={{color: 'error.main', mt: 0.5, fontSize: '0.75rem'}}>
                                {errors.permission_ids.message}
                              </Box>
                          )}
                        </FormControl>
                    )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button
              type="submit"
              form="role-form"
              variant="contained"
              disabled={!isDirty || !!errors.name || !!errors.permission_ids}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
  );
});
