import { useState } from 'react';
import { Stamp, PlusCircle } from 'lucide-react';
import AdScreen from './AdScreen';
import BudgetCard from './BudgetCard';
import TodayExpenses from './TodayExpenses';
import CharacterAvatar from './CharacterAvatar';
import settingImg from '../assets/setting.png';
import coinIcon from '../assets/icon_coin.png';
import { TOTAL_STEPS, stepColor, STEP_W, STEP_H, DEPTH, stepPos, MAP_HEIGHT, ROAD_PATH } from './mapConfig';

// ── OX 퀴즈 은행 — 날짜 기준으로 오늘의 문제 선정 (TODO: API 대체) ──
const OX_BANK = [
  { q: '체크카드는 통장 잔액 내에서만 결제된다', answer: 'O' },
  { q: '적금을 중도 해지해도 약정 이자를 전부 받는다', answer: 'X' },
  { q: '예금자보호제도는 1인당 5천만 원까지 보호한다', answer: 'O' },
  { q: '신용점수는 한 번 떨어지면 회복할 수 없다', answer: 'X' },
  { q: '물가가 오르면 같은 돈으로 살 수 있는 게 줄어든다', answer: 'O' },
  { q: '분산 투자는 위험을 키우는 투자 방법이다', answer: 'X' },
  { q: '비상금은 예상치 못한 지출에 대비하는 돈이다', answer: 'O' },
];

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getTodayQuiz() {
  const d = new Date();
  const dayIndex = Math.floor(d.getTime() / 86400000);
  return OX_BANK[dayIndex % OX_BANK.length];
}

