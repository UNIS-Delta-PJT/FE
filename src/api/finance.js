import apiClient from './client';

/**
 * 홈 화면 예산 요약 조회 (GET /api/v1/finances/summary)
 * @returns {{ targetMonth, totalExpenseBudget, totalSpent, remainingBudget, usageRate }}
 */
export async function getFinanceSummary() {
  const res = await apiClient.get('/api/v1/finances/summary');
  return res.data.data;
}

/**
 * 이번 달 예산 설정 전체 현황 조회 (GET /api/v1/finances/budget)
 * @returns {{ targetMonth, totalIncome, targetSavings, savingsType, totalExpenseBudget, incomeDetails, expenseBudgets }}
 */
export async function getBudget() {
  const res = await apiClient.get('/api/v1/finances/budget');
  return res.data.data;
}

/**
 * 카테고리별 수입 내역 전체 교체 (PUT /api/v1/finances/income)
 * @param {Array<{ category, amount }>} incomeDetails
 * @returns {{ totalIncome }}
 */
export async function updateIncome(incomeDetails) {
  const res = await apiClient.put('/api/v1/finances/income', { incomeDetails });
  return res.data.data;
}

/**
 * 저축 목표 금액 수정 (PUT /api/v1/finances/savings) — 저축 유형은 서버가 자동 결정
 * @returns {{ targetSavings, savingsType }}
 */
export async function updateSavings(targetSavings) {
  const res = await apiClient.put('/api/v1/finances/savings', { targetSavings });
  return res.data.data;
}

/**
 * 목표 지출 예산 수정 (PUT /api/v1/finances/expense-budget)
 * 카테고리별 합계가 totalExpenseBudget과 일치해야 함 (BUDGET_SUM_MISMATCH 주의)
 * @param {number} totalExpenseBudget
 * @param {Array<{ categoryId, amount }>} expenseBudgets
 */
export async function updateExpenseBudget(totalExpenseBudget, expenseBudgets) {
  const res = await apiClient.put('/api/v1/finances/expense-budget', {
    totalExpenseBudget,
    expenseBudgets,
  });
  return res.data.data;
}

/**
 * 지난달 예산 계획 복사 데이터 조회 (GET /api/v1/finances/expense-budget/copy-last-month)
 * @returns {{ sourceMonth, totalExpenseBudget, expenseBudgets }}
 */
export async function copyLastMonthBudget() {
  const res = await apiClient.get('/api/v1/finances/expense-budget/copy-last-month');
  return res.data.data;
}

const CATEGORIES_CACHE_KEY = 'delta_categories_cache';

// 서버 기본 카테고리 — 서버 미가동 시에만 사용하는 폴백
export const DEFAULT_CATEGORIES = [
  { categoryId: 1, name: '식비', isDefault: true },
  { categoryId: 2, name: '교통', isDefault: true },
  { categoryId: 3, name: '쇼핑', isDefault: true },
  { categoryId: 4, name: '문화', isDefault: true },
];

/**
 * 지출 카테고리 목록 조회 (GET /api/v1/finances/expense-categories)
 * 성공 시 로컬 캐시에도 저장 — 동기적으로 카테고리 목록이 필요한 곳에서 loadCategoriesCache()로 참조
 * @returns {Array<{ categoryId, name, isDefault }>}
 */
export async function getExpenseCategories() {
  const res = await apiClient.get('/api/v1/finances/expense-categories');
  const categories = res.data.data?.categories ?? [];
  localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(categories));
  return categories;
}

/** 마지막으로 동기화된 카테고리 목록 캐시 — 없으면 기본 4종 */
export function loadCategoriesCache() {
  try {
    const c = JSON.parse(localStorage.getItem(CATEGORIES_CACHE_KEY) || 'null');
    return Array.isArray(c) && c.length ? c : DEFAULT_CATEGORIES;
  } catch { return DEFAULT_CATEGORIES; }
}

/** 커스텀 지출 카테고리 추가 (POST /api/v1/finances/expense-categories) */
export async function addExpenseCategory(name) {
  const res = await apiClient.post('/api/v1/finances/expense-categories', { name });
  return res.data.data;
}

/** 커스텀 지출 카테고리 삭제 (DELETE /api/v1/finances/expense-categories/{categoryId}) */
export async function deleteExpenseCategory(categoryId) {
  const res = await apiClient.delete(`/api/v1/finances/expense-categories/${categoryId}`);
  return res.data.data;
}
