import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import CategoryIcon from './CategoryIcons';
import savingsIconImg from '../assets/icon_savings.png';
import celebrationImg from '../assets/icon_celebration.png';

// ── 상수 ─────────────────────────────────────────────────────────────────────
const DAYS_KR  = ['월', '화', '수', '목', '금', '토', '일'];
const DAY_MAP  = ['일', '월', '화', '수', '목', '금', '토'];
const MOCK_PEER_RANK    = 23;   // 또래 상위 n% (백엔드 연동 전 mock)
const MOCK_FIXED_EXPENSE = 85000; // 고정비 mock (백엔드 연동 전)

const BAR_H = 125;
const BAR_W = 24;
const Y_AXIS_W = 30;

const PERIOD_TABS = [
  { key: 'weekly',  label: '주간' },
  { key: 'monthly', label: '월간' },
  { key: 'yearly',  label: '연간' },
];

// ── 날짜 헬퍼 ────────────────────────────────────────────────────────────────
function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function getWeekBounds(offsetWeeks = 0) {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

// ── 계산 함수 ────────────────────────────────────────────────────────────────
function computeWeeklyData(expenses) {
  const { monday, sunday } = getWeekBounds(0);
  const data = { '월': 0, '화': 0, '수': 0, '목': 0, '금': 0, '토': 0, '일': 0 };
  expenses.forEach(e => {
    if (!e.expense_date || !/^\d{4}-\d{2}-\d{2}$/.test(e.expense_date)) return;
    const date = parseDate(e.expense_date);
    if (date >= monday && date <= sunday) {
      const krIdx = (date.getDay() + 6) % 7;
      data[DAYS_KR[krIdx]] += e.amount;
    }
  });
  return data;
}

function computeWeekCompare(expenses) {
  const { monday: tm, sunday: ts } = getWeekBounds(0);
  const { monday: lm, sunday: ls } = getWeekBounds(-1);
  let thisWeek = 0, lastWeek = 0;
  expenses.forEach(e => {
    if (!e.expense_date || !/^\d{4}-\d{2}-\d{2}$/.test(e.expense_date)) return;
    const date = parseDate(e.expense_date);
    if (date >= tm && date <= ts) thisWeek += e.amount;
    else if (date >= lm && date <= ls) lastWeek += e.amount;
  });
  return { thisWeek, lastWeek };
}

function computeTopCategory(expenses) {
  const catMap = {};
  expenses.forEach(e => { if (e.name) catMap[e.name] = (catMap[e.name] || 0) + e.amount; });
  const entries = Object.entries(catMap);
  if (!entries.length) return { name: '-' };
  return { name: entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0] };
}