// ── 미니맵 (현위치 중앙) ─────────────────────────────────────────────
function MiniMap({ position }) {
  const SCALE = 0.95;
  const VIEW_W = 353;
  const VIEW_H = 317;
  const marker = stepPos(position);
  // 맵이 뷰를 꽉 채우게: 가로는 맵 전체를 가운데 맞추고, 세로만 현위치 부근으로
  const tx = (VIEW_W - 390 * SCALE) / 2;
  const ty = VIEW_H * 0.58 - marker.y * SCALE;

  return (
    <div
      style={{
        position: 'relative',
        width: VIEW_W,
        height: VIEW_H,
        borderRadius: 24,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #E8FAF6 0%, #F4FDFA 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.10), inset 6px 0 12px rgba(0,0,0,0.05), inset -6px 0 12px rgba(0,0,0,0.05)',
      }}
    >
      {/* 스케일된 맵 */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 390, height: MAP_HEIGHT, transform: `translate(${tx}px, ${ty}px) scale(${SCALE})`, transformOrigin: '0 0', pointerEvents: 'none' }}>
        <svg width={390} height={MAP_HEIGHT} viewBox={`0 0 390 ${MAP_HEIGHT}`} style={{ position: 'absolute', inset: 0 }}>
          <path d={ROAD_PATH} stroke="#B9BEC4" strokeWidth={34} fill="none" strokeLinejoin="round" strokeLinecap="round" transform={`translate(0 ${DEPTH})`} />
          <path d={ROAD_PATH} stroke="#DDDFE2" strokeWidth={34} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <path d={ROAD_PATH} stroke="#FFFFFF" strokeWidth={3} fill="none" strokeLinejoin="round" strokeDasharray="10 12" opacity={0.9} />
        </svg>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const n = i + 1;
          const { x, y } = stepPos(n);
          const color = stepColor(n);
          return (
            <div
              key={n}
              style={{
                position: 'absolute',
                left: x - STEP_W / 2,
                top: y - STEP_H / 2,
                width: STEP_W,
                height: STEP_H,
                borderRadius: 30,
                backgroundColor: color.top,
                boxShadow: `0 ${DEPTH}px 0 ${color.base}, inset 0 2px 3px rgba(255,255,255,0.45)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 26, fontWeight: 600, color: '#FFFFFF' }}>{n}</span>
            </div>
          );
        })}
        {/* 내 위치 마커 */}
        <div style={{ position: 'absolute', left: marker.x - 32, top: marker.y - STEP_H / 2 - 66, width: 64, height: 64, borderRadius: '50%', backgroundColor: '#FFFFFF', boxShadow: '0 4px 14px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CharacterAvatar size={52} />
        </div>
      </div>

      {/* 현재 위치 배지 */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 72,
          height: 27,
          borderRadius: 1000,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 600, color: '#1CD1A1' }}>현재 위치</span>
      </div>

    </div>
  );
}

// ── OX 퀴즈 카드 ─────────────────────────────────────────────────────
function OxQuizCard({ onCoin }) {
  const quiz = getTodayQuiz();
  const [answered, setAnswered] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('delta_ox_quiz') || 'null');
      return saved?.date === todayKey() ? saved : null; // { date, pick, correct }
    } catch { return null; }
  });
  const [pendingPick, setPendingPick] = useState(null); // 답 선택 후 광고 시청 대기

  function answer(pick) {
    if (answered || pendingPick) return;
    setPendingPick(pick); // 10초 광고 시청 후 정답 공개
  }

  // 광고 종료 → 정답 공개
  function revealResult() {
    const pick = pendingPick;
    setPendingPick(null);
    const correct = pick === quiz.answer;
    const result = { date: todayKey(), pick, correct };
    setAnswered(result);
    try { localStorage.setItem('delta_ox_quiz', JSON.stringify(result)); } catch { /* noop */ }
    if (correct) onCoin();
  }

  // 정답 공개 후 버튼 상태: 정답이 아닌 선지는 회색 비활성화
  const isGrayed = (type) => answered && type !== quiz.answer;
  const btnState = (type) => {
    if (!answered) return {};
    if (answered.pick === type) {
      return { outline: `2px solid ${answered.correct ? '#1CD1A1' : '#FF7682'}`, outlineOffset: 2 };
    }
    return {};
  };

  return (
    <div
      style={{
        width: 353,
        height: 162,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        padding: 16,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* 문제 */}
      <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 18, fontWeight: 500, color: '#1A1A1A', margin: 0, lineHeight: 1.4 }}>
        <span style={{ color: '#1CD1A1' }}>Q. </span>
        {quiz.q}
      </p>

      {/* O / X 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={() => answer('O')}
          className={answered ? undefined : 'active:scale-95 transition-transform'}
          style={{
            width: 150,
            height: 56,
            borderRadius: 15,
            border: 'none',
            cursor: answered ? 'default' : 'pointer',
            backgroundColor: isGrayed('O') ? '#F0F0F0' : '#D7E9FA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...btnState('O'),
          }}
        >
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <circle cx="15" cy="15" r="10.5" stroke={isGrayed('O') ? '#CCCCCC' : '#609CFF'} strokeWidth="7" />
          </svg>
        </button>
        <button
          onClick={() => answer('X')}
          className={answered ? undefined : 'active:scale-95 transition-transform'}
          style={{
            width: 150,
            height: 56,
            borderRadius: 15,
            border: 'none',
            cursor: answered ? 'default' : 'pointer',
            backgroundColor: isGrayed('X') ? '#F0F0F0' : '#FCDDDF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...btnState('X'),
          }}
        >
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M5 5L21 21M21 5L5 21" stroke={isGrayed('X') ? '#CCCCCC' : '#EF3E51'} strokeWidth="6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* 정답 공개 전 광고 (10초) */}
      {pendingPick && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, backgroundColor: '#1A1A1A', display: 'flex', justifyContent: 'center' }}>
          <AdScreen duration={10} onDone={revealResult} />
        </div>
      )}
    </div>
  );
}

// ── 홈 화면 ──────────────────────────────────────────────────────────
export default function HomeScreen({ expenses = [], budgetTotal, spent = 0, onDirectInput, onSettings, onAttendance, onMapClick }) {
  const position = (() => {
    try { return JSON.parse(localStorage.getItem('delta_map_position') || '1'); } catch { return 1; }
  })();
  const [coinToast, setCoinToast] = useState(false);

  function handleCoin() {
    try {
      const coins = JSON.parse(localStorage.getItem('delta_coins') || '0');
      localStorage.setItem('delta_coins', JSON.stringify(coins + 1));
    } catch { /* noop */ }
    setCoinToast(true);
    setTimeout(() => setCoinToast(false), 2500);
  }

  return (
    <div style={{ width: 390, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 24 }}>
      {/* 코인 획득 토스트 */}
      {coinToast && (
        <div
          className="toast-enter"
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top, 0px) + 20px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 121,
            height: 36,
            borderRadius: 1000,
            backgroundColor: 'rgba(254, 208, 35, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            zIndex: 50,
          }}
        >
          <img src={coinIcon} alt="코인" draggable={false} style={{ width: 15, height: 15, objectFit: 'contain' }} />
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 13, fontWeight: 600, color: '#FFCF19', whiteSpace: 'nowrap' }}>
            1코인 획득!
          </span>
        </div>
      )}

      {/* 헤더 */}
      <div style={{ width: 353, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
          오늘의 기록
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* 출석체크 (스탬프) */}
          <button onClick={onAttendance} className="active:scale-90 transition-transform" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <Stamp size={24} color="#1A1A1A" strokeWidth={1.8} />
          </button>
          {/* 환경설정 */}
          <button onClick={onSettings} className="active:scale-90 transition-transform" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <img src={settingImg} alt="환경설정" width={36} height={36} draggable={false} />
          </button>
        </div>
      </div>

      {/* 미니맵 (누르면 맵 탭으로 이동) */}
      <button
        onClick={onMapClick}
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'block' }}
        aria-label="맵으로 이동"
      >
        <MiniMap position={position} />
      </button>

      {/* 오늘의 소비 기록하기 버튼 + 말풍선 */}
      <div style={{ position: 'relative', width: 353, marginTop: 46 }}>
        {/* 말풍선 — 버튼 왼쪽 위 */}
        <div style={{ position: 'absolute', top: -40, left: 8 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: '7px 14px', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)' }}>
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 500, color: '#999999' }}>
              오늘의 소비를 기록하면 주사위를 획득할 수 있어요!
            </span>
          </div>
          {/* 꼬리 — 왼쪽 아래 (버튼 방향) */}
          <div style={{ position: 'absolute', bottom: -8, left: 24, width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '8px solid #FFFFFF' }} />
        </div>

        <button
          onClick={onDirectInput}
          className="active:scale-95 transition-transform"
          style={{
            width: 353,
            height: 56,
            background: 'linear-gradient(90deg, #1CD1A1 0%, #34E8B6 100%)',
            borderRadius: 100,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 4px 20px rgba(28, 209, 161, 0.40)',
          }}
        >
          <PlusCircle size={20} color="#FFFFFF" strokeWidth={2} />
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 16, fontWeight: 600, color: '#FFFFFF' }}>
            오늘의 소비 기록하기
          </span>
        </button>
      </div>

      {/* 이번 달 남은 예산 */}
      <div style={{ marginTop: 24 }}>
        <BudgetCard totalAmount={budgetTotal} spent={spent} />
      </div>

      {/* 오늘의 소비 내역 */}
      <div style={{ marginTop: 24 }}>
        <TodayExpenses expenses={expenses} />
      </div>

      {/* 오늘의 퀴즈 도전! */}
      <div style={{ width: 353, marginTop: 32 }}>
        <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 18, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
          오늘의 퀴즈 도전!
        </p>
        <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 500, color: '#999999', margin: '4px 0 12px' }}>
          정답 맞히고 <span style={{ color: '#1CD1A1' }}>1코인 획득</span>하기
        </p>
        <OxQuizCard onCoin={handleCoin} />
      </div>
    </div>
  );
}
