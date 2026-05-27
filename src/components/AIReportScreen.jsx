import { useMemo } from 'react';
import trendUpImg    from '../assets/icon_trend_up.png';
import peerIconImg   from '../assets/icon_peer.png';
import aiGuideIconImg from '../assets/icon_ai_guide.png';

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

// ── 급증 항목 계산 ────────────────────────────────────────────────────────────
// 이번 주 vs 직전 4주 평균을 카테고리별로 비교해 가장 많이 급증한 항목 반환
function computeSpikeData(expenses) {
  const { monday: tm, sunday: ts } = getWeekBounds(0);

  // 직전 4주 (주 단위로 -1 ~ -4)
  const prevWeeks = [-1, -2, -3, -4].map(offset => getWeekBounds(offset));

  const thisWeekCat = {};
  const prevWeeksCat = [{}, {}, {}, {}];

  expenses.forEach(e => {
    if (!e.expense_date || !/^\d{4}-\d{2}-\d{2}$/.test(e.expense_date)) return;
    const date = parseDate(e.expense_date);
    const name = e.name || '기타';

    if (date >= tm && date <= ts) {
      thisWeekCat[name] = (thisWeekCat[name] || 0) + e.amount;
    } else {
      prevWeeks.forEach(({ monday, sunday }, i) => {
        if (date >= monday && date <= sunday) {
          prevWeeksCat[i][name] = (prevWeeksCat[i][name] || 0) + e.amount;
        }
      });
    }
  });

  // 카테고리별 직전 4주 평균 계산
  const allCats = new Set([
    ...Object.keys(thisWeekCat),
    ...prevWeeksCat.flatMap(w => Object.keys(w)),
  ]);

  let bestCategory = null;
  let bestPct = 0;
  let bestThisWeek = 0;
  let bestCatHistory = []; // 5개 바 (직전4주 + 이번주)

  allCats.forEach(cat => {
    const thisW = thisWeekCat[cat] || 0;
    const prevAmounts = prevWeeksCat.map(w => w[cat] || 0);
    const prevAvg = prevAmounts.reduce((s, v) => s + v, 0) / 4;

    if (prevAvg <= 0 && thisW <= 0) return;
    const pct = prevAvg > 0
      ? Math.round(((thisW - prevAvg) / prevAvg) * 100)
      : (thisW > 0 ? 999 : 0);

    if (pct > bestPct) {
      bestPct = pct;
      bestCategory = cat;
      bestThisWeek = thisW;
      bestCatHistory = [...prevAmounts, thisW]; // [4주전, 3주전, 2주전, 1주전, 이번주]
    }
  });

  // 데이터 부족 시 폴백 mock
  if (!bestCategory) {
    return {
      category: '카페',
      pct: 47,
      bars: [18000, 22000, 15000, 32000, 48000],
    };
  }

  return {
    category: bestCategory,
    pct: Math.min(bestPct, 999),
    bars: bestCatHistory,
  };
}

// ── 바 차트 ───────────────────────────────────────────────────────────────────
function SpikeBarChart({ bars }) {
  const maxVal = Math.max(...bars, 1);
  const MAX_H = 48;
  const BAR_W = 24;
  const GAP = 5;

  // 가장 오른쪽(이번 주) = #2ECC71
  // 이번 주 제외한 나머지 중 가장 높은 값 = #FED023
  const maxPrevIdx = bars
    .slice(0, bars.length - 1)
    .reduce((best, v, i) => (v > bars[best] ? i : best), 0);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: GAP }}>
      {bars.map((val, i) => {
        const h = Math.max(4, Math.round((val / maxVal) * MAX_H));
        const isLast = i === bars.length - 1;
        const isHighlightPrev = i === maxPrevIdx;
        const color = isLast ? '#2ECC71' : isHighlightPrev ? '#FED023' : '#E5E7EB';
        return (
          <div
            key={i}
            style={{
              width: BAR_W,
              height: h,
              borderRadius: 6,
              backgroundColor: color,
              flexShrink: 0,
            }}
          />
        );
      })}
    </div>
  );
}

