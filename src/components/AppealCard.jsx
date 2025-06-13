import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

const AppealCard = ({ appeal }) => {
  return (
    <Card
      variant="outlined"
      sx={{
        mb: 2,
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <CardContent>
        <Typography variant="h6" component={RouterLink} to={`/appeals/${appeal.id}`} sx={linkStyle}>
          {appeal.description ? appeal.description.substring(0, 50) + '…' : 'Без описания'}
        </Typography>


        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
          <Chip label={`Тип: ${appeal.type_name}`} color="primary" size="small" />
          <Chip label={`Статус: ${appeal.status_name}`} color="secondary" size="small" />
          <Chip label={`Уровень: ${appeal.severity_name}`} size="small" />
        </Stack>


        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Создано: {new Date(appeal.created_at).toLocaleString()}
        </Typography>

        {appeal.is_deleted && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            [Удалено]
          </Typography>
        )}
      </CardContent>

      <CardActions>
        <Button
          component={RouterLink}
          to={`/appeals/${appeal.id}`}
          size="small"
          color="primary"
        >
          Подробнее
        </Button>
      </CardActions>
    </Card>
  );
};

const linkStyle = {
  textDecoration: 'none',
  color: 'inherit',
  '&:hover': {
    textDecoration: 'underline',
  },
};

export default AppealCard;
