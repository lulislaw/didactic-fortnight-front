import React from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Typography
} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import theme from '../theme';

export default function AppealsTable({data}) {
  const navigate = useNavigate();
  const formatNumber = (num) => String(num).padStart(7, '0');
  const statusMap = {
    new: {label: 'новое', color: theme.palette.primary.main},
    wait: {label: 'ожидает', color: theme.palette.primary.main},
    closed: {label: 'закрыто', color: theme.palette.primary.main},
  };

  return (
      <Table>
        <TableHead>
          <TableRow>
            {['№', 'Статус', 'Дата', 'Локация', 'Описание', 'Критичность'].map(header => (
                <TableCell key={header}>
                  <Typography fontWeight="bold">{header}</Typography>
                </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map((item) => {
            const cfg = statusMap[item.status] || statusMap.new;
            return (
                <TableRow
                    key={item.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      textDecoration: 'none',
                      '&:hover td': {background: 'rgba(0,0,0,0.04)'}
                    }}
                    onClick={() => navigate(`/appeals/${item.id}`)}
                >
                  <TableCell
                      sx={{
                        fontFamily: 'Roboto Mono, monospace',
                        color: theme.palette.secondary.main,
                      }}
                  >
                    {formatNumber(item.ticket_number)}
                  </TableCell>
                  <TableCell>
                    <Chip
                        label={cfg.label}
                        size="small"
                        sx={{bgcolor: cfg.color, color: theme.palette.getContrastText(cfg.color)}}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(item.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.severity_name}</TableCell>
                </TableRow>
            );
          })}
        </TableBody>
      </Table>
  );
}
