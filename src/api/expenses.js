import apiClient from './client';

/**
 * 소비 일괄 등록 (POST /api/v1/finances/expenses) — 여러 건을 한 번에 저장
 * @param {Array<{ amount, placeName, categoryId, expenseDate, memo? }>} expenses
 *   expenseDate: 'YYYY-MM-DDTHH:mm:ss'
 * @returns {{ savedCount, isFirstRecordOfDay, dailyTotalExpense }}
 */
export async function createExpenses(expenses) {
  const res = await apiClient.post('/api/v1/finances/expenses', { expenses });
  return res.data.data;
}

/**
 * 특정 날짜 소비 내역 및 총 지출액 조회 (GET /api/v1/finances/expenses/daily)
 * @param {string} date 'YYYY-MM-DD'
 * @returns {{ date, dailyTotalExpense, expenses: Array }}
 */
export async function getDailyExpenses(date) {
  const res = await apiClient.get('/api/v1/finances/expenses/daily', { params: { date } });
  return res.data.data;
}

/**
 * 카테고리 이름 → categoryId 매핑 (서버 기본 카테고리: 1 식비, 2 교통, 3 쇼핑, 4 문화)
 * 커스텀 카테고리는 여기 없으므로 getExpenseCategories()로 조회한 실제 목록을 함께 사용해야 함
 */
export const CATEGORY_ID_MAP = {
  '식비': 1,
  '교통': 2,
  '쇼핑': 3,
  '문화': 4,
};

/**
 * API 응답 형식 → UI 형식 변환
 * expense_date: 'YYYY-MM-DD' 유지 (캘린더 필터링에 사용)
 */
export function transformExpense(e) {
  return {
    expense_id: e.expenseId,
    place: e.placeName || e.memo || e.categoryName,
    name: e.categoryName,
    expense_date: (e.expenseDate || '').slice(0, 10), // 'YYYY-MM-DD'
    amount: e.amount,
    memo: e.memo ?? '',
    // 시각 정보가 있으면 정렬용으로 보존
    saved_at: e.expenseDate && e.expenseDate.length > 10 ? e.expenseDate : undefined,
  };
}

/** 오늘 날짜 문자열 (YYYY-MM-DD) */
export function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 현재 연-월 문자열 (YYYY-MM) */
export function currentYearMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Date 객체 → 'YYYY-MM-DD' 문자열 */
export function toDateString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Date 객체 → 'YYYY-MM-DDTHH:mm:ss' 문자열 (명세 expenseDate 형식) */
export function toDateTimeString(date) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
}
