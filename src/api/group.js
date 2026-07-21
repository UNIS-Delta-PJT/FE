import apiClient from './client';

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
