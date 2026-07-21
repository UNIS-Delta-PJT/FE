import apiClient from './client';

const GROUPS_CACHE_KEY = 'delta_groups_cache';

/**
 * 초대 코드로 그룹 가입 (POST /api/v1/groups/join) — 로그인 필요
 * @param {string} inviteCode
 * @returns {{ groupId: number }}
 * 실패 시 err.response.data.code: GROUP_LIMIT_EXCEEDED(400) | GROUP_NOT_FOUND(404) | ALREADY_JOINED(409)
 */
export async function joinGroupByInviteCode(inviteCode) {
  const res = await apiClient.post('/api/v1/groups/join', { inviteCode });
  return res.data.data;
}

/**
 * 신규 그룹 생성 (POST /api/v1/groups) — 생성자는 자동으로 멤버가 됨, 최대 4개
 * @returns {{ groupId: number, inviteCode: string }}
 * 실패 시 err.response.data.code: GROUP_LIMIT_EXCEEDED(400)
 */
export async function createGroup() {
  const res = await apiClient.post('/api/v1/groups');
  return res.data.data;
}

/**
 * 내가 속한 그룹 + 구성원 현황 조회 (GET /api/v1/groups)
 * 성공 시 로컬 캐시에도 저장 — 맵 화면처럼 동기적으로 그룹 목록이 필요한 곳에서 loadGroupsCache()로 참조
 * @returns {Array<{ groupId, inviteCode, members: [{ userId, nickname, bodyColor, eyeShape, mapPosition, equippedItems }] }>}
 */
export async function getMyGroups() {
  const res = await apiClient.get('/api/v1/groups');
  const groups = res.data.data?.groups ?? [];
  localStorage.setItem(GROUPS_CACHE_KEY, JSON.stringify(groups));
  return groups;
}

/** 마지막으로 동기화된 그룹 목록 캐시 — getMyGroups()를 호출한 적 없으면 빈 배열 */
export function loadGroupsCache() {
  try {
    const g = JSON.parse(localStorage.getItem(GROUPS_CACHE_KEY) || '[]');
    return Array.isArray(g) ? g : [];
  } catch { return []; }
}

/**
 * 그룹 탈퇴 (DELETE /api/v1/groups/{groupId}/leave)
 * 실패 시 err.response.data.code: GROUP_NOT_FOUND(404) | GROUP_MEMBER_NOT_FOUND(404)
 */
export async function leaveGroup(groupId) {
  const res = await apiClient.delete(`/api/v1/groups/${groupId}/leave`);
  return res.data.data;
}
