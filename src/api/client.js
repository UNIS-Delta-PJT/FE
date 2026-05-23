import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://unis-delta.p-e.kr',
  timeout: 10000,
});

// 모든 요청에 UUID Bearer 토큰 자동 주입
apiClient.interceptors.request.use((config) => {
  const uuid = localStorage.getItem('delta_uuid');
  if (uuid) {
    config.headers['Authorization'] = `Bearer ${uuid}`;
  }
  return config;
});

export default apiClient;
