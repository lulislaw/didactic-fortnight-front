
import api from './axiosConfig';

// Получить список камер
export async function getCameras({ skip = 0, limit = 100 } = {}) {
  const resp = await api.get('/cameras/', {
    params: { skip, limit },
  });
  return resp.data;
}

// Получить одну камеру по ID
export async function getCamera(id) {
  const resp = await api.get(`/cameras/${id}`);
  return resp.data;
}

// Создать новую камеру
// camera: { name: string, stream_url: string, ptz_enabled?, ptz_protocol?, username?, password? }
export async function createCamera(camera) {
  const resp = await api.post('/cameras/', camera);
  return resp.data;
}

// Удалить камеру по ID
export async function deleteCamera(id) {
  await api.delete(`/cameras/${id}`);
}
