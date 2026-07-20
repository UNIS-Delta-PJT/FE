import apiClient from './client';

export const MISSION_TYPES = {
  ATTENDANCE: 'ATTENDANCE',
  EXPENSE_RECORD: 'EXPENSE_RECORD',
  DICE: 'DICE',
};

/**
 * 출석체크 현황 조회 (GET /api/v1/missions/attendance)
 * @returns {{ continuousAttendance, attendances: [{ date, isAttended }] }}
 */
export async function getAttendance(startDate, endDate) {
  const res = await apiClient.get('/api/v1/missions/attendance', {
    params: { startDate, endDate },
  });
  return res.data.data;
}

/**
 * 오늘의 출석체크 기록 (POST /api/v1/missions/attendance)
 * 이미 출석한 경우 409(ALREADY_ATTENDED) — 호출부에서 정상 흐름으로 처리
 * @returns {{ continuousAttendance, targetDate }}
 */
export async function checkAttendance() {
  const res = await apiClient.post('/api/v1/missions/attendance');
  return res.data.data;
}

/**
 * 오늘의 미션 달성/리워드 상태 조회 (GET /api/v1/missions/daily)
 * @returns {Array<{ missionType, isDone, isRewarded }>}
 */
export async function getDailyMissions() {
  const res = await apiClient.get('/api/v1/missions/daily');
  return res.data.data?.missions ?? [];
}

/**
 * 달성 미션 리워드(1코인) 받기 (POST /api/v1/missions/daily/{missionType}/reward)
 * @returns {{ missionType, rewardCoin, coinBalance }}
 */
export async function claimMissionReward(missionType) {
  const res = await apiClient.post(`/api/v1/missions/daily/${missionType}/reward`);
  return res.data.data;
}