function computeMonthlyByCategory(expenses) {
  const today = new Date();
  const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const catMap = {};
  expenses.forEach(e => {
    if (!e.expense_date?.startsWith(ym)) return;
    catMap[e.name || '기타'] = (catMap[e.name || '기타'] || 0) + e.amount;
  });
  return Object.entries(catMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
}

function computeGrade(rank) {
  if (rank <= 10) return 'A';
  if (rank <= 25) return 'B';
  if (rank <= 50) return 'C';
  if (rank <= 75) return 'D';
  if (rank <= 90) return 'E';
  return 'F';
}

// ── 공통 아이콘 ───────────────────────────────────────────────────────────────
function ReceiptIcon({ color = '#2ECC71', size = 20 }) {
  return (
    <svg width={size} height={Math.round(size * 20 / 18)} viewBox="0 0 18 20" fill="none">
      <path d="M1 2C1 1.45 1.45 1 2 1H16C16.55 1 17 1.45 17 2V15L14.5 19L12 15L9.5 19L7 15L4.5 19L2 15L1 15V2Z"
        stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M4.5 6H13.5M4.5 9H13.5M4.5 12H9.5"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
      <circle cx="8.5"  cy="7"   r="4" fill="#059669" opacity="0.55" />
      <path d="M1,23 C1,18.9 4.4,15.5 8.5,15.5 C10.5,15.5 12.3,16.3 13.6,17.5" fill="#059669" opacity="0.55" />
      <circle cx="23.5" cy="7"   r="4" fill="#059669" opacity="0.55" />
      <path d="M32,23 C32,18.9 28.6,15.5 24.5,15.5 C22.5,15.5 20.6,16.3 19.3,17.5" fill="#059669" opacity="0.55" />
      <circle cx="16"   cy="5.5" r="5" fill="#059669" />
      <path d="M7,23 C7,18.4 11,14.5 16,14.5 C21,14.5 25,18.4 25,23" fill="#059669" />
    </svg>
  );
}

// ── 주간 컴포넌트 ─────────────────────────────────────────────────────────────

/** hex → "r,g,b" */
function hexRgb(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

function BarRow({ label, pct, amount, accent = '#2ECC71' }) {
  const rgb = hexRgb(accent);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 30, borderRadius: 9999, backgroundColor: '#F3F4F5', overflow: 'hidden', position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${pct}%`,
          background: `linear-gradient(to right, rgba(${rgb},0.1), rgba(${rgb},1))`,
          borderRadius: 9999,
        }} />
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 12, color: '#000000',
        }}>
          {label}
        </span>
      </div>
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 12, color: '#9A9A9A', width: 44, textAlign: 'right', flexShrink: 0 }}>
        {amount}
      </span>
    </div>
  );
}

function WeekCompareCard({ data }) {
  const { lastWeek, thisWeek } = data;
  const maxVal  = Math.max(lastWeek, thisWeek, 1);
  const lastPct = (lastWeek / maxVal) * 100;
  const thisPct = (thisWeek / maxVal) * 100;
  const change  = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;
  const isUp    = change > 0;
  const changeStr = (isUp ? '+' : '') + change.toFixed(1) + '%';
  const fmt = v => v === 0 ? '0원' : (v / 10000).toFixed(1) + '만';

  return (
    <div style={{
      width: 353, backgroundColor: '#FFFFFF', borderRadius: 32,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: 24,
      boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
    }}>
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 14, color: '#000000', display: 'block', marginBottom: 22 }}>
        지난주 대비 지출 비교
      </span>

      {/* 지난주: #FED023 그라데이션 */}
      <BarRow label="지난주" pct={lastPct} amount={fmt(lastWeek)} accent="#FED023" />
      <div style={{ height: 14 }} />
      {/* 이번주: #2ECC71 그라데이션 */}
      <BarRow label="이번주" pct={thisPct} amount={fmt(thisWeek)} accent="#2ECC71" />

      <div style={{ flex: 1 }} />
      <div style={{ height: 1, backgroundColor: '#F3F4F5', margin: '16px 0' }} />

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 12, color: '#000000' }}>소비 변화</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 14, color: '#006D37' }}>지난주 대비</span>
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 20, color: isUp ? '#EF4444' : '#006D37' }}>
              {lastWeek === 0 && thisWeek === 0 ? '-' : changeStr}
            </span>
          </div>
        </div>
        {isUp
          ? <TrendingUp  size={24} color="#EF4444" strokeWidth={2} />
          : <TrendingDown size={24} color="#006D37" strokeWidth={2} />}
      </div>
    </div>
  );
}

function InfoCards({ topCategory, peerRank }) {
  const fillWidth = Math.round(((100 - peerRank) / 100) * 126);
  return (
    <div style={{ display: 'flex', gap: 19, width: 353 }}>
      <div style={{ width: 167, height: 135, borderRadius: 32, backgroundColor: '#F3F4F5', padding: 20, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CategoryIcon name={topCategory.name} width={18} height={16} color="#EF4444" />
        </div>
        <div>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 12, color: '#000000', margin: '0 0 4px 0' }}>지출 1위 항목</p>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 18, color: '#EF4444', margin: 0 }}>{topCategory.name}</p>
        </div>
      </div>
      <div style={{ width: 167, height: 135, borderRadius: 32, backgroundColor: '#F3F4F5', padding: 20, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <PeopleIcon />
        <div>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 12, color: '#000000', margin: 0 }}>또래 소비 순위</p>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 18, color: '#000000', margin: '0 0 6px 0' }}>상위 {peerRank}%</p>
          <div style={{ width: 126, height: 6, borderRadius: 9999, backgroundColor: '#E2E8F0', overflow: 'hidden' }}>
            <div style={{ width: fillWidth, height: 6, borderRadius: 9999, backgroundColor: '#059669' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DayChart({ weeklyData }) {
  const todayKr  = DAY_MAP[new Date().getDay()];
  const values   = Object.values(weeklyData);
  const maxVal   = Math.max(...values, 1);
  const hasData  = values.some(v => v > 0);
  const maxDay   = hasData ? Object.entries(weeklyData).reduce((a, b) => (a[1] > b[1] ? a : b))[0] : null;
  const MAX_CHART = Math.max(Math.ceil(maxVal / 50000) * 50000, 50000);
  const yStep    = MAX_CHART / 4;
  const fmtY     = v => v >= 10000 ? `${v / 10000}만` : `${v / 1000}천`;
  const Y_LABELS = [4, 3, 2, 1].map(i => fmtY(yStep * i));

  return (
    <div style={{ width: 353, backgroundColor: '#FFFFFF', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: 19, boxSizing: 'border-box' }}>
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 16, color: '#000000', display: 'block' }}>요일별 지출 그래프</span>
      <div style={{ height: 6 }} />
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 24, color: '#000000', display: 'block' }}>{todayKr}요일</span>
      <div style={{ height: 4 }} />
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 10, color: '#9F9FA3', display: 'block' }}>
        {hasData ? `이번 주 최대 소비: ${maxDay}요일` : '이번 주 소비 내역이 없어요'}
      </span>
      <div style={{ height: 18 }} />
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ width: Y_AXIS_W, height: BAR_H, position: 'relative', flexShrink: 0 }}>
          {Y_LABELS.map((label, i) => (
            <span key={label} style={{ position: 'absolute', top: i === 0 ? 0 : `${i * 25}%`, right: 4, transform: i === 0 ? 'none' : 'translateY(-50%)', fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 10, color: '#828282', lineHeight: 1, whiteSpace: 'nowrap' }}>
              {label}
            </span>
          ))}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: BAR_H, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            {DAYS_KR.map(day => {
              const amount    = weeklyData[day] || 0;
              const barHeight = Math.round((Math.min(amount, MAX_CHART) / MAX_CHART) * BAR_H);
              return (
                <div key={day} style={{ width: BAR_W, height: BAR_H, backgroundColor: 'rgba(46,204,113,0.2)', borderRadius: 5, flexShrink: 0, display: 'flex', alignItems: 'flex-end' }}>
                  {barHeight > 0 && <div style={{ width: BAR_W, height: barHeight, backgroundColor: '#2ECC71', borderRadius: 5 }} />}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {DAYS_KR.map(day => (
              <span key={day} style={{ width: BAR_W, textAlign: 'center', fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 10, color: '#828282', flexShrink: 0, display: 'block' }}>
                {day}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ height: 14 }} />
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 10, color: '#9F9FA3', display: 'block' }}>소비내역 기반 데이터</span>
    </div>
  );
}

// ── 월간 컴포넌트 ─────────────────────────────────────────────────────────────

/**
 * 원형 예산 소진율 링 (SVG stroke + strokeLinecap="round")
 * - linearGradient: 12시(#D6F4E3 연) → 6시(#2ECC71 진) 방향으로 자연스러운 그라데이션
 * - strokeLinecap="round": 양 끝 자연스럽게 둥글게
 * - 중앙: "남은 금액" 라벨 + 남은 금액
 */
function BudgetRing({ pct, size = 140, remaining = 0 }) {
  const clamped = Math.min(Math.max(pct, 0), 100);
  const cx      = size / 2;
  const cy      = size / 2;
  const stroke  = Math.round(size * 0.13);
  const r       = cx - stroke / 2 - 1;
  const circ    = 2 * Math.PI * r;
  const offset  = circ * (1 - clamped / 100);

  // 남은 금액 포맷 (숫자 부분만, "원"은 별도 렌더링)
  const fmtNum = v => {
    if (v >= 100000000) return `${(v / 100000000).toFixed(1)}억`;
    if (v >= 10000)     return `${Math.round(v / 10000)}만`;
    return v.toLocaleString('ko-KR');
  };

  const labelSize  = Math.round(size * 0.09);
  const amountSize = Math.round(size * 0.13);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          {/* 12시(상단, 연) → 6시(하단, 진) 방향 그라데이션 */}
          <linearGradient id="ringGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#D6F4E3" />
            <stop offset="100%" stopColor="#2ECC71" />
          </linearGradient>
        </defs>

        {/* 트랙 */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#EBEBEB"
          strokeWidth={stroke}
        />

        {/* 진행 호 — rotate(-90)로 12시에서 시작, 시계 방향 */}
        {clamped > 0 && (
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth={stroke}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        )}
      </svg>

      {/* 중앙 텍스트: "남은 금액" 라벨 위, 금액 아래 */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 5,
      }}>
        <span style={{
          fontFamily: 'Pretendard, sans-serif', fontWeight: 400,
          fontSize: labelSize, color: '#9A9A9A', lineHeight: 1,
        }}>
          남은 금액
        </span>
        <span style={{
          fontFamily: 'Pretendard, sans-serif', fontWeight: 700,
          fontSize: amountSize, lineHeight: 1,
          whiteSpace: 'nowrap',
        }}>
          <span style={{ color: '#1A1A1A' }}>{fmtNum(remaining)}원</span>
        </span>
      </div>
    </div>
  );
}

function BudgetUsageCard({ spent, budgetTotal }) {
  const budget    = budgetTotal || 0;
  const pct       = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const remaining = Math.max(budget - spent, 0);

  return (
    <div style={{ width: 353, backgroundColor: '#FFFFFF', borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '20px 22px', boxSizing: 'border-box' }}>
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 14, color: '#000000', display: 'block', marginBottom: 18 }}>
        이번 달 예산 소진율
      </span>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <BudgetRing pct={pct} size={140} remaining={remaining} />
      </div>
    </div>
  );
}

function TopCategoriesCard({ categories }) {
  const top3  = categories.slice(0, 3);
  const total = categories.reduce((s, c) => s + c.amount, 0);
  const fmt   = v => (v / 10000).toFixed(1) + '만';

  return (
    <div style={{ width: 353, backgroundColor: '#FFFFFF', borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '20px 22px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 0 }}>
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 14, color: '#000000', display: 'block', marginBottom: 20 }}>
        어디에 가장 많이 썼을까?
      </span>

      {top3.length === 0 ? (
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingBottom: 8 }}>이번 달 소비 내역이 없어요</span>
      ) : top3.map(({ name, amount }, i) => {
        const pct = total > 0 ? (amount / total) * 100 : 0;
        return (
          <div key={name} style={{ marginBottom: i < top3.length - 1 ? 16 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 11, color: '#BBBBBB', minWidth: 12 }}>{i + 1}</span>
                <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: '#F3F4F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CategoryIcon name={name} width={13} height={13} />
                </div>
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 13, color: '#1A1A1A' }}>{name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 11, color: '#9A9A9A' }}>{fmt(amount)}</span>
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 12, color: '#2ECC71' }}>{pct.toFixed(1)}%</span>
              </div>
            </div>
            <div style={{ height: 7, borderRadius: 9999, background: '#F3F4F5', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 9999, background: '#2ECC71', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MonthlyInfoCards({ fixedExpense, grade, peerRank }) {
  return (
    <div style={{ display: 'flex', gap: 19, width: 353 }}>
      {/* 이번 달 고정비 */}
      <div style={{ width: 167, height: 135, borderRadius: 32, backgroundColor: '#F3F4F5', padding: 20, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* 초록 영수증 아이콘 */}
        <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(46,204,113,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ReceiptIcon color="#2ECC71" size={18} />
        </div>
        <div>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 12, color: '#000000', margin: '0 0 4px 0' }}>이번 달 고정비</p>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 16, color: '#1A1A1A', margin: 0 }}>
            ₩{fixedExpense.toLocaleString('ko-KR')}
          </p>
        </div>
      </div>

      {/* 레온이의 성적표 */}
      <div style={{ width: 167, height: 135, borderRadius: 32, backgroundColor: '#F3F4F5', padding: 20, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* 텍스트 위로 */}
        <div>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 12, color: '#000000', margin: '0 0 2px 0' }}>레온이의 성적표</p>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 11, color: '#9A9A9A', margin: 0 }}>또래 상위 {peerRank}%</p>
        </div>
        {/* 등급 알파벳 아래로 — 왼쪽 정렬 */}
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 24, color: '#2ECC71', lineHeight: 1, display: 'block' }}>
          {grade}
        </span>
      </div>
    </div>
  );
}

// ── 연간 컴포넌트 ─────────────────────────────────────────────────────────────

/** 전년 대비 추세 아이콘 (13×8) */
function YearTrendIcon({ color = '#2ECC71', isUp = false }) {
  return (
    <svg width="13" height="8" viewBox="0 0 13 8" fill="none">
      {isUp ? (
        <>
          {/* 증가: 우상향 지그재그 + 화살표 */}
          <path d="M1 6.5L4.5 3L8 5.5L12 1.5"
            stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.5 1.5H12V4"
            stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          {/* 감소: 우하향 지그재그 + 화살표 */}
          <path d="M1 1.5L4.5 5L8 2.5L12 6.5"
            stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.5 6.5H12V4"
            stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

const MOCK_PREV_YEAR_TOTAL = 4_800_000; // 전년 연간 지출 mock

function YearlyFlowCard({ expenses }) {
  const LABEL_MONTHS = new Set([0, 2, 4, 6, 8, 11]); // 1·3·5·7·9·12월만 표시
  const MONTH_LABELS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

  const today          = new Date();
  const thisYear       = today.getFullYear();
  const currentMonthIdx = today.getMonth();

  const monthlyTotals = useMemo(() => {
    const totals = Array(12).fill(0);
    expenses.forEach(e => {
      if (!e.expense_date || !/^\d{4}-\d{2}-\d{2}$/.test(e.expense_date)) return;
      const [y, m] = e.expense_date.split('-').map(Number);
      if (y === thisYear) totals[m - 1] += e.amount;
    });
    return totals;
  }, [expenses, thisYear]);

  const thisYearTotal = monthlyTotals.reduce((s, v) => s + v, 0);
  const rawChange = MOCK_PREV_YEAR_TOTAL > 0
    ? ((thisYearTotal - MOCK_PREV_YEAR_TOTAL) / MOCK_PREV_YEAR_TOTAL) * 100
    : 0;
  const isUp       = rawChange > 0;
  const changeAbs  = Math.abs(rawChange).toFixed(1);
  const changeColor = isUp ? '#EF4444' : '#2ECC71';

  const BAR_H  = 145;
  const MIN_BAR = 8;
  const maxVal  = Math.max(...monthlyTotals, 1);

  return (
    <div style={{
      width: 353, height: 263,
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      padding: 20,
      boxSizing: 'border-box',
    }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 20, color: '#1A1A1A', lineHeight: 1.2 }}>
          올해의 지출 흐름
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingTop: 5 }}>
          <YearTrendIcon color={changeColor} isUp={isUp} />
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 12, color: changeColor, whiteSpace: 'nowrap' }}>
            전년 대비 {changeAbs}% {isUp ? '증가' : '감소'}
          </span>
        </div>
      </div>

      {/* 바 차트 */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: BAR_H }}>
        {monthlyTotals.map((val, idx) => {
          const isCurrent = idx === currentMonthIdx;
          const barH = maxVal > 0
            ? Math.max(Math.round((val / maxVal) * BAR_H), MIN_BAR)
            : MIN_BAR;
          return (
            <div key={idx} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: BAR_H }}>
              <div style={{
                width: 16,
                height: barH,
                backgroundColor: isCurrent ? '#2ECC71' : '#E8F8EF',
                borderRadius: '4px 4px 0 0',
              }} />
            </div>
          );
        })}
      </div>

      {/* X축 레이블 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7 }}>
        {MONTH_LABELS.map((label, idx) => (
          <div key={idx} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            {LABEL_MONTHS.has(idx) && (
              <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 12, color: '#555555', lineHeight: 1 }}>
                {label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function YearlySummaryCard({ expenses }) {
  const today    = new Date();
  const thisYear = today.getFullYear();
  const MONTH_LABELS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

  const monthlyTotals = useMemo(() => {
    const totals = Array(12).fill(0);
    expenses.forEach(e => {
      if (!e.expense_date || !/^\d{4}-\d{2}-\d{2}$/.test(e.expense_date)) return;
      const [y, m] = e.expense_date.split('-').map(Number);
      if (y === thisYear) totals[m - 1] += e.amount;
    });
    return totals;
  }, [expenses, thisYear]);

  const nonZero = monthlyTotals
    .map((val, idx) => ({ val, idx }))
    .filter(({ val }) => val > 0);

  const maxEntry = nonZero.length ? nonZero.reduce((a, b) => a.val > b.val ? a : b) : null;
  const minEntry = nonZero.length ? nonZero.reduce((a, b) => a.val < b.val ? a : b) : null;

  const mostSpendingMonth = maxEntry ? MONTH_LABELS[maxEntry.idx] : '-';
  const mostSavingMonth   = minEntry ? MONTH_LABELS[minEntry.idx] : '-';

  const Row = ({ dotColor, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: dotColor, flexShrink: 0 }} />
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 16, color: '#555555' }}>
        {label}&nbsp;<span style={{ fontWeight: 700 }}>{value}</span>
      </span>
    </div>
  );

  return (
    <div style={{
      width: 353,
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      padding: 20,
      boxSizing: 'border-box',
    }}>
      <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 16, color: '#1A1A1A', margin: '0 0 18px 0' }}>
        올해의 소비 요약
      </p>
      <Row dotColor="#BA1A1A" label="가장 많이 쓴 달:" value={mostSpendingMonth} />
      <div style={{ height: 14 }} />
      <Row dotColor="#2ECC71" label="가장 절약한 달:" value={mostSavingMonth} />
    </div>
  );
}


function YearlyMiniCards({ expenses }) {
  const today    = new Date();
  const thisYear = today.getFullYear();

  const monthlyTotals = useMemo(() => {
    const totals = Array(12).fill(0);
    expenses.forEach(e => {
      if (!e.expense_date || !/^\d{4}-\d{2}-\d{2}$/.test(e.expense_date)) return;
      const [y, m] = e.expense_date.split('-').map(Number);
      if (y === thisYear) totals[m - 1] += e.amount;
    });
    return totals;
  }, [expenses, thisYear]);

  const thisYearTotal = monthlyTotals.reduce((s, v) => s + v, 0);
  const savings = Math.max(MOCK_PREV_YEAR_TOTAL - thisYearTotal, 0);
  const fmtSavings = savings === 0 ? '0원'
    : savings >= 10000 ? `${Math.round(savings / 10000)}만원`
    : `${savings.toLocaleString('ko-KR')}원`;

  const cardBase = {
    width: 167,
    backgroundColor: '#F3F4F5',
    borderRadius: 32,
    padding: 20,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const headingStyle = {
    fontFamily: 'Pretendard, sans-serif',
    fontWeight: 500,
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    margin: 0,
  };

  return (
    <div style={{ display: 'flex', gap: 19, width: 353 }}>

      {/* 올해의 소비 뱃지 */}
      <div style={cardBase}>
        <p style={headingStyle}>올해의 소비 뱃지</p>
        <div style={{ paddingTop: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            backgroundColor: '#FED023',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CategoryIcon name="카페" width={24} height={24} color="#FFFFFF" />
          </div>
        </div>
        <span style={{
          paddingTop: 12,
          fontFamily: 'Pretendard, sans-serif',
          fontWeight: 600,
          fontSize: 16,
          color: '#FED023',
          textAlign: 'center',
        }}>
          프로 카페인러
        </span>
      </div>

      {/* 총 절약 금액 */}
      <div style={cardBase}>
        <p style={headingStyle}>총 절약 금액</p>
        <div style={{ paddingTop: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            backgroundColor: '#BDECD1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={savingsIconImg} alt="절약" width={24} height={24} draggable={false} style={{ objectFit: 'contain' }} />
          </div>
        </div>
        <span style={{
          paddingTop: 12,
          fontFamily: 'Pretendard, sans-serif',
          fontWeight: 600,
          fontSize: 16,
          color: '#2ECC71',
          textAlign: 'center',
        }}>
          {fmtSavings}
        </span>
      </div>

    </div>
  );
}

function YearlyShareCard() {
  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: 'DELTA 소비 리포트',
        text: '나의 올해 소비 리포트를 확인해보세요!',
        url: window.location.href,
      }).catch(() => {});
    }
  }

  return (
    <div style={{
      width: 350,
      height: 125,
      borderRadius: 24,
      backgroundColor: '#2ECC71',
      paddingTop: 20,
      paddingLeft: 20,
      paddingRight: 20,
      paddingBottom: 19,
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      {/* 텍스트 */}
      <p style={{
        fontFamily: 'Pretendard, sans-serif',
        fontWeight: 600,
        fontSize: 16,
        color: '#FFFFFF',
        margin: 0,
        lineHeight: 1.4,
        whiteSpace: 'pre-line',
        textAlign: 'left',
      }}>
        {'리포트 공유하고\n보너스 젬 받기'}
      </p>

      {/* 지금 공유하기 버튼 */}
      <button
        onClick={handleShare}
        style={{
          alignSelf: 'flex-start',
          paddingTop: 6,
          paddingBottom: 6,
          paddingLeft: 16,
          paddingRight: 16,
          borderRadius: 1000,
          backgroundColor: '#FFFFFF',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'Pretendard, sans-serif',
          fontWeight: 600,
          fontSize: 12,
          color: '#2ECC71',
          textAlign: 'center',
        }}
      >
        지금 공유하기
      </button>

      {/* 축하 아이콘 — 카드 내 절대 위치 */}
      <img
        src={celebrationImg}
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          left: 232,
          top: 15,
          width: 150,
          height: 150,
          objectFit: 'contain',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
export default function ReportScreen({ expenses = [], budgetTotal = 0, spent = 0 }) {
  const [mainTab,   setMainTab]   = useState('stats');
  const [periodTab, setPeriodTab] = useState('weekly');

  const weeklyData        = useMemo(() => computeWeeklyData(expenses),        [expenses]);
  const compareData       = useMemo(() => computeWeekCompare(expenses),       [expenses]);
  const topCategory       = useMemo(() => computeTopCategory(expenses),       [expenses]);
  const monthlyByCategory = useMemo(() => computeMonthlyByCategory(expenses), [expenses]);

  const grade = computeGrade(MOCK_PEER_RANK);

  return (
    <div style={{ minHeight: '100%', paddingLeft: 20, paddingRight: 17, paddingBottom: 100, boxSizing: 'border-box' }}>
      {/* 제목 */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 20, color: '#111827', margin: 0 }}>리포트</h1>
      </div>

      {/* 소비 통계 / AI 피드백 토글 */}
      <div style={{ width: 353, height: 48, borderRadius: 9999, backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', padding: '6px', boxSizing: 'border-box', marginBottom: 24 }}>
        {[{ key: 'stats', label: '소비 통계' }, { key: 'ai', label: 'AI 피드백' }].map(({ key, label }) => {
          const active = mainTab === key;
          return (
            <button key={key} onClick={() => setMainTab(key)} style={{ width: 170, height: 36, borderRadius: 9999, backgroundColor: active ? '#FFFFFF' : 'transparent', color: active ? '#006D37' : '#000000', fontFamily: 'Pretendard, sans-serif', fontWeight: active ? 600 : 400, fontSize: 14, border: 'none', cursor: 'pointer', transition: 'background-color 0.18s, color 0.18s', flexShrink: 0 }}>
              {label}
            </button>
          );
        })}
      </div>

      {mainTab === 'stats' && (
        <>
          {/* 주간/월간/연간 탭 */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', marginBottom: 20 }}>
              {PERIOD_TABS.map(({ key, label }) => {
                const active = periodTab === key;
                return (
                  <button key={key} onClick={() => setPeriodTab(key)} style={{ width: 70, height: 26, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer', padding: '0 0 4px 0', boxSizing: 'border-box' }}>
                    <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: active ? 700 : 400, fontSize: 14, color: active ? '#006D37' : '#94A3B8', lineHeight: 1 }}>{label}</span>
                    {active && <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 28, height: 2, backgroundColor: '#006D37', borderRadius: 1 }} />}
                  </button>
                );
              })}
          </div>

          {/* 주간 */}
          {periodTab === 'weekly' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <DayChart weeklyData={weeklyData} />
              <WeekCompareCard data={compareData} />
              <InfoCards topCategory={topCategory} peerRank={MOCK_PEER_RANK} />
            </div>
          )}

          {/* 월간 */}
          {periodTab === 'monthly' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <BudgetUsageCard spent={spent} budgetTotal={budgetTotal} />
              <TopCategoriesCard categories={monthlyByCategory} />
              <MonthlyInfoCards
                fixedExpense={MOCK_FIXED_EXPENSE}
                grade={grade}
                peerRank={MOCK_PEER_RANK}
              />
            </div>
          )}

          {/* 연간 */}
          {periodTab === 'yearly' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <YearlyFlowCard expenses={expenses} />
              <YearlySummaryCard expenses={expenses} />
              <YearlyMiniCards expenses={expenses} />
              <YearlyShareCard />
            </div>
          )}
        </>
      )}

      {mainTab === 'ai' && (
        <div style={{ marginTop: 80, display: 'flex', justifyContent: 'center', fontFamily: 'Pretendard, sans-serif', fontSize: 14, color: '#94A3B8' }}>
          AI 피드백 준비 중이에요
        </div>
      )}
    </div>
  );
}
