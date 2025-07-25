import api from './axiosConfig';

export async function getCameras({skip = 0, limit = 100} = {}) {
  const resp = await api.get('/cameras/', {
    params: {skip, limit},
  });
  return resp.data;
}

export async function getCamera(id) {
  const resp = await api.get(`/cameras/${id}`);
  return resp.data;
}

export async function createCamera(camera) {
  const resp = await api.post('/cameras/', camera);
  return resp.data;
}

export async function deleteCamera(id) {
  await api.delete(`/cameras/${id}`);
}