// ── 급증 인사이트 카드 ────────────────────────────────────────────────────────
function SpikeInsightCard({ expenses }) {
  const { category, pct, bars } = useMemo(() => computeSpikeData(expenses), [expenses]);

  return (
    <div
      style={{
        width: 353,
        height: 255,
        borderRadius: 32,
        padding: 32,
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.09)',
        position: 'relative',
        flexShrink: 0,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* ── 컨테이너 1: 인사이트 라벨 + 제목 + 아이콘 ── y:0 (padding 내부) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 47 }}>
        {/* 텍스트 */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 600, color: '#555555', lineHeight: 1 }}>
            인사이트
          </span>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 18, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.2 }}>
            지출 급증 항목
          </span>
        </div>
        {/* 증가 아이콘 박스 */}
        <div
          style={{
            width: 36,
            height: 28,
            borderRadius: 8,
            backgroundColor: 'rgba(255, 218, 214, 0.2)',
            border: '1px solid rgba(186, 26, 26, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <img src={trendUpImg} alt="trend up" style={{ width: 20, height: 14, objectFit: 'contain' }} />
        </div>
      </div>

      {/* ── 컨테이너 2: n% 증가 + 바 차트 ── y:70 (container1 47 + gap 23) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 23 }}>
        {/* n% */}
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 32, fontWeight: 600, color: '#2ECC71', lineHeight: 1, flexShrink: 0 }}>
          {pct}%
        </span>
        {/* 증가 */}
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 16, fontWeight: 500, color: '#555555', flexShrink: 0 }}>
          증가
        </span>
        {/* 바 차트 */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
          <SpikeBarChart bars={bars} />
        </div>
      </div>

      {/* ── 컨테이너 3: 설명 텍스트 ── y:144 (container2 y:70 + 높이48 + gap24) */}
      <div style={{ marginTop: 24 }}>
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 400, color: '#555555', lineHeight: 1.5 }}>
          이번 주{' '}
          <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{category}</span>
          {' '}지출이 평소 평균보다 눈에 띄게 늘어났어요. 주의가 필요해요!
        </span>
      </div>
    </div>
  );
}

// ── 또래 소비 비교 카드 ───────────────────────────────────────────────────────
const MOCK_PEER_AVG_MONTHLY = 350000; // 20대 평균 월 소비 mock
const MOCK_PEER_RANK_PCT    = 15;     // 상위 n% mock

function StatusBar({ pct, color }) {
  return (
    <div style={{ width: '100%', height: 15, borderRadius: 9999, backgroundColor: '#F3F4F5', overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', borderRadius: 9999, backgroundColor: color }} />
    </div>
  );
}

function PeerCompareCard({ spent = 0 }) {
  const peerAvg  = MOCK_PEER_AVG_MONTHLY;
  const mySpent  = spent;
  const maxVal   = Math.max(mySpent, peerAvg, 1);
  const myPct    = Math.round((mySpent / maxVal) * 100);
  const peerPct  = Math.round((peerAvg / maxVal) * 100);
  const fmtMan   = v => v === 0 ? '0원' : `${Math.round(v / 10000)}만`;

  return (
    <div
      style={{
        width: 353,
        height: 310,
        borderRadius: 32,
        padding: 32,
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.09)',
        boxSizing: 'border-box',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── 컨테이너 1: 아이콘 + 제목 (x:32, y:32) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src={peerIconImg} alt="peer" style={{ width: 32, height: 24, objectFit: 'contain' }} />
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 24, fontWeight: 600, color: '#1A1A1A' }}>
          또래 소비 비교
        </span>
      </div>

      {/* gap → 컨테이너 2 위치 y:84 맞춤 (헤더 ~32px + gap 20px) */}
      <div style={{ height: 20 }} />

      {/* ── 컨테이너 2: 나 (x:32, y:84) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 600, color: '#555555' }}>나</span>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 600, color: '#555555' }}>{fmtMan(mySpent)}</span>
        </div>
        <StatusBar pct={myPct} color="#2ECC71" />
      </div>

      <div style={{ height: 14 }} />

      {/* ── 컨테이너 3: 20대 평균 소비 */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 600, color: '#555555' }}>20대 평균 소비</span>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 600, color: '#555555' }}>{fmtMan(peerAvg)}</span>
        </div>
        <StatusBar pct={peerPct} color="#FED023" />
      </div>

      {/* 나머지 공간 채우기 */}
      <div style={{ flex: 1 }} />

      {/* ── Divider */}
      <div style={{ height: 1, backgroundColor: '#F0F0F0', marginBottom: 16 }} />

      {/* ── 하단 텍스트 */}
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 16, fontWeight: 600, color: '#006D37', lineHeight: 1.55 }}>
        이번 달 상위 {MOCK_PEER_RANK_PCT}% 안에 들었어요!<br />
        정말 대단해요, 이대로만 가요!
      </span>
    </div>
  );
}

