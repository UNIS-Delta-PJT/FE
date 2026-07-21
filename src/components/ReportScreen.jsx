import { useState, useMemo, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import CategoryIcon from './CategoryIcons';
import CalendarView from './CalendarView';
import celebrationImg from '../assets/icon_celebration.png';
import monthlyMascotImg from '../assets/budget_complete_character.png';
import { getWeeklyReport, getMonthlyReport, getAnnualReport } from '../api/reports';

// ── 상수 ─────────────────────────────────────────────────────────────────────
const DAYS_KR  = ['월', '화', '수', '목', '금', '토', '일'];
const DAY_MAP  = ['일', '월', '화', '수', '목', '금', '토'];
const DOW_TO_KR = { MON: '월', TUE: '화', WED: '수', THU: '목', FRI: '금', SAT: '토', SUN: '일' };
const FALLBACK_PEER_RANK = 23; // 서버 응답이 없을 때만 사용하는 대체값

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

// ── 공통 아이콘 ───────────────────────────────────────────────────────────────
function PeopleIcon() {
  return (
    <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
      <circle cx="8.5"  cy="7"   r="4" fill="#1CD1A1" opacity="0.55" />
      <path d="M1,23 C1,18.9 4.4,15.5 8.5,15.5 C10.5,15.5 12.3,16.3 13.6,17.5" fill="#1CD1A1" opacity="0.55" />
      <circle cx="23.5" cy="7"   r="4" fill="#1CD1A1" opacity="0.55" />
      <path d="M32,23 C32,18.9 28.6,15.5 24.5,15.5 C22.5,15.5 20.6,16.3 19.3,17.5" fill="#1CD1A1" opacity="0.55" />
      <circle cx="16"   cy="5.5" r="5" fill="#1CD1A1" />
      <path d="M7,23 C7,18.4 11,14.5 16,14.5 C21,14.5 25,18.4 25,23" fill="#1CD1A1" />
    </svg>
  );
}

// ── 주간 컴포넌트 ─────────────────────────────────────────────────────────────

function BarRow({ label, pct, amount, gradient }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 30, borderRadius: 9999, backgroundColor: '#F4F4F4', overflow: 'hidden', position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${pct}%`,
          background: gradient,
          borderRadius: 9999,
        }} />
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 12, color: '#000000',
        }}>
          {label}
        </span>
      </div>
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 12, color: '#999999', width: 44, textAlign: 'right', flexShrink: 0 }}>
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

      {/* 지난주: 옐로 그라데이션 (80% 지점까지) */}
      <BarRow label="지난주" pct={lastPct} amount={fmt(lastWeek)} gradient="linear-gradient(90deg, #FCED44 0%, #FCD644 80%)" />
      <div style={{ height: 14 }} />
      {/* 이번주: 그린 그라데이션 */}
      <BarRow label="이번주" pct={thisPct} amount={fmt(thisWeek)} gradient="linear-gradient(90deg, #CDF8E6 0%, #34E8B6 100%)" />

      <div style={{ flex: 1 }} />
      <div style={{ height: 1, backgroundColor: '#F4F4F4', margin: '16px 0' }} />

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 12, color: '#000000' }}>소비 변화</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 14, color: '#1CD1A1' }}>지난주 대비</span>
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 20, color: isUp ? '#EF4444' : '#1CD1A1' }}>
              {lastWeek === 0 && thisWeek === 0 ? '-' : changeStr}
            </span>
          </div>
        </div>
        {isUp
          ? <TrendingUp  size={24} color="#EF4444" strokeWidth={2} />
          : <TrendingDown size={24} color="#1CD1A1" strokeWidth={2} />}
      </div>
    </div>
  );
}

function InfoCards({ topCategory, peerRank }) {
  const fillWidth = Math.round(((100 - peerRank) / 100) * 126);
  return (
    <div style={{ display: 'flex', gap: 19, width: 353 }}>
      <div style={{ width: 167, height: 135, borderRadius: 32, backgroundColor: '#F4F4F4', padding: 20, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CategoryIcon name={topCategory.name} width={18} height={16} color="#EF4444" />
        </div>
        <div>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 12, color: '#000000', margin: '0 0 4px 0' }}>지출 1위 항목</p>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 18, color: '#EF4444', margin: 0 }}>{topCategory.name}</p>
        </div>
      </div>
      <div style={{ width: 167, height: 135, borderRadius: 32, backgroundColor: '#F4F4F4', padding: 20, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <PeopleIcon />
        <div>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 12, color: '#000000', margin: 0 }}>또래 소비 순위</p>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 18, color: '#000000', margin: '0 0 6px 0' }}>상위 {peerRank}%</p>
          <div style={{ width: 126, height: 6, borderRadius: 9999, backgroundColor: '#EAEAEA', overflow: 'hidden' }}>
            <div style={{ width: fillWidth, height: 6, borderRadius: 9999, backgroundColor: '#1CD1A1' }} />
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
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 24, color: '#000000', display: 'block' }}>{todayKr}요일</span>
      <div style={{ height: 4 }} />
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 12, color: '#1CD1A1', display: 'block' }}>
        {hasData ? `이번 주 최대 소비: ${maxDay}요일` : '이번 주 소비 내역이 없어요'}
      </span>
      <div style={{ height: 18 }} />
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ width: Y_AXIS_W, height: BAR_H, position: 'relative', flexShrink: 0 }}>
          {Y_LABELS.map((label, i) => (
            <span key={label} style={{ position: 'absolute', top: i === 0 ? 0 : `${i * 25}%`, right: 4, transform: i === 0 ? 'none' : 'translateY(-50%)', fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 10, color: '#999999', lineHeight: 1, whiteSpace: 'nowrap' }}>
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
                <div key={day} style={{ width: BAR_W, height: BAR_H, backgroundColor: 'rgba(28,209,161,0.2)', borderRadius: 5, flexShrink: 0, display: 'flex', alignItems: 'flex-end' }}>
                  {barHeight > 0 && <div style={{ width: BAR_W, height: barHeight, backgroundColor: '#1CD1A1', borderRadius: 5 }} />}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {DAYS_KR.map(day => (
              <span key={day} style={{ width: BAR_W, textAlign: 'center', fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 10, color: '#999999', flexShrink: 0, display: 'block' }}>
                {day}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ height: 14 }} />
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 10, color: '#999999', display: 'block' }}>소비내역 기반 데이터</span>
    </div>
  );
}

// ── 월간 컴포넌트 ─────────────────────────────────────────────────────────────

/**
 * 원형 예산 소진율 링 (SVG stroke + strokeLinecap="round")
 * - linearGradient: 12시(#D6F7EE 연) → 6시(#1CD1A1 진) 방향으로 자연스러운 그라데이션
 * - strokeLinecap="round": 양 끝 자연스럽게 둥글게
 * - 중앙: "남은 금액" 라벨 + 남은 금액
 */
function BudgetRing({ pct, size = 140, remaining = 0 }) {
  const clamped = Math.min(Math.max(pct, 0), 100);
  const cx      = size / 2;
  const cy      = size / 2;
  const stroke  = Math.round(size * 0.13) - 3; // 3px 더 얇게
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
            <stop offset="0%"   stopColor="#D0F8E7" />
            <stop offset="100%" stopColor="#34E8B6" />
          </linearGradient>
        </defs>

        {/* 트랙 */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#EAEAEA"
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
          fontSize: labelSize, color: '#999999', lineHeight: 1,
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

// 순위별 프로그레스 바 색상
const RANK_BAR_COLORS = ['#34E8B6', '#FF7682', '#F5C308'];

// categories: [{ name, amount, percentage? }] — percentage가 있으면(서버 리포트) 그대로 사용,
// 없으면(로컬 폴백) top3 합계 대비 비율로 근사 계산
function TopCategoriesCard({ categories }) {
  const top3  = categories.slice(0, 3);
  const localTotal = categories.reduce((s, c) => s + c.amount, 0);
  const fmt   = v => (v / 10000).toFixed(1) + '만';

  return (
    <div style={{ width: 353, backgroundColor: '#FFFFFF', borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '20px 22px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 0 }}>
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 14, color: '#000000', display: 'block', marginBottom: 20 }}>
        어디에 가장 많이 썼을까?
      </span>

      {top3.length === 0 ? (
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 13, color: '#999999', textAlign: 'center', paddingBottom: 8 }}>이번 달 소비 내역이 없어요</span>
      ) : top3.map(({ name, amount, percentage }, i) => {
        const pct = percentage ?? (localTotal > 0 ? (amount / localTotal) * 100 : 0);
        return (
          <div key={name} style={{ marginBottom: i < top3.length - 1 ? 16 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 11, color: '#999999', minWidth: 12 }}>{i + 1}</span>
                <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: '#F4F4F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CategoryIcon name={name} width={13} height={13} />
                </div>
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 13, color: '#1A1A1A' }}>{name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 11, color: '#999999' }}>{fmt(amount)}</span>
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 12, color: '#1CD1A1' }}>{pct.toFixed(1)}%</span>
              </div>
            </div>
            <div style={{ height: 7, borderRadius: 9999, background: '#F4F4F4', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 9999, background: RANK_BAR_COLORS[i], transition: 'width 0.4s ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 이번 달 가장 큰 지출 TOP 3 ────────────────────────────────────────────────

// TOP 순위 배지 색상 (배경 15% / 텍스트 100%)
const TOP_BADGE_COLORS = ['#FF7682', '#F5C308', '#2DE1B0'];

// 소비처 아바타 색상 (로고 이미지 확보 전 이니셜 아바타 — TODO: 브랜드 로고 교체)
const MERCHANT_AVATAR_COLORS = ['#FF7682', '#90BAFF', '#F5C308', '#B78CF7', '#34E8B6'];

const DAY_KR = ['일', '월', '화', '수', '목', '금', '토'];

function fmtDateWithDay(d) {
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}.${pad(d.getDate())}(${DAY_KR[d.getDay()]})`;
}

// items가 주어지면(서버 월간 리포트의 topExpenses) 그대로 사용, 없으면 로컬 expenses에서 계산
function TopExpensesCard({ expenses, items }) {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last  = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // 이번 달 지출 상위 3건
  const top3 = items ?? expenses
    .filter(e => e.expense_date?.startsWith(ym))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  return (
    <div style={{ width: 353, height: 318, backgroundColor: '#FFFFFF', borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '24px 22px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 18, color: '#000000', display: 'block' }}>
        이번 달 가장 큰 지출 TOP 3
      </span>
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 12, color: '#9A9A9A', display: 'block', marginTop: 4, marginBottom: 20 }}>
        {fmtDateWithDay(first)} - {fmtDateWithDay(last)}
      </span>

      {top3.length === 0 ? (
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 13, color: '#999999', textAlign: 'center', paddingTop: 40 }}>
          이번 달 소비 내역이 없어요
        </span>
      ) : top3.map((e, i) => {
        const d = new Date(e.expense_date);
        const pad = n => String(n).padStart(2, '0');
        const badgeColor = TOP_BADGE_COLORS[i];
        const avatarColor = MERCHANT_AVATAR_COLORS[i % MERCHANT_AVATAR_COLORS.length];
        return (
          <div key={e.expense_id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < top3.length - 1 ? 20 : 0 }}>
            {/* 소비처 아이콘/로고 (40x40) — TODO: 브랜드 로고 이미지로 교체 */}
            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: `${avatarColor}26`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 16, color: avatarColor }}>
                {(e.place || e.category || '?').charAt(0)}
              </span>
            </div>

            {/* 소비처 + 카테고리/날짜 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 16, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {e.place || e.category}
              </span>
              <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 12, color: '#999999' }}>
                {e.category || e.name} • {pad(d.getMonth() + 1)}.{pad(d.getDate())}
              </span>
            </div>

            {/* 금액 + TOP 배지 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
              <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 16, color: '#333333' }}>
                -{e.amount.toLocaleString('ko-KR')}원
              </span>
              <div style={{ width: 55, height: 20, borderRadius: 10, padding: '0 10px', backgroundColor: `${badgeColor}26`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 11, color: badgeColor, whiteSpace: 'nowrap' }}>
                  TOP {i + 1}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 월간 하단 마스코트 (지난달 대비 절약 멘트) ────────────────────────────────
// comparison이 주어지면(서버 월간 리포트의 lastMonthComparison) 그대로 사용,
// 없으면 로컬 expenses에서 같은 기간(1일~오늘 일자) 비교로 근사 계산
function MonthlySavingMascot({ expenses, comparison }) {
  const now = new Date();
  const day = now.getDate();

  let message;
  if (comparison) {
    const { changeAmount } = comparison; // 음수: 절약, 양수: 더 지출
    message = changeAmount <= 0
      ? `지난달보다 ${Math.abs(changeAmount).toLocaleString('ko-KR')}원 덜 썼어요!`
      : `지난달보다 ${changeAmount.toLocaleString('ko-KR')}원 더 썼어요!`;
  } else {
    // 이번 달/지난달 같은 기간(1일~오늘 일자) 지출 합산
    const sumRange = (year, month) => {
      return expenses.reduce((sum, e) => {
        const d = new Date(e.expense_date);
        if (d.getFullYear() === year && d.getMonth() === month && d.getDate() <= day) {
          return sum + (e.amount || 0);
        }
        return sum;
      }, 0);
    };

    const thisMonth = sumRange(now.getFullYear(), now.getMonth());
    const prevDate  = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = sumRange(prevDate.getFullYear(), prevDate.getMonth());
    const diff = lastMonth - thisMonth;
    message = diff >= 0
      ? `지난달 이맘때보다 ${diff.toLocaleString('ko-KR')}원 덜 썼어요!`
      : `지난달 이맘때보다 ${Math.abs(diff).toLocaleString('ko-KR')}원 더 썼어요!`;
  }

  return (
    <div style={{ width: 353, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 24 }}>
      {/* 말풍선 */}
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: '10px 16px', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 500, color: '#555555' }}>
            {message}
          </span>
        </div>
        {/* 꼬리 — 아래 중앙 */}
        <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '8px solid #FFFFFF' }} />
      </div>
      {/* 마스코트 */}
      <img src={monthlyMascotImg} alt="절약 마스코트" draggable={false} style={{ width: 160, height: 160, objectFit: 'contain' }} />
    </div>
  );
}

