// 목 데이터
export const mockBudget = {
  total_amount: 500000,
  spent: 187400,
};

export const mockCalendarData = {
  // key: 'YYYY-MM-DD', value: 지출 금액
  '2026-04-01': 12300,
  '2026-04-02': 45000,
  '2026-04-03': 8700,
  '2026-04-04': 23100,
  '2026-04-05': 0,
  '2026-04-06': 31500,
  '2026-04-07': 14200,
  '2026-04-08': 52600,
};

export const mockTodayExpenses = [
  {
    expense_id: 1,
    icon: '☕',
    place: '스타벅스',
    name: '카페',
    expense_date: '08:32',
    amount: 6500,
  },
  {
    expense_id: 2,
    icon: '🍱',
    place: '한솥도시락',
    name: '식비',
    expense_date: '12:15',
    amount: 7900,
  },
  {
    expense_id: 3,
    icon: '🚌',
    place: '교통카드',
    name: '교통',
    expense_date: '18:04',
    amount: 1400,
  },
  {
    expense_id: 4,
    icon: '🛒',
    place: 'GS25',
    name: '편의점',
    expense_date: '20:30',
    amount: 4800,
  },
  {
    expense_id: 5,
    icon: '🎬',
    place: 'CGV',
    name: '문화',
    expense_date: '21:00',
    amount: 12000,
  },
];

export const mockWeeklyGoal = {
  total_amount: 150000,
  spent: 98300,
  daysLeft: 4,
};

export const mockWeeklyGoals = [
  { label: '이번 주', total_amount: 150000, spent: 98300, daysLeft: 4 },
  { label: '지난 주', total_amount: 150000, spent: 162000, daysLeft: 0 },
  { label: '이번 달', total_amount: 600000, spent: 312500, daysLeft: 22 },
];

export const mockAttendance = {
  // 이번 달 출석 체크된 날짜
  checkedDays: [1, 2, 3, 4, 5, 8],
  totalDays: 30,
  currentStreak: 4,
};