// ── AI 가이드 라이브러리 카드 ─────────────────────────────────────────────────
// 지난달 최다 지출 카테고리 기반으로 추천 가이드 결정 (백엔드 AI 분석으로 교체 예정)
const GUIDE_MAP = {
  '식비':      "지난달 식비 지출을 분석한 결과 '스마트 식비 절약 가이드'를 추천해요!",
  '카페':      "지난달 카페 지출을 분석한 결과 '카페 지출 다이어트 가이드'를 추천해요!",
  '교통':      "지난달 교통비를 분석한 결과 '교통비 최적화 가이드'를 추천해요!",
  '쇼핑':      "지난달 쇼핑 지출을 분석한 결과 '충동구매 억제 가이드'를 추천해요!",
  '문화/여가': "지난달 문화/여가 지출을 분석한 결과 '여가비 스마트 관리 가이드'를 추천해요!",
};
const DEFAULT_GUIDE_DESC = "지난달 지출 습관을 분석한 결과 '전략적 저축 가이드'를 추천해요!";

function getGuideDesc(expenses) {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const ym = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
  const catMap = {};
  expenses.forEach(e => {
    if (!e.expense_date?.startsWith(ym)) return;
    catMap[e.name || '기타'] = (catMap[e.name || '기타'] || 0) + e.amount;
  });
  const entries = Object.entries(catMap);
  if (!entries.length) return DEFAULT_GUIDE_DESC;
  const topCat = entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  return GUIDE_MAP[topCat] || DEFAULT_GUIDE_DESC;
}

function AIGuideLibraryCard({ expenses, onGuidePress }) {
  const guideDesc = useMemo(() => getGuideDesc(expenses), [expenses]);

  return (
    <div style={{ width: 353 }}>
      {/* 섹션 헤딩 */}
      <span style={{
        fontFamily: 'Pretendard, sans-serif',
        fontSize: 24,
        fontWeight: 600,
        color: '#1A1A1A',
        display: 'block',
        marginBottom: 16,
      }}>
        AI 가이드 라이브러리
      </span>

      {/* 카드 */}
      <div style={{
        width: 353,
        height: 170,
        borderRadius: 28,
        backgroundColor: '#E8F8EF',
        border: '1.5px solid rgba(47, 204, 113, 0.5)',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 아이콘 — x:17.5, y:17.5, 49×49 */}
        <img
          src={aiGuideIconImg}
          alt="AI 가이드"
          style={{
            position: 'absolute',
            left: 17.5,
            top: 17.5,
            width: 49,
            height: 49,
            objectFit: 'contain',
            pointerEvents: 'none',
          }}
        />

        {/* 텍스트 컨테이너 — x:82.5, y:17.5 */}
        <div style={{
          position: 'absolute',
          left: 82.5,
          top: 17.5,
          right: 17.5,
        }}>
          <span style={{
            fontFamily: 'Pretendard, sans-serif',
            fontSize: 18,
            fontWeight: 600,
            color: '#2FCC71',
            display: 'block',
            marginBottom: 6,
            lineHeight: 1.2,
          }}>
            AI 추천 가이드
          </span>
          <span style={{
            fontFamily: 'Pretendard, sans-serif',
            fontSize: 12,
            fontWeight: 400,
            color: '#555555',
            lineHeight: 1.5,
            display: 'block',
          }}>
            {guideDesc}
          </span>
        </div>

        {/* 버튼 — 우측 하단 패딩(16) 끝 */}
        <button
          onClick={onGuidePress}
          style={{
            position: 'absolute',
            right: 16,
            bottom: 16,
            width: 119,
            height: 34,
            borderRadius: 10000,
            backgroundColor: '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Pretendard, sans-serif',
            fontSize: 14,
            fontWeight: 500,
            color: '#2FCC71',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          지금 확인하기
        </button>
      </div>
    </div>
  );
}

// ── 메인 AI 리포트 스크린 ─────────────────────────────────────────────────────
export default function AIReportScreen({ expenses = [], spent = 0, onGuidePress }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 40,
        gap: 20,
      }}
    >
      {/* 헤딩 */}
      <div style={{ width: 353, marginBottom: 4 }}>
        <span
          style={{
            fontFamily: 'Pretendard, sans-serif',
            fontSize: 24,
            fontWeight: 600,
            color: '#1A1A1A',
            display: 'block',
          }}
        >
          요즘 나의 소비는?
        </span>
      </div>

      {/* 카드 1: 급증 인사이트 */}
      <SpikeInsightCard expenses={expenses} />

      {/* 카드 2: 또래 소비 비교 */}
      <PeerCompareCard spent={spent} />

      {/* 카드 3: AI 가이드 라이브러리 */}
      <AIGuideLibraryCard expenses={expenses} onGuidePress={onGuidePress} />
    </div>
  );
}
