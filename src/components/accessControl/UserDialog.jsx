// src/components/UserDialog.jsx
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
  Box
} from '@mui/material';
import {useForm, Controller} from 'react-hook-form';

export default React.memo(function UserDialog({
                                                open,
                                                onClose,
                                                onSave,
                                                roles,
                                                initialData = {}
                                              }) {

  const data = initialData || {}
  const defaultValues = {
    username: '',
    full_name: '',
    email: '',
    phone: '',
    tg_id: '',
    password: '',
    role_ids: [],
    ...initialData
  };
  const {
    control,
    handleSubmit,
    reset,
    formState: {isDirty, isValid}
  } = useForm({
    defaultValues,
    mode: 'onChange',      // валидация при изменении поля
    reValidateMode: 'onChange'
  });
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
          {data.id ? 'Редактировать пользователя' : 'Создать пользователя'}
        </DialogTitle>

        <DialogContent>
          <Box
              component="form"
              id="user-form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{mt: 1}}
          >
            <Grid container spacing={2}>
              {[
                {
                  key: 'username',
                  label: 'Логин',
                  type: 'text',
                  rules: {required: 'Логин обязателен'}
                },
                {
                  key: 'email',
                  label: 'Email',
                  type: 'email',
                  rules: {
                    required: 'Email обязателен',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Неверный формат email'
                    }
                  }
                },
                {
                  key: 'phone',
                  label: 'Телефон',
                  type: 'tel',
                  rules: {
                    required: 'Телефон обязателен',
                    // простой пример проверки: цифры и опционально +, -, пробел
                    pattern: {
                      value: /^[\d+\-\s()]{5,20}$/,
                      message: 'Неверный формат телефона'
                    }
                  }
                },
                {
                  key: 'password',
                  label: 'Пароль',
                  type: 'password',
                  rules: {}
                },
                {key: 'full_name', label: 'Полное имя', type: 'text', rules: {}},
                {key: 'tg_id', label: 'Telegram ID', type: 'text', rules: {}}
              ].map(({key, label, type, rules}) => (
                  <Grid item xs={12} key={key}>
                    <Controller
                        name={key}
                        control={control}
                        rules={rules}
                        render={({field, fieldState: {error}}) => (
                            <TextField
                                {...field}
                                fullWidth
                                label={label}
                                type={type}
                                size="small"
                                variant="outlined"
                                error={!!error}
                                helperText={error?.message}
                            />
                        )}
                    />
                  </Grid>
              ))}

              <Grid item xs={12}>
                <Controller
                    name="role_ids"
                    control={control}
                    render={({field}) => (
                        <FormControl fullWidth size="small">
                          <InputLabel id="role-select-label">Роль</InputLabel>
                          <Select
                              labelId="role-select-label"
                              value={field.value[0] || ''}
                              label="Роль"
                              onChange={e =>
                                  field.onChange(e.target.value ? [e.target.value] : [])
                              }
                          >
                            <MenuItem value="">
                              <em>—</em>
                            </MenuItem>
                            {roles.map(r => (
                                <MenuItem key={r.id} value={r.id}>
                                  {r.name}
                                </MenuItem>
                            ))}
                          </Select>
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
              form="user-form"
              variant="contained"
              disabled={!isDirty || !isValid}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
  );
});
