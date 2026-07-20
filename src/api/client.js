import axios from 'axios';

// 백엔드: EC2 Spring Boot (http://3.37.62.243:8081) → Cloudflare Tunnel HTTPS
// trycloudflare 주소는 서버 재시작 시 바뀔 수 있으므로 .env(VITE_API_BASE_URL)로 덮어쓸 수 있게 함
const BASE_URL = import.meta.env.VITE_API_BASE_URL
  || 'https://singing-moisture-voters-don.trycloudflare.com';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true, // Refresh Token HttpOnly 쿠키 송수신용
});

// 모든 요청에 Access Token(Bearer) 자동 주입 — 없으면 레거시 게스트 UUID 사용
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('delta_access_token') || localStorage.getItem('delta_uuid');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// 401(INVALID_ACCESS_TOKEN) → Refresh 쿠키로 토큰 재발급 후 1회 재시도
let reissuePromise = null;
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthPath = original?.url?.includes('/api/v1/auth/');
    if (
      error.response?.status === 401 &&
      original && !original._retried && !isAuthPath &&
      localStorage.getItem('delta_access_token')
    ) {
      original._retried = true;
      try {
        // 동시 다발 401에서 재발급 요청은 한 번만
        reissuePromise = reissuePromise || apiClient.post('/api/v1/auth/reissue');
        const res = await reissuePromise;
        reissuePromise = null;
        const newToken = res.data?.data?.accessToken;
        if (newToken) {
          localStorage.setItem('delta_access_token', newToken);
          return apiClient(original);
        }
      } catch {
        reissuePromise = null;
        localStorage.removeItem('delta_access_token'); // Refresh 만료 — 재로그인 필요
      }
    }
    return Promise.reject(error);
  }
);

/** 서버 상태 확인 — "DELTA server is running" 반환 시 정상 */
export async function checkHealth() {
  const res = await apiClient.get('/api/health');
  return res.data;
}

export default apiClient;
