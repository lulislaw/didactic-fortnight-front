import api from './axiosConfig';


export const exportAppealHistory = async () => {
  const response = await api.get('/export/appeal_history/', {
    responseType: 'blob',
  });
  return response.data; // это уже Blob
};
