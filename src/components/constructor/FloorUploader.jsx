import React, {useRef, useState, useEffect} from 'react';
import {Button, Typography} from '@mui/material';
import PropTypes from 'prop-types';
import {uploadFloorPlan, getUploadsFile} from "@/api/images";


export default function FloorUploader({
                                        onUpload,
                                        resetKey,
                                        initialPreview
                                      }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(initialPreview);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    setPreview(initialPreview);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  }, [resetKey, initialPreview]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const filename = await uploadFloorPlan(file);
      const url = getUploadsFile(filename)
      console.log(url)
      setPreview(url);
      onUpload(url);
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить изображение');
    } finally {
      setLoading(false);
    }
  };

  return (
      <>
        <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            style={{display: 'none'}}
        />
        <Button variant="outlined" onClick={handleClick} fullWidth>
          {preview ? 'Изменить план этажа' : 'Загрузить план этажа'}
        </Button>
        {error && (
            <Typography variant="caption" color="error" sx={{mt: 1}}>
              {error}
            </Typography>
        )}
      </>
  );
}

FloorUploader.propTypes = {
  onUpload: PropTypes.func.isRequired,
  resetKey: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  initialPreview: PropTypes.string,
};
