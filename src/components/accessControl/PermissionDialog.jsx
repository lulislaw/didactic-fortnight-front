import React, {useEffect} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box
} from '@mui/material';
import {useForm, Controller} from 'react-hook-form';

export default React.memo(function PermissionDialog({
                                                      open,
                                                      onClose,
                                                      onSave,
                                                      initialData = {}
                                                    }) {
  const defaultValues = {
    code: '',
    description: '',
    ...initialData
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: {isDirty, isValid}
  } = useForm({
    defaultValues,
    mode: 'onChange',
    reValidateMode: 'onChange'
  });

  useEffect(() => {
    if (open) reset(defaultValues);
  }, [open, reset]);

  const onSubmit = data => onSave(data);

  return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {initialData.id ? 'Редактировать право' : 'Добавить право'}
        </DialogTitle>

        <DialogContent>
          <Box
              component="form"
              id="perm-form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{mt: 1}}
          >
            <Controller
                name="code"
                control={control}
                rules={{required: 'Код обязателен'}}
                render={({field, fieldState: {error}}) => (
                    <TextField
                        {...field}
                        fullWidth
                        label="Код"
                        size="small"
                        variant="outlined"
                        margin="normal"
                        error={!!error}
                        helperText={error?.message}
                    />
                )}
            />

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
                        margin="normal"
                    />
                )}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button
              type="submit"
              form="perm-form"
              variant="contained"
              disabled={!isDirty || !isValid}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
  );
});
