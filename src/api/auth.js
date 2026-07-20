import axios from 'axios';
import apiClient from './client';

// ── 카카오 OAuth 설정 (백엔드 가이드 기준) ─────────────────────────
// 클라이언트 시크릿 비활성이라 인가코드 → 카카오 토큰 교환을 프론트에서 직접 수행
const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI
  || `${window.location.origin}/kakao/login`;

/** 카카오 로그인 사용 가능 여부 (REST API 키가 env에 설정됐는지) */
export function isKakaoConfigured() {
  return Boolean(KAKAO_REST_API_KEY);
}

/** 카카오 인가 페이지로 이동 — 완료 시 {redirect_uri}?code=인가코드 로 복귀 */
export function startKakaoLogin() {
  const url = 'https://kauth.kakao.com/oauth/authorize'
    + `?response_type=code&client_id=${KAKAO_REST_API_KEY}`
    + `&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}`;
  window.location.href = url;
}

/** 인가코드 → 카카오 액세스 토큰 교환 (POST kauth.kakao.com/oauth/token) */
async function exchangeKakaoToken(code) {
  const res = await axios.post(
    'https://kauth.kakao.com/oauth/token',
    new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KAKAO_REST_API_KEY,
      redirect_uri: KAKAO_REDIRECT_URI,
      code,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' } }
  );
  return res.data.access_token;
}

/**
 * 카카오 로그인 (POST /api/v1/auth/kakao/login)
 * 성공 시 DELTA Access Token을 저장하고, Refresh Token은 HttpOnly 쿠키로 자동 저장됨
 * @param {string} kakaoAccessToken 카카오 토큰 교환으로 받은 액세스 토큰
 * @returns {{ accessToken, tokenType, expiresIn, isNewUser, userId }}
 */
export async function kakaoLogin(kakaoAccessToken) {
  const res = await apiClient.post('/api/v1/auth/kakao/login', { kakaoAccessToken });
  const data = res.data.data;
  if (data?.accessToken) {
    localStorage.setItem('delta_access_token', data.accessToken);
  }
  return data;
}

/** 인가코드 수신 후 전체 로그인 완료: 카카오 토큰 교환 → DELTA 로그인 */
export async function completeKakaoLogin(code) {
  const kakaoAccessToken = await exchangeKakaoToken(code);
  return kakaoLogin(kakaoAccessToken);
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
