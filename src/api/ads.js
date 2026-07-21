import apiClient from './client';

export const AD_REWARD_TYPES = {
  EXPENSE_RECORD: 'EXPENSE_RECORD',
  FINANCE_QUIZ: 'FINANCE_QUIZ',
};

/**
 * 광고 시청 후 코인 2배 받기 (POST /api/v1/ads/reward)
 * 실패: 409(ALREADY_REWARDED) — 해당 활동은 이미 광고 보상을 수령함
 * @param {string} rewardType 'EXPENSE_RECORD' | 'FINANCE_QUIZ'
 * @param {string} adId 시청한 광고 단위 식별자
 * @returns {{ bonusCoin, coinBalance }}
 */
export async function claimAdReward(rewardType, adId) {
  const res = await apiClient.post('/api/v1/ads/reward', { rewardType, adId });
  return res.data.data;
}
