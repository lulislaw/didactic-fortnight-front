import api, {baseUrl} from './axiosConfig';

export async function uploadFloorPlan(file) {
  const fd = new FormData();
  fd.append('file', file);

  const { data } = await api.post('/images/upload/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.filename;
}
export function getUploadsFile(filename){
  return `${baseUrl}/uploads/${filename}`
}