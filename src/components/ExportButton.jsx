import React, { useState } from 'react';
import { exportAppealHistory } from '../api/export';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import GetAppIcon from '@mui/icons-material/GetApp';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
const ExportButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {

      const blobData = await exportAppealHistory();

      const blob = new Blob([blobData], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'appeals.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Ошибка при экспорте в Excel:', err);
      setError('Не удалось выгрузить Excel-файл');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center'}}>
      <Tooltip title="Экспорт">
        <span>
          <IconButton
            color="primary"

            onClick={handleExport}
            disabled={loading}
            size="large"
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <GetAppIcon />
            )}
          </IconButton>
        </span>
      </Tooltip>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
          {error}
        </Typography>
      )}
    </div>
  );
};

export default ExportButton;
