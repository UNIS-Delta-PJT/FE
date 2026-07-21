import apiClient from './client';

/**
 * 주간 리포트 조회 (GET /api/v1/reports/weekly)
 * @param {string} date 조회할 주에 속하는 임의의 날짜 'YYYY-MM-DD'
 * @returns {{ weekStartDate, weekEndDate, dailyExpenses, weeklyTotalExpense, maxExpenseDay,
 *             lastWeekComparison, topCategory, peerRanking, categoryExpenses }}
 */
export async function getWeeklyReport(date) {
  const res = await apiClient.get('/api/v1/reports/weekly', { params: { date } });
  return res.data.data;
}

/**
 * 월간 리포트 조회 (GET /api/v1/reports/monthly)
 * @param {string} month 'YYYY-MM'
 * @returns {{ targetMonth, totalExpenseBudget, totalSpent, remainingBudget, usageRate,
 *             topCategories, topExpenses, lastMonthComparison }}
 */
export async function getMonthlyReport(month) {
  const res = await apiClient.get('/api/v1/reports/monthly', { params: { month } });
  return res.data.data;
}

/**
 * 연간 리포트 조회 (GET /api/v1/reports/annual)
 * @param {number} year
 * @returns {{ year, monthlyExpenses, annualSummary, categorySavings }}
 */
export async function getAnnualReport(year) {
  const res = await apiClient.get('/api/v1/reports/annual', { params: { year } });
  return res.data.data;
}
