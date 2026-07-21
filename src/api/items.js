import apiClient from './client';

/**
 * 코인 상점 아이템 목록 조회 (GET /api/v1/items/shop)
 * @returns {{ coinBalance, items: [{ itemId, name, price, itemType, isOwned }] }}
 */
export async function getShopItems() {
  const res = await apiClient.get('/api/v1/items/shop');
  return res.data.data;
}

/**
 * 아이템 구매 (POST /api/v1/items/{itemId}/buy)
 * 실패 시 err.response.data.code: INSUFFICIENT_COIN(400) | ITEM_NOT_FOUND(404) | ALREADY_OWNED(409)
 * @returns {{ itemId, itemName, price, coinBalance }}
 */
export async function buyItem(itemId) {
  const res = await apiClient.post(`/api/v1/items/${itemId}/buy`);
  return res.data.data;
}

/**
 * 내 아이템 목록 조회 (GET /api/v1/items/my)
 * @returns {Array<{ itemId, name, itemType, isEquipped }>}
 */
export async function getMyItems() {
  const res = await apiClient.get('/api/v1/items/my');
  return res.data.data?.items ?? [];
}

/**
 * 아이템 착용/벗기 (PATCH /api/v1/items/my/{itemId}/equip)
 * 착용 시 같은 itemType의 기존 장착 아이템은 서버가 자동 해제
 * 실패 시 err.response.data.code: ITEM_NOT_FOUND(404) | USER_ITEM_NOT_FOUND(404)
 */
export async function equipItem(itemId, equip) {
  const res = await apiClient.patch(`/api/v1/items/my/${itemId}/equip`, { equip });
  return res.data.data;
}
