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
