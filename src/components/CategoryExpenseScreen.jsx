import { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, Utensils, Ticket, Bus, ShoppingBag } from 'lucide-react';
import reactionImg from '../assets/reaction_character.png';
import { getWeeklyReport } from '../api/reports';

// ── 카테고리 설정: 아이콘 + 프로그레스 그라데이션 (오른쪽으로 갈수록 진해짐) ──
const CATEGORY_CONFIG = [
  { key: '식비',   Icon: Utensils,    color: '#1CD1A1', gradient: 'linear-gradient(90deg, #CDF8E6 0%, #1CD1A1 100%)' },
  { key: '문화비', Icon: Ticket,      color: '#FCD644', gradient: 'linear-gradient(90deg, #FCF6C8 0%, #FCD644 100%)' },
  { key: '교통비', Icon: Bus,         color: '#90BAFF', gradient: 'linear-gradient(90deg, #DCE9FF 0%, #90BAFF 100%)' },
  { key: '기타',   Icon: ShoppingBag, color: '#B78CF7', gradient: 'linear-gradient(90deg, #EFE4FF 0%, #B78CF7 100%)' },
];

// 지출 카테고리명 → 화면 카테고리 그룹 매핑
function groupOf(name) {
  if (name === '식비' || name === '카페') return '식비';
  if (name?.startsWith('문화')) return '문화비';
  if (name === '교통') return '교통비';
  return '기타';
}

// 이번 주 월요일~일요일 범위 계산
function getThisWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0=일 ~ 6=토
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

function fmtPeriod(monday, sunday) {
  const pad = n => String(n).padStart(2, '0');
  return `${pad(monday.getMonth() + 1)}.${pad(monday.getDate())}(월) ~ ${pad(sunday.getMonth() + 1)}.${pad(sunday.getDate())}(일)`;
}

export default function CategoryExpenseScreen({ expenses = [], onBack }) {
  const { monday, sunday } = getThisWeekRange();

  // 명세: GET /reports/weekly의 categoryExpenses — 실패 시 로컬 expenses로 근사 계산
  const [weeklyReport, setWeeklyReport] = useState(null);
  useEffect(() => {
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    getWeeklyReport(dateStr).then(setWeeklyReport).catch(() => {});
  }, []);

  // 이번 주 지출을 카테고리 그룹별로 합산
  const stats = useMemo(() => {
    const sums = { 식비: 0, 문화비: 0, 교통비: 0, 기타: 0 };
    if (weeklyReport?.categoryExpenses) {
      weeklyReport.categoryExpenses.forEach(c => {
        sums[groupOf(c.categoryName)] += c.amount || 0;
      });
    } else {
      expenses.forEach(e => {
        const d = new Date(e.expense_date);
        if (d >= monday && d <= sunday) {
          sums[groupOf(e.category)] += e.amount || 0;
        }
      });
    }
    const total = Object.values(sums).reduce((a, b) => a + b, 0);
    return { sums, total };
  }, [weeklyReport, expenses, monday, sunday]);

  return (
    <div
      className="bg-white"
      style={{ width: '390px', minHeight: '930px', position: 'relative' }}
    >
      {/* 뒤로가기 */}
      <button
        onClick={onBack}
        className="active:scale-90 transition-transform"
        style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', cursor: 'pointer', padding: 4, zIndex: 2 }}
      >
        <ArrowLeft size={22} color="#1A1A1A" />
      </button>

      {/* 헤더 */}
      <p
        style={{
          position: 'absolute',
          top: '20px',
          left: 0,
          right: 0,
          fontFamily: 'Pretendard, sans-serif',
          fontSize: '24px',
          fontWeight: 600,
          color: '#1A1A1A',
          textAlign: 'center',
        }}
      >
        카테고리별 지출
      </p>

      {/* 서브타이틀 */}
      <p
        style={{
          position: 'absolute',
          top: '59px',
          left: 0,
          right: 0,
          fontFamily: 'Pretendard, sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          color: '#999999',
          textAlign: 'center',
        }}
      >
        이번 주 지출 금액과 비율을 한눈에 확인해 보세요
      </p>

      {/* 기간 표시 pill */}
      <div
        style={{
          position: 'absolute',
          top: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          minWidth: '154px',
          height: '29px',
          borderRadius: '100px',
          backgroundColor: '#E8F8EF',
          padding: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 500, color: '#1CD1A1', whiteSpace: 'nowrap' }}>
          {fmtPeriod(monday, sunday)}
        </span>
      </div>

      {/* 카테고리별 지출 카드 */}
      <div
        style={{
          position: 'absolute',
          top: '145px',
          left: '20px',
          width: '353px',
          height: '452px',
          borderRadius: '20px',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        {CATEGORY_CONFIG.map(({ key, Icon, color, gradient }, i) => {
          const amount = stats.sums[key];
          const pct = stats.total > 0 ? Math.round((amount / stats.total) * 100) : 0;
          const top = 32 + i * 105; // 첫 항목 y246(카드 기준 32), 항목 간 105px 간격
          return (
            <div key={key}>
              {/* 아이콘 */}
              <div
                style={{
                  position: 'absolute',
                  top: `${top}px`,
                  left: '20px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: `${color}26`, // 15% 틴트
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={17} color={color} strokeWidth={2} />
              </div>

              {/* 카테고리명 + 금액 */}
              <div style={{ position: 'absolute', top: `${top - 3}px`, left: '62px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '18px', fontWeight: 600, color: '#000000' }}>
                  {key}
                </span>
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 500, color: '#999999' }}>
                  {amount.toLocaleString('ko-KR')}원
                </span>
              </div>

              {/* 비율 % */}
              <span
                style={{
                  position: 'absolute',
                  top: `${top + 7}px`,
                  right: '20px',
                  fontFamily: 'Pretendard, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#000000',
                }}
              >
                {pct}%
              </span>

              {/* 프로그레스 바 */}
              <div
                style={{
                  position: 'absolute',
                  top: `${top + 61}px`,
                  left: '20px',
                  width: '313px',
                  height: '12px',
                  borderRadius: '9999px',
                  backgroundColor: '#F4F4F4',
                  overflow: 'hidden',
                }}
              >
                {pct > 0 && (
                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: '9999px', background: gradient }} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 리액션 캐릭터 + 말풍선 */}
      {(() => {
        // 이번 주 지출 1위 카테고리
        const topKey = stats.total > 0
          ? Object.entries(stats.sums).reduce((a, b) => (a[1] >= b[1] ? a : b))[0]
          : null;
        return (
          // 카드 아래 전용 공간 (카드 끝 y597 이후)
          <div>
            {/* 말풍선 */}
            <div style={{ position: 'absolute', top: '620px', right: '20px' }}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '10px 16px',
                  whiteSpace: 'pre-line',
                  textAlign: 'center',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
                }}
              >
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', fontWeight: 500, color: '#555555', lineHeight: 1.4 }}>
                  {topKey
                    ? `${topKey} 지출이 가장 많았네!\n계획대로 잘 하고 있어`
                    : '이번 주 지출이 아직 없어!\n계획대로 잘 하고 있어'}
                </span>
              </div>
              {/* 꼬리 — 캐릭터 방향(아래) */}
              <div style={{ position: 'absolute', bottom: '-8px', right: '48px', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '8px solid #FFFFFF' }} />
            </div>
            {/* 캐릭터 */}
            <img
              src={reactionImg}
              alt="리액션 캐릭터"
              draggable={false}
              style={{ position: 'absolute', top: '690px', left: '212px', width: '144px', height: '144px', objectFit: 'contain' }}
            />
          </div>
        );
      })()}
    </div>
  );
}
