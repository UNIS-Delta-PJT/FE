import apiClient from './client';

/**
 * 코인 패키지 리스트 조회 (GET /api/v1/shop/coins)
 * @returns {{ coinBalance, packages: [{ packageId, coinAmount, bonusCoin, price }] }}
 */
export async function getCoinPackages() {
  const res = await apiClient.get('/api/v1/shop/coins');
  return res.data.data;
}