// ── 연간 컴포넌트 ─────────────────────────────────────────────────────────────

/** 전년 대비 추세 아이콘 (13×8) */
function YearTrendIcon({ color = '#1CD1A1', isUp = false }) {
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

const FALLBACK_PREV_YEAR_TOTAL = 4_800_000; // 서버에서 전년도 리포트를 못 가져왔을 때만 사용

// monthlyTotals/prevYearTotal이 주어지면(서버 연간 리포트) 그대로 사용, 없으면 로컬 expenses로 근사 계산
function YearlyFlowCard({ expenses, monthlyTotals: serverTotals, prevYearTotal }) {
  const LABEL_MONTHS = new Set([0, 2, 4, 6, 8, 11]); // 1·3·5·7·9·12월만 표시
  const MONTH_LABELS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

  const today          = new Date();
  const thisYear       = today.getFullYear();
  const currentMonthIdx = today.getMonth();

  const localTotals = useMemo(() => {
    const totals = Array(12).fill(0);
    expenses.forEach(e => {
      if (!e.expense_date || !/^\d{4}-\d{2}-\d{2}$/.test(e.expense_date)) return;
      const [y, m] = e.expense_date.split('-').map(Number);
      if (y === thisYear) totals[m - 1] += e.amount;
    });
    return totals;
  }, [expenses, thisYear]);
  const monthlyTotals = serverTotals ?? localTotals;

  const thisYearTotal = monthlyTotals.reduce((s, v) => s + v, 0);
  const prevTotal = prevYearTotal ?? FALLBACK_PREV_YEAR_TOTAL;
  const rawChange = prevTotal > 0
    ? ((thisYearTotal - prevTotal) / prevTotal) * 100
    : 0;
  const isUp       = rawChange > 0;
  const changeAbs  = Math.abs(rawChange).toFixed(1);
  const changeColor = isUp ? '#EF4444' : '#1CD1A1';

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
                backgroundColor: isCurrent ? '#1CD1A1' : '#E8FAF6',
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

// summary가 주어지면(서버 연간 리포트의 annualSummary) 그대로 사용, 없으면 로컬 expenses로 근사 계산
function YearlySummaryCard({ expenses, summary }) {
  const today    = new Date();
  const thisYear = today.getFullYear();
  const MONTH_LABELS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const toLabel = (ym) => ym ? `${parseInt(ym.split('-')[1], 10)}월` : '-';

  const monthlyTotals = useMemo(() => {
    const totals = Array(12).fill(0);
    expenses.forEach(e => {
      if (!e.expense_date || !/^\d{4}-\d{2}-\d{2}$/.test(e.expense_date)) return;
      const [y, m] = e.expense_date.split('-').map(Number);
      if (y === thisYear) totals[m - 1] += e.amount;
    });
    return totals;
  }, [expenses, thisYear]);

  let mostSpendingMonth, mostSavingMonth;
  if (summary) {
    mostSpendingMonth = toLabel(summary.highestSpendingMonth);
    mostSavingMonth = toLabel(summary.lowestSpendingMonth);
  } else {
    const nonZero = monthlyTotals
      .map((val, idx) => ({ val, idx }))
      .filter(({ val }) => val > 0);

    const maxEntry = nonZero.length ? nonZero.reduce((a, b) => a.val > b.val ? a : b) : null;
    const minEntry = nonZero.length ? nonZero.reduce((a, b) => a.val < b.val ? a : b) : null;

    mostSpendingMonth = maxEntry ? MONTH_LABELS[maxEntry.idx] : '-';
    mostSavingMonth   = minEntry ? MONTH_LABELS[minEntry.idx] : '-';
  }

  const Row = ({ dotColor, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: dotColor, flexShrink: 0 }} />
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 14, color: '#FFFFFF' }}>
        {label}&nbsp;<span style={{ fontWeight: 700 }}>{value}</span>
      </span>
    </div>
  );

  // 배경/크기: 기존 "리포트 공유하고 보너스 젬 받기" 카드와 동일 (350x125, #1CD1A1, 폭죽 이미지 포함)
  return (
    <div style={{
      width: 350,
      height: 125,
      borderRadius: 24,
      backgroundColor: '#1CD1A1',
      padding: 20,
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 16, color: '#FFFFFF', margin: 0 }}>
        올해의 소비 요약
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Row dotColor="#FF7682" label="가장 많이 쓴 달:" value={mostSpendingMonth} />
        <Row dotColor="#FCED44" label="가장 절약한 달:" value={mostSavingMonth} />
      </div>

      {/* 폭죽 이미지 — 카드 내 절대 위치 */}
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


// ── 총 절약 금액 카드 ─────────────────────────────────────────────────────────

// 카테고리명 → 아이콘 배경/색상 — 서버가 새 카테고리명을 주면 기본값(회색)으로 표시
const SAVINGS_STYLE = {
  '식비': { iconBg: '#AAF0D1',                 iconColor: '#20A275' },
  '교통': { iconBg: 'rgba(245, 195, 8, 0.25)', iconColor: '#F5C308' },
  '문화': { iconBg: '#FFD1DC',                 iconColor: '#FF7682' },
  '쇼핑': { iconBg: '#DAE8FF',                 iconColor: '#90BAFF' },
};
const DEFAULT_SAVINGS_STYLE = { iconBg: '#EAEAEA', iconColor: '#999999' };

// 서버 미가동 시에만 사용하는 대체 데이터
const FALLBACK_CATEGORY_SAVINGS = [
  { name: '식비', amount: 40000 },
  { name: '교통', amount: 25000 },
  { name: '문화', amount: 30000 },
  { name: '기타', amount: 15000 },
];

// categorySavings가 주어지면(서버 연간 리포트) 그대로 사용
function TotalSavingsCard({ categorySavings }) {
  const items = categorySavings ?? FALLBACK_CATEGORY_SAVINGS;
  const total = items.reduce((s, c) => s + c.amount, 0);

  return (
    <div style={{
      width: 353,
      height: 422,
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      padding: 20,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 16, color: '#1A1A1A', margin: 0 }}>
        총 절약 금액
      </p>
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 14, color: '#1CD1A1', display: 'block', marginTop: 4, marginBottom: 16 }}>
        {total.toLocaleString('ko-KR')}원
      </span>

      {/* 카테고리별 절약 요약 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(({ name, amount }) => {
          const { iconBg, iconColor } = SAVINGS_STYLE[name] || DEFAULT_SAVINGS_STYLE;
          return (
          <div
            key={name}
            style={{
              width: 313,
              height: 72,
              borderRadius: 48,
              backgroundColor: '#F3F4F5',
              padding: 16,
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {/* 카테고리 아이콘 */}
            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CategoryIcon name={name} width={18} height={16} color={iconColor} />
            </div>
            {/* 카테고리명 + 절약 금액 */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>
                {name}
              </span>
              <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 12, color: '#555555' }}>
                {amount.toLocaleString('ko-KR')}원
              </span>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}


