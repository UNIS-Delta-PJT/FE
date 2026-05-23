import apiClient from './client';

/**
 * 월별 소비 내역 조회
 * @param {string} yearMonth - 'YYYY-MM'
 * @returns {Array} API 원본 expense 배열
 */
export async function getExpenses(yearMonth) {
  const res = await apiClient.get('/expenses', { params: { yearMonth } });
  return res.data.data?.expenses ?? [];
}

/**
 * 소비 기록 등록
 * @param {{ categoryId, amount, expenseDate, memo? }} data
 */
export async function createExpense(data) {
  const res = await apiClient.post('/expenses', data);
  return res.data.data;
}

/** 카테고리 이름 → categoryId 매핑 */
export const CATEGORY_ID_MAP = {
  '식비': 1,
  '교통': 2,
  '문화': 3,
  '문화/여가': 3,
  '기타': 4,
};

/**
 * API 응답 형식 → UI 형식 변환
 * expenseDate: 'YYYY-MM-DD' 유지 (캘린더 필터링에 사용)
 */
export function transformExpense(e) {
  return {
    expense_id: e.expenseId,
    place: e.memo || e.categoryName,
    name: e.categoryName,
    expense_date: e.expenseDate, // 'YYYY-MM-DD'
    amount: e.amount,
    memo: e.memo ?? '',
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
