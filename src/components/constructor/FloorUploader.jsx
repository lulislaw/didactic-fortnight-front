// src/components/constructor/FloorUploader.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Компонент для загрузки плана этажа в виде кнопки.
 *
 * onUpload(dataUrl) — колбэк при выборе нового файла
 * resetKey         — ключ для сброса preview при смене этажа
 * initialPreview   — dataUrl уже загруженного плана (или null)
 */
export default function FloorUploader({
                                        onUpload,
                                        resetKey,
                                        initialPreview
                                      }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(initialPreview);

  // при смене этажа или initialPreview — синхронизируем локальный preview
  useEffect(() => {
    setPreview(initialPreview);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  }, [resetKey, initialPreview]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPreview(dataUrl);
      onUpload(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <Button variant="outlined" onClick={handleClick} fullWidth>
        {preview ? 'Изменить план этажа' : 'Загрузить план этажа'}
      </Button>
    </>
  );
}

FloorUploader.propTypes = {
  onUpload:       PropTypes.func.isRequired,
  resetKey:       PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  initialPreview: PropTypes.string,
};
