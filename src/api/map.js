import apiClient from './client';

/**
 * 주사위 굴리기 실행 및 맵 위치 이동 (POST /api/v1/map/dice)
 * 실패 시 err.response.data.code: DICE_NOT_ENABLED(403) — 금융 퀴즈를 먼저 풀어야 함
 * @returns {{ diceResult, previousPosition, landedPosition, finalPosition,
 *             event: { eventType: 'NORMAL'|'TREASURE'|'BACK'|'RESET'|'FINISH', description, rewardCoin?, coinBalance? } }}
 */
export async function rollDice() {
  const res = await apiClient.post('/api/v1/map/dice');
  return res.data.data;
}
