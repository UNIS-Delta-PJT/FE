import apiClient from './client';

/**
 * 오늘의 O/X 퀴즈 조회 (GET /api/v1/quiz/daily)
 * 제출 전: { quizId, question, isSubmitted: false }
 * 제출 후: { quizId, question, isSubmitted: true, isCorrect, correctAnswer, explanation }
 */
export async function getDailyQuiz() {
  const res = await apiClient.get('/api/v1/quiz/daily');
  return res.data.data;
}

/**
 * 오늘의 O/X 퀴즈 정답 제출 (POST /api/v1/quiz/daily/submit) — 정답 시 1코인
 * @param {number} quizId
 * @param {'O'|'X'} answer
 * @returns {{ isCorrect, correctAnswer, explanation, ... }}
 */
export async function submitDailyQuiz(quizId, answer) {
  const res = await apiClient.post('/api/v1/quiz/daily/submit', { quizId, answer });
  return res.data.data;
}

/**
 * 맵 화면 주사위용 4지선다 금융 퀴즈 조회 (GET /api/v1/quiz/finance)
 * @returns {{ quizId, question, options: [{ optionNumber, content }] }}
 */
export async function getFinanceQuiz() {
  const res = await apiClient.get('/api/v1/quiz/finance');
  return res.data.data;
}

/**
 * 4지선다 금융 퀴즈 정답 제출 (POST /api/v1/quiz/finance/submit) — 정답 시 1코인 + 주사위 활성화
 * @param {number} quizId
 * @param {number} selectedOption 1~4
 * @returns {{ isCorrect, correctOption, explanation, rewardCoin, coinBalance, isDiceEnabled }}
 */
export async function submitFinanceQuiz(quizId, selectedOption) {
  const res = await apiClient.post('/api/v1/quiz/finance/submit', { quizId, selectedOption });
  return res.data.data;
}
