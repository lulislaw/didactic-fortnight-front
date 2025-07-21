// src/api/images.js
import api, {baseUrl} from './axiosConfig';

export async function uploadFloorPlan(file) {
  const fd = new FormData();
  fd.append('file', file);

  // axiosConfig уже знает твой IP и базовый URL
  const { data } = await api.post('/images/upload/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  // сервер должен вернуть { url: 'http://.../uploads/...' }

  return data.filename;
}
export function getUploadsFile(filename){
  return `${baseUrl}/uploads/${filename}`
}