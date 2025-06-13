import api from './axiosConfig';

export const fetchAppealTypes = async () => {
  const res = await api.get('/reference/appeal_types/');
  return res.data;
};

export const fetchSeverityLevels = async () => {
  const res = await api.get('/reference/severity_levels/');
  return res.data;
};

export const fetchAppealStatuses = async () => {
  const res = await api.get('/reference/appeal_statuses/');
  return res.data;
};
