// 목 데이터
export const mockBudget = {
  total: 500000,
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
    id: 1,
    icon: '☕',
    place: '스타벅스',
    category: '카페',
    time: '08:32',
    amount: 6500,
  },
  {
    id: 2,
    icon: '🍱',
    place: '한솥도시락',
    category: '식비',
    time: '12:15',
    amount: 7900,
  },
  {
    id: 3,
    icon: '🚌',
    place: '교통카드',
    category: '교통',
    time: '18:04',
    amount: 1400,
  },
  {
    id: 4,
    icon: '🛒',
    place: 'GS25',
    category: '편의점',
    time: '20:30',
    amount: 4800,
  },
  {
    id: 5,
    icon: '🎬',
    place: 'CGV',
    category: '문화',
    time: '21:00',
    amount: 12000,
  },
];

export const mockWeeklyGoal = {
  goal: 150000,
  spent: 98300,
  daysLeft: 4,
};

export const mockWeeklyGoals = [
  { label: '이번 주', goal: 150000, spent: 98300, daysLeft: 4 },
  { label: '지난 주', goal: 150000, spent: 162000, daysLeft: 0 },
  { label: '이번 달', goal: 600000, spent: 312500, daysLeft: 22 },
];

export const mockAttendance = {
  // 이번 달 출석 체크된 날짜
  checkedDays: [1, 2, 3, 4, 5, 8],
  totalDays: 30,
  currentStreak: 4,
};
