import apiClient from './client';

/**
 * 임시 로그인
 * @returns {{ userId, uuid, nickname, characterId }}
 */
export async function tempLogin() {
  const res = await apiClient.post('/auth/temp-login');
  return res.data.data;
}
