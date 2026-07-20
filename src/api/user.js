import apiClient from './client';

// ── FE 캐릭터 값 ↔ 서버 Enum 매핑 ──────────────────────────────────
// 온보딩 팔레트 순서 = 명세 bodyColor Enum 순서
export const BODY_COLOR_TO_ENUM = {
  '#FFFFFF': 'WHITE',
  '#FFD1DC': 'PINK',
  '#E0C3FC': 'PURPLE',
  '#CAF0F8': 'SKYBLUE',
  '#FFECD2': 'YELLOW',
  '#AAF0D1': 'GREEN',
  '#FBC4AB': 'ORANGE',
  '#98F5E1': 'MINT',
};
export const ENUM_TO_BODY_COLOR = Object.fromEntries(
  Object.entries(BODY_COLOR_TO_ENUM).map(([hex, name]) => [name, hex])
);

export const EYE_SHAPE_TO_ENUM = {
  round: 'DEFAULT',
  mixed: 'HAPPY',
  wink: 'WINK',
  closed: 'SMILE',
  cross: 'DEAD',
  heart: 'HEART',
};
export const ENUM_TO_EYE_SHAPE = Object.fromEntries(
  Object.entries(EYE_SHAPE_TO_ENUM).map(([id, name]) => [name, id])
);

/**
 * 내 정보 조회 (GET /api/v1/users/me)
 * @returns {{ userId, coinBalance, continuousAttendance, mapPosition, character, notification, equippedItems }}
 */
export async function getMe() {
  const res = await apiClient.get('/api/v1/users/me');
  return res.data.data;
}

/**
 * 캐릭터 설정 (PATCH /api/v1/users/character)
 * FE 값(hex 색상, 눈 id)을 서버 Enum으로 변환해 전송 — 모든 필드 선택
 */
export async function updateCharacter({ nickname, color, eyes } = {}) {
  const body = {};
  if (nickname !== undefined) body.nickname = nickname;
  if (color !== undefined) body.bodyColor = BODY_COLOR_TO_ENUM[color] ?? 'WHITE';
  if (eyes !== undefined) body.eyeShape = EYE_SHAPE_TO_ENUM[eyes] ?? 'DEFAULT';
  const res = await apiClient.patch('/api/v1/users/character', body);
  return res.data.data;
}

/** 알림 설정 변경 (PATCH /api/v1/users/notifications) — 두 필드 모두 필수 */
export async function updateNotifications({ isPushEnabled, isNightPushDisabled }) {
  const res = await apiClient.patch('/api/v1/users/notifications', {
    isPushEnabled,
    isNightPushDisabled,
  });
  return res.data.data;
}
