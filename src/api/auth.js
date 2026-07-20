import apiClient from './client';

/**
 * 카카오 로그인 (POST /api/v1/auth/kakao/login)
 * 성공 시 Access Token을 저장하고, Refresh Token은 HttpOnly 쿠키로 자동 저장됨
 * @param {string} authorizationCode 카카오 로그인 후 발급받은 일회성 인가 코드
 * @returns {{ accessToken, tokenType, expiresIn, isNewUser, userId }}
 */
export async function kakaoLogin(authorizationCode) {
  const res = await apiClient.post('/api/v1/auth/kakao/login', {
    kakaoAccessToken: authorizationCode, // 명세 Request Body 키 기준
  });
  const data = res.data.data;
  if (data?.accessToken) {
    localStorage.setItem('delta_access_token', data.accessToken);
  }
  return data;
}

/**
 * 토큰 재발급 (POST /api/v1/auth/reissue) — Refresh 쿠키 필요
 * 일반 요청의 401 처리는 client.js 인터셉터가 자동으로 수행
 */
export async function reissue() {
  const res = await apiClient.post('/api/v1/auth/reissue');
  const data = res.data.data;
  if (data?.accessToken) {
    localStorage.setItem('delta_access_token', data.accessToken);
  }
  return data;
}

/** 로그아웃 (POST /api/v1/auth/logout) — 서버 Refresh 폐기 + 로컬 토큰 삭제 */
export async function logout() {
  try {
    await apiClient.post('/api/v1/auth/logout');
  } finally {
    localStorage.removeItem('delta_access_token');
  }
}

/**
 * 게스트 로그인 — 명세서에는 없으나 백엔드 팀 안내 경로 (/auth/guest-login)
 * 카카오 로그인 도입 전 임시 사용
 * @returns {{ userId, uuid, nickname, characterId }}
 */
export async function guestLogin() {
  const res = await apiClient.post('/auth/guest-login');
  const data = res.data.data;
  if (data?.accessToken) {
    localStorage.setItem('delta_access_token', data.accessToken);
  }
  return data;
}

// 기존 호출부 호환용 별칭 — TODO: 전체 guestLogin으로 정리 후 제거
export const tempLogin = guestLogin;
