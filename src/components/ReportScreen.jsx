import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import CategoryIcon from './CategoryIcons';

const DAYS_KR  = ['월', '화', '수', '목', '금', '토', '일'];
const DAY_MAP  = ['일', '월', '화', '수', '목', '금', '토'];
const MOCK_PEER_RANK = 23;

const BAR_H    = 125;
const BAR_W    = 24;
const Y_AXIS_W = 30;

const PERIOD_TABS = [
  { key: 'weekly',  label: '주간' },
  { key: 'monthly', label: '월간' },
  { key: 'yearly',  label: '연간' },
];

// ── 날짜 헬퍼 ───────────────────────────────────────────────────────────────

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 이번 주(월~일) 또는 n주 전 범위 반환 */
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

// ── 계산 함수 ───────────────────────────────────────────────────────────────

function computeWeeklyData(expenses) {
  const { monday, sunday } = getWeekBounds(0);
  const data = { '월': 0, '화': 0, '수': 0, '목': 0, '금': 0, '토': 0, '일': 0 };
  expenses.forEach(e => {
    if (!e.expense_date || !/^\d{4}-\d{2}-\d{2}$/.test(e.expense_date)) return;
    const date = parseDate(e.expense_date);
    if (date >= monday && date <= sunday) {
      const krIdx = (date.getDay() + 6) % 7; // Mon=0 … Sun=6
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
  expenses.forEach(e => {
    if (e.name) catMap[e.name] = (catMap[e.name] || 0) + e.amount;
  });
  const entries = Object.entries(catMap);
  if (entries.length === 0) return { name: '-' };
  return { name: entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0] };
}

/** 이번 달 카테고리별 합산 (내림차순) */
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

// ── 서브 컴포넌트 ────────────────────────────────────────────────────────────

function BarRow({ label, pct, amount }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 30, borderRadius: 9999, backgroundColor: '#F3F4F5', overflow: 'hidden', position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${pct}%`,
          background: 'linear-gradient(to right, rgba(46,204,113,0.1), rgba(46,204,113,1))',
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
      width: 353, height: 249, backgroundColor: '#FFFFFF',
      borderRadius: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      padding: 24, boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
    }}>
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 14, color: '#000000', display: 'block', marginBottom: 22 }}>
        지난주 대비 지출 비교
      </span>

      <BarRow label="지난주" pct={lastPct} amount={fmt(lastWeek)} />
      <div style={{ height: 14 }} />
      <BarRow label="이번주" pct={thisPct} amount={fmt(thisWeek)} />

      <div style={{ flex: 1 }} />
      <div style={{ height: 1, backgroundColor: '#F3F4F5', marginBottom: 16 }} />

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 12, color: '#000000' }}>
            소비 변화
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 14, color: '#006D37' }}>
              지난주 대비
            </span>
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 20, color: isUp ? '#EF4444' : '#006D37' }}>
              {lastWeek === 0 && thisWeek === 0 ? '-' : changeStr}
            </span>
          </div>
        </div>
        {isUp
          ? <TrendingUp  size={24} color="#EF4444" strokeWidth={2} />
          : <TrendingDown size={24} color="#006D37" strokeWidth={2} />
        }
      </div>
    </div>
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

function InfoCards({ topCategory, peerRank }) {
  const fillWidth = Math.round(((100 - peerRank) / 100) * 126);
  return (
    <div style={{ display: 'flex', gap: 19, width: 353 }}>
      {/* 지출 1위 항목 */}
      <div style={{
        width: 167, height: 135, borderRadius: 32,
        backgroundColor: '#F3F4F5', padding: 20, boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          backgroundColor: 'rgba(239,68,68,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CategoryIcon name={topCategory.name} width={18} height={16} color="#EF4444" />
        </div>
        <div>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 12, color: '#000000', margin: 0, marginBottom: 4 }}>
            지출 1위 항목
          </p>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 18, color: '#EF4444', margin: 0 }}>
            {topCategory.name}
          </p>
        </div>
      </div>

      {/* 또래 소비 순위 */}
      <div style={{
        width: 167, height: 135, borderRadius: 32,
        backgroundColor: '#F3F4F5', padding: 20, boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <PeopleIcon />
        <div>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 12, color: '#000000', margin: 0 }}>
            또래 소비 순위
          </p>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 18, color: '#000000', margin: 0, marginBottom: 6 }}>
            상위 {peerRank}%
          </p>
          <div style={{ width: 126, height: 6, borderRadius: 9999, backgroundColor: '#E2E8F0', overflow: 'hidden' }}>
            <div style={{ width: fillWidth, height: 6, borderRadius: 9999, backgroundColor: '#059669' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DayChart({ weeklyData }) {
  const todayKr   = DAY_MAP[new Date().getDay()];
  const values    = Object.values(weeklyData);
  const maxVal    = Math.max(...values, 1);
  const hasData   = values.some(v => v > 0);
  const maxDay    = hasData
    ? Object.entries(weeklyData).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
    : null;

  // Y축: 최댓값을 5만 단위로 올림, 최소 5만
  const MAX_CHART = Math.max(Math.ceil(maxVal / 50000) * 50000, 50000);
  const yStep     = MAX_CHART / 4;
  const fmtY      = v => v >= 10000 ? `${v / 10000}만` : `${v / 1000}천`;
  const Y_LABELS  = [4, 3, 2, 1].map(i => fmtY(yStep * i));

  return (
    <div style={{
      width: 353, backgroundColor: '#FFFFFF', borderRadius: 20,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: 19, boxSizing: 'border-box',
    }}>
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 16, color: '#000000', display: 'block' }}>
        요일별 지출 그래프
      </span>
      <div style={{ height: 6 }} />
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 24, color: '#000000', display: 'block' }}>
        {todayKr}요일
      </span>
      <div style={{ height: 4 }} />
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 10, color: '#9F9FA3', display: 'block' }}>
        {hasData ? `이번 주 최대 소비: ${maxDay}요일` : '이번 주 소비 내역이 없어요'}
      </span>
      <div style={{ height: 18 }} />

      {/* 차트 */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {/* Y축 */}
        <div style={{ width: Y_AXIS_W, height: BAR_H, position: 'relative', flexShrink: 0 }}>
          {Y_LABELS.map((label, i) => (
            <span key={label} style={{
              position: 'absolute',
              top: i === 0 ? 0 : `${i * 25}%`,
              right: 4,
              transform: i === 0 ? 'none' : 'translateY(-50%)',
              fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 10,
              color: '#828282', lineHeight: 1, whiteSpace: 'nowrap',
            }}>
              {label}
            </span>
          ))}
        </div>

        {/* 바 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: BAR_H, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            {DAYS_KR.map(day => {
              const amount    = weeklyData[day] || 0;
              const barHeight = Math.round((Math.min(amount, MAX_CHART) / MAX_CHART) * BAR_H);
              return (
                <div key={day} style={{
                  width: BAR_W, height: BAR_H,
                  backgroundColor: 'rgba(46,204,113,0.2)',
                  borderRadius: 5, flexShrink: 0, display: 'flex', alignItems: 'flex-end',
                }}>
                  {barHeight > 0 && (
                    <div style={{ width: BAR_W, height: barHeight, backgroundColor: '#2ECC71', borderRadius: 5 }} />
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {DAYS_KR.map(day => (
              <span key={day} style={{
                width: BAR_W, textAlign: 'center',
                fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 10,
                color: '#828282', flexShrink: 0, display: 'block',
              }}>
                {day}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 14 }} />
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 10, color: '#9F9FA3', display: 'block', textAlign: 'left' }}>
        소비내역 기반 데이터
      </span>
    </div>
  );
}

/** 이번 달 카테고리별 지출 카드 */
function MonthlyCategoryCard({ categories }) {
  const total = categories.reduce((s, c) => s + c.amount, 0);
  if (categories.length === 0) {
    return (
      <div style={{
        width: 353, backgroundColor: '#FFFFFF', borderRadius: 20,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: 24, boxSizing: 'border-box',
        display: 'flex', justifyContent: 'center',
        fontFamily: 'Pretendard, sans-serif', fontSize: 14, color: '#94A3B8',
      }}>
        이번 달 소비 내역이 없어요
      </div>
    );
  }
  return (
    <div style={{
      width: 353, backgroundColor: '#FFFFFF', borderRadius: 20,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: 24, boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 14, color: '#000000' }}>
        이번 달 카테고리별 지출
      </span>
      {categories.map(({ name, amount }) => {
        const pct = total > 0 ? (amount / total) * 100 : 0;
        const fmt = v => (v / 10000).toFixed(1) + '만';
        return (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              backgroundColor: '#F3F4F5',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <CategoryIcon name={name} width={16} height={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 12, color: '#111827' }}>{name}</span>
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 12, color: '#006D37' }}>{fmt(amount)}</span>
              </div>
              <div style={{ height: 6, borderRadius: 9999, backgroundColor: '#F3F4F5', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: 6, borderRadius: 9999, backgroundColor: '#2ECC71' }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 메인 ────────────────────────────────────────────────────────────────────

export default function ReportScreen({ expenses = [] }) {
  const [mainTab,   setMainTab]   = useState('stats');
  const [periodTab, setPeriodTab] = useState('weekly');

  const weeklyData     = useMemo(() => computeWeeklyData(expenses),        [expenses]);
  const compareData    = useMemo(() => computeWeekCompare(expenses),       [expenses]);
  const topCategory    = useMemo(() => computeTopCategory(expenses),       [expenses]);
  const monthlyByCategory = useMemo(() => computeMonthlyByCategory(expenses), [expenses]);

  return (
    <div style={{
      minHeight: '100%', paddingLeft: 20, paddingRight: 17,
      paddingBottom: 100, boxSizing: 'border-box',
    }}>
      {/* 제목 */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 20, color: '#111827', margin: 0 }}>
          리포트
        </h1>
      </div>

      {/* 소비 통계 / AI 피드백 토글 */}
      <div style={{
        width: 353, height: 48, borderRadius: 9999,
        backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center',
        padding: '6px', boxSizing: 'border-box', marginBottom: 24,
      }}>
        {[{ key: 'stats', label: '소비 통계' }, { key: 'ai', label: 'AI 피드백' }].map(({ key, label }) => {
          const active = mainTab === key;
          return (
            <button key={key} onClick={() => setMainTab(key)} style={{
              width: 170, height: 36, borderRadius: 9999,
              backgroundColor: active ? '#FFFFFF' : 'transparent',
              color: active ? '#006D37' : '#000000',
              fontFamily: 'Pretendard, sans-serif', fontWeight: active ? 600 : 400,
              fontSize: 14, border: 'none', cursor: 'pointer',
              transition: 'background-color 0.18s, color 0.18s', flexShrink: 0,
            }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* 소비 통계 탭 */}
      {mainTab === 'stats' && (
        <>
          {/* 주간/월간/연간 탭 */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, marginLeft: -20, marginRight: -17 }}>
            <div style={{ width: 211, height: 26, display: 'flex', alignItems: 'flex-end' }}>
              {PERIOD_TABS.map(({ key, label }) => {
                const active = periodTab === key;
                return (
                  <button key={key} onClick={() => setPeriodTab(key)} style={{
                    width: 55, height: 26, position: 'relative',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    padding: '0 0 4px 0', boxSizing: 'border-box',
                  }}>
                    <span style={{
                      fontFamily: 'Pretendard, sans-serif', fontWeight: active ? 700 : 400,
                      fontSize: 14, color: active ? '#006D37' : '#94A3B8', lineHeight: 1,
                    }}>{label}</span>
                    {active && (
                      <div style={{
                        position: 'absolute', bottom: 0, left: '50%',
                        transform: 'translateX(-50%)', width: 28, height: 2,
                        backgroundColor: '#006D37', borderRadius: 1,
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 주간 콘텐츠 */}
          {periodTab === 'weekly' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <DayChart weeklyData={weeklyData} />
              <WeekCompareCard data={compareData} />
              <InfoCards topCategory={topCategory} peerRank={MOCK_PEER_RANK} />
            </div>
          )}

          {/* 월간 콘텐츠 */}
          {periodTab === 'monthly' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <MonthlyCategoryCard categories={monthlyByCategory} />
            </div>
          )}

          {/* 연간 콘텐츠 */}
          {periodTab === 'yearly' && (
            <div style={{ marginTop: 80, display: 'flex', justifyContent: 'center', fontFamily: 'Pretendard, sans-serif', fontSize: 14, color: '#94A3B8' }}>
              연간 통계 준비 중이에요
            </div>
          )}
        </>
      )}

      {/* AI 피드백 탭 */}
      {mainTab === 'ai' && (
        <div style={{ marginTop: 80, display: 'flex', justifyContent: 'center', fontFamily: 'Pretendard, sans-serif', fontSize: 14, color: '#94A3B8' }}>
          AI 피드백 준비 중이에요
        </div>
      )}
    </div>
  );
}