// ── 메인 ─────────────────────────────────────────────────────────────────────
export default function ReportScreen({ expenses = [], budgetTotal = 0, spent = 0, onCategoryDetail }) {
  const [periodTab, setPeriodTab] = useState('weekly');
  const rootRef = useRef(null);

  // 명세: GET /reports/weekly, /monthly, /annual — 탭을 처음 열 때 한 번씩 로드, 실패 시 로컬 계산으로 폴백
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [annualReport, setAnnualReport] = useState(null);
  const [prevYearTotal, setPrevYearTotal] = useState(null);

  useEffect(() => {
    if (periodTab === 'weekly' && !weeklyReport) {
      const d = new Date();
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      getWeeklyReport(dateStr).then(setWeeklyReport).catch(() => {});
    }
    if (periodTab === 'monthly' && !monthlyReport) {
      const d = new Date();
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      getMonthlyReport(monthStr).then(setMonthlyReport).catch(() => {});
    }
    if (periodTab === 'yearly' && !annualReport) {
      const year = new Date().getFullYear();
      getAnnualReport(year).then(setAnnualReport).catch(() => {});
      // 전년 대비 계산용 — 실패해도 YearlyFlowCard가 대체값으로 처리
      getAnnualReport(year - 1).then(r => setPrevYearTotal(r?.annualSummary?.totalSpent)).catch(() => {});
    }
  }, [periodTab, weeklyReport, monthlyReport, annualReport]);

  // 주간/월간/연간 탭 전환 시 스크롤 최상단으로 리셋
  useEffect(() => {
    let el = rootRef.current?.parentElement;
    while (el) {
      if (el.scrollTop > 0) { el.scrollTop = 0; break; }
      el = el.parentElement;
    }
  }, [periodTab]);

  // ── 주간 — 서버 리포트 우선, 없으면 로컬 expenses로 근사 계산 ──
  const weeklyData = useMemo(() => {
    if (weeklyReport?.dailyExpenses) {
      const data = { 월: 0, 화: 0, 수: 0, 목: 0, 금: 0, 토: 0, 일: 0 };
      weeklyReport.dailyExpenses.forEach(d => { data[DOW_TO_KR[d.dayOfWeek]] = d.amount; });
      return data;
    }
    return computeWeeklyData(expenses);
  }, [weeklyReport, expenses]);
  const compareData = useMemo(() => {
    if (weeklyReport) {
      return { thisWeek: weeklyReport.weeklyTotalExpense, lastWeek: weeklyReport.lastWeekComparison?.lastWeekTotalExpense ?? 0 };
    }
    return computeWeekCompare(expenses);
  }, [weeklyReport, expenses]);
  const topCategory = useMemo(() => {
    if (weeklyReport?.topCategory) return { name: weeklyReport.topCategory.categoryName };
    return computeTopCategory(expenses);
  }, [weeklyReport, expenses]);
  const peerRank = weeklyReport?.peerRanking?.percentile ?? FALLBACK_PEER_RANK;

  // ── 월간 ──
  const monthlyByCategory = useMemo(() => {
    if (monthlyReport?.topCategories) {
      return monthlyReport.topCategories.map(c => ({ name: c.categoryName, amount: c.amount, percentage: c.percentage }));
    }
    return computeMonthlyByCategory(expenses);
  }, [monthlyReport, expenses]);
  const monthlyTopExpenses = useMemo(() => {
    if (!monthlyReport?.topExpenses) return null;
    return monthlyReport.topExpenses.map(e => ({
      expense_id: e.expenseId,
      place: e.placeName,
      category: e.categoryName,
      amount: e.amount,
      expense_date: e.expenseDate,
    }));
  }, [monthlyReport]);

  // ── 연간 — 지출 캘린더는 명세에 없어 로컬 expenses 기준 유지 ──
  const calendarData = useMemo(() => expenses.reduce((map, e) => {
    map[e.expense_date] = (map[e.expense_date] || 0) + e.amount;
    return map;
  }, {}), [expenses]);
  const annualMonthlyTotals = useMemo(() => {
    if (!annualReport?.monthlyExpenses) return null;
    const totals = Array(12).fill(0);
    annualReport.monthlyExpenses.forEach(m => {
      const idx = parseInt(m.month.split('-')[1], 10) - 1;
      if (idx >= 0 && idx < 12) totals[idx] = m.totalSpent;
    });
    return totals;
  }, [annualReport]);

  return (
    <div ref={rootRef} style={{ minHeight: '100%', paddingLeft: 20, paddingRight: 17, paddingBottom: 0, boxSizing: 'border-box' }}>
      {/* 제목 */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 20, color: '#1A1A1A', margin: 0 }}>리포트</h1>
      </div>

      {/* 주간/월간/연간 탭 */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', marginBottom: 20 }}>
              {PERIOD_TABS.map(({ key, label }) => {
                const active = periodTab === key;
                return (
                  <button key={key} onClick={() => setPeriodTab(key)} style={{ width: 70, height: 26, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer', padding: '0 0 4px 0', boxSizing: 'border-box' }}>
                    <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: active ? 700 : 400, fontSize: 14, color: active ? '#1CD1A1' : '#999999', lineHeight: 1 }}>{label}</span>
                    {active && <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 28, height: 2, backgroundColor: '#1CD1A1', borderRadius: 1 }} />}
                  </button>
                );
              })}
          </div>

          {/* 주간 */}
          {periodTab === 'weekly' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <DayChart weeklyData={weeklyData} />
              <WeekCompareCard data={compareData} />
              <InfoCards topCategory={topCategory} peerRank={peerRank} />
              {/* 카테고리별 지출 전체보기 */}
              <button
                onClick={onCategoryDetail}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  marginBottom: 32,
                  fontFamily: 'Pretendard, sans-serif',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#828282',
                  textAlign: 'left',
                  alignSelf: 'flex-start',
                }}
              >
                카테고리별 지출 전체보기 &gt;
              </button>
            </div>
          )}

          {/* 월간 */}
          {periodTab === 'monthly' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <BudgetUsageCard
                spent={monthlyReport?.totalSpent ?? spent}
                budgetTotal={monthlyReport?.totalExpenseBudget ?? budgetTotal}
              />
              <TopCategoriesCard categories={monthlyByCategory} />
              <TopExpensesCard expenses={expenses} items={monthlyTopExpenses} />
              <MonthlySavingMascot expenses={expenses} comparison={monthlyReport?.lastMonthComparison} />
            </div>
          )}

      {/* 연간 */}
      {periodTab === 'yearly' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16, paddingBottom: 24 }}>
          <YearlyFlowCard expenses={expenses} monthlyTotals={annualMonthlyTotals} prevYearTotal={prevYearTotal} />
          <YearlySummaryCard expenses={expenses} summary={annualReport?.annualSummary} />
          <CalendarView calendarData={calendarData} />
          <TotalSavingsCard categorySavings={annualReport?.categorySavings} />
        </div>
      )}
    </div>
  );
}
