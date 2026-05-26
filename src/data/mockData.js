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
    place: '바나프레소 커피',
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

// ── 백엔드 연동 후 제거 예정: 월간/연간/주간 비교용 더미 소비 내역 ──────────────
// expense_id 9001~ 는 API와 충돌하지 않는 임시 범위
export const MOCK_YEARLY_EXPENSES = [

  // ── 1월 (Jan 2026) ~350,000원 ────────────────────────────
  { expense_id: 9001, place: '스타벅스',    name: '카페', expense_date: '2026-01-05', amount:  6500, memo: '' },
  { expense_id: 9002, place: '이마트',       name: '식비', expense_date: '2026-01-06', amount: 43000, memo: '' },
  { expense_id: 9003, place: '버스/지하철', name: '교통', expense_date: '2026-01-08', amount:  5600, memo: '' },
  { expense_id: 9004, place: '올리브영',     name: '쇼핑', expense_date: '2026-01-10', amount: 34000, memo: '' },
  { expense_id: 9005, place: '배달의민족', name: '식비', expense_date: '2026-01-13', amount: 18500, memo: '' },
  { expense_id: 9006, place: 'CGV',          name: '문화', expense_date: '2026-01-16', amount: 15000, memo: '' },
  { expense_id: 9007, place: '한솥도시락', name: '식비', expense_date: '2026-01-18', amount:  8900, memo: '' },
  { expense_id: 9008, place: '유니클로',     name: '쇼핑', expense_date: '2026-01-20', amount: 59000, memo: '' },
  { expense_id: 9009, place: '투썸플레이스',name: '카페', expense_date: '2026-01-22', amount:  7500, memo: '' },
  { expense_id: 9010, place: '마트',         name: '식비', expense_date: '2026-01-24', amount: 31000, memo: '' },
  { expense_id: 9011, place: '버스/지하철', name: '교통', expense_date: '2026-01-25', amount:  2800, memo: '' },
  { expense_id: 9012, place: '배달의민족', name: '식비', expense_date: '2026-01-27', amount: 22000, memo: '' },
  { expense_id: 9013, place: '교보문고',     name: '문화', expense_date: '2026-01-28', amount: 18000, memo: '' },
  { expense_id: 9014, place: '메가커피',     name: '카페', expense_date: '2026-01-30', amount:  3500, memo: '' },
  { expense_id: 9015, place: '편의점',       name: '식비', expense_date: '2026-01-31', amount:  7200, memo: '' },
  // 소계: 282,500

  // ── 2월 (Feb 2026) ~195,000원 — 가장 절약한 달 ───────────
  { expense_id: 9020, place: '메가커피',     name: '카페', expense_date: '2026-02-03', amount:  3500, memo: '' },
  { expense_id: 9021, place: '편의점',       name: '식비', expense_date: '2026-02-05', amount:  6200, memo: '' },
  { expense_id: 9022, place: '버스/지하철', name: '교통', expense_date: '2026-02-07', amount:  2800, memo: '' },
  { expense_id: 9023, place: '김밥천국',     name: '식비', expense_date: '2026-02-10', amount:  6500, memo: '' },
  { expense_id: 9024, place: '이디야',       name: '카페', expense_date: '2026-02-13', amount:  4000, memo: '' },
  { expense_id: 9025, place: '마트',         name: '식비', expense_date: '2026-02-15', amount: 24000, memo: '' },
  { expense_id: 9026, place: '버스/지하철', name: '교통', expense_date: '2026-02-17', amount:  1400, memo: '' },
  { expense_id: 9027, place: '다이소',       name: '쇼핑', expense_date: '2026-02-19', amount: 12000, memo: '' },
  { expense_id: 9028, place: '배달의민족', name: '식비', expense_date: '2026-02-21', amount: 14500, memo: '' },
  { expense_id: 9029, place: '편의점',       name: '식비', expense_date: '2026-02-24', amount:  5800, memo: '' },
  { expense_id: 9030, place: '메가커피',     name: '카페', expense_date: '2026-02-26', amount:  3500, memo: '' },
  { expense_id: 9031, place: '마트',         name: '식비', expense_date: '2026-02-28', amount: 19000, memo: '' },
  // 소계: 103,200

  // ── 3월 (Mar 2026) ~490,000원 — 가장 많이 쓴 달 ──────────
  { expense_id: 9040, place: '스타벅스',    name: '카페', expense_date: '2026-03-02', amount:  8500, memo: '' },
  { expense_id: 9041, place: '이마트',       name: '식비', expense_date: '2026-03-03', amount: 52000, memo: '' },
  { expense_id: 9042, place: '버스/지하철', name: '교통', expense_date: '2026-03-05', amount:  5600, memo: '' },
  { expense_id: 9043, place: 'H&M',          name: '쇼핑', expense_date: '2026-03-07', amount: 68000, memo: '' },
  { expense_id: 9044, place: '배달의민족', name: '식비', expense_date: '2026-03-09', amount: 24000, memo: '' },
  { expense_id: 9045, place: '투썸플레이스',name: '카페', expense_date: '2026-03-11', amount:  8000, memo: '' },
  { expense_id: 9046, place: 'CGV',          name: '문화', expense_date: '2026-03-13', amount: 24000, memo: '' },
  { expense_id: 9047, place: '올리브영',     name: '쇼핑', expense_date: '2026-03-15', amount: 47000, memo: '' },
  { expense_id: 9048, place: '한솥도시락', name: '식비', expense_date: '2026-03-17', amount:  9500, memo: '' },
  { expense_id: 9049, place: '버스/지하철', name: '교통', expense_date: '2026-03-18', amount:  2800, memo: '' },
  { expense_id: 9050, place: '마트',         name: '식비', expense_date: '2026-03-20', amount: 38000, memo: '' },
  { expense_id: 9051, place: '에이블리',     name: '쇼핑', expense_date: '2026-03-22', amount: 55000, memo: '' },
  { expense_id: 9052, place: '스타벅스',    name: '카페', expense_date: '2026-03-24', amount:  7000, memo: '' },
  { expense_id: 9053, place: '배달의민족', name: '식비', expense_date: '2026-03-26', amount: 21000, memo: '' },
  { expense_id: 9054, place: '교보문고',     name: '문화', expense_date: '2026-03-28', amount: 22000, memo: '' },
  { expense_id: 9055, place: '편의점',       name: '식비', expense_date: '2026-03-30', amount:  7800, memo: '' },
  // 소계: 499,700

  // ── 4월 (Apr 2026) ~390,000원 ────────────────────────────
  { expense_id: 9060, place: '이디야',       name: '카페', expense_date: '2026-04-02', amount:  4000, memo: '' },
  { expense_id: 9061, place: '마트',         name: '식비', expense_date: '2026-04-04', amount: 36000, memo: '' },
  { expense_id: 9062, place: '버스/지하철', name: '교통', expense_date: '2026-04-05', amount:  5600, memo: '' },
  { expense_id: 9063, place: '무신사',       name: '쇼핑', expense_date: '2026-04-07', amount: 72000, memo: '' },
  { expense_id: 9064, place: '배달의민족', name: '식비', expense_date: '2026-04-09', amount: 17500, memo: '' },
  { expense_id: 9065, place: '메가커피',     name: '카페', expense_date: '2026-04-11', amount:  3500, memo: '' },
  { expense_id: 9066, place: '롯데시네마',   name: '문화', expense_date: '2026-04-13', amount: 14000, memo: '' },
  { expense_id: 9067, place: '편의점',       name: '식비', expense_date: '2026-04-15', amount:  8200, memo: '' },
  { expense_id: 9068, place: '버스/지하철', name: '교통', expense_date: '2026-04-17', amount:  2800, memo: '' },
  { expense_id: 9069, place: '이마트',       name: '식비', expense_date: '2026-04-19', amount: 44000, memo: '' },
  { expense_id: 9070, place: '투썸플레이스',name: '카페', expense_date: '2026-04-21', amount:  7500, memo: '' },
  { expense_id: 9071, place: '다이소',       name: '쇼핑', expense_date: '2026-04-23', amount: 15000, memo: '' },
  { expense_id: 9072, place: '배달의민족', name: '식비', expense_date: '2026-04-25', amount: 19500, memo: '' },
  { expense_id: 9073, place: '마트',         name: '식비', expense_date: '2026-04-27', amount: 28000, memo: '' },
  { expense_id: 9074, place: '버스/지하철', name: '교통', expense_date: '2026-04-29', amount:  2800, memo: '' },
  // 소계: 280,400

  // ── 5월 1~17일 ───────────────────────────────────────────
  { expense_id: 9080, place: '스타벅스',    name: '카페', expense_date: '2026-05-02', amount:  6500, memo: '' },
  { expense_id: 9081, place: '마트',         name: '식비', expense_date: '2026-05-03', amount: 33000, memo: '' },
  { expense_id: 9082, place: '버스/지하철', name: '교통', expense_date: '2026-05-05', amount:  2800, memo: '' },
  { expense_id: 9083, place: '올리브영',     name: '쇼핑', expense_date: '2026-05-07', amount: 28000, memo: '' },
  { expense_id: 9084, place: '배달의민족', name: '식비', expense_date: '2026-05-09', amount: 16500, memo: '' },
  { expense_id: 9085, place: '메가커피',     name: '카페', expense_date: '2026-05-12', amount:  3500, memo: '' },
  { expense_id: 9086, place: '편의점',       name: '식비', expense_date: '2026-05-14', amount:  7200, memo: '' },
  { expense_id: 9087, place: '버스/지하철', name: '교통', expense_date: '2026-05-16', amount:  5600, memo: '' },
  { expense_id: 9088, place: '배달의민족', name: '식비', expense_date: '2026-05-17', amount: 18000, memo: '' },
  // 소계: 121,100

  // ── 5월 지난주 (May 18~24) — 주간 비교 '지난주' ───────────
  { expense_id: 9090, place: '스타벅스',    name: '카페', expense_date: '2026-05-19', amount:  7000, memo: '' },
  { expense_id: 9091, place: '한솥도시락', name: '식비', expense_date: '2026-05-19', amount:  8900, memo: '' },
  { expense_id: 9092, place: '버스/지하철', name: '교통', expense_date: '2026-05-20', amount:  2800, memo: '' },
  { expense_id: 9093, place: '마트',         name: '식비', expense_date: '2026-05-21', amount: 27000, memo: '' },
  { expense_id: 9094, place: '이디야',       name: '카페', expense_date: '2026-05-21', amount:  4000, memo: '' },
  { expense_id: 9095, place: '배달의민족', name: '식비', expense_date: '2026-05-22', amount: 15500, memo: '' },
  { expense_id: 9096, place: '버스/지하철', name: '교통', expense_date: '2026-05-22', amount:  1400, memo: '' },
  { expense_id: 9097, place: '편의점',       name: '식비', expense_date: '2026-05-23', amount:  6800, memo: '' },
  { expense_id: 9098, place: 'CGV',          name: '문화', expense_date: '2026-05-24', amount: 14000, memo: '' },
  { expense_id: 9099, place: '투썸플레이스',name: '카페', expense_date: '2026-05-24', amount:  7500, memo: '' },
  // 지난주 소계: 94,900

  // ── 5월 이번주 (May 25~26) — 주간 비교 '이번주' ────────────
  { expense_id: 9100, place: '메가커피',     name: '카페', expense_date: '2026-05-25', amount:  3500, memo: '' },
  { expense_id: 9101, place: '한솥도시락', name: '식비', expense_date: '2026-05-25', amount:  8900, memo: '' },
  { expense_id: 9102, place: '버스/지하철', name: '교통', expense_date: '2026-05-26', amount:  2800, memo: '' },
  { expense_id: 9103, place: '편의점',       name: '식비', expense_date: '2026-05-26', amount:  5500, memo: '' },
  // 이번주 소계: 20,700
];
