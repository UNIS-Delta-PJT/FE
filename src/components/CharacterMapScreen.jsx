import { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';
import AdScreen from './AdScreen';
import characterImg from '../assets/character_preview.png';
import cloud1 from '../assets/cloud_1.png';
import cloud2 from '../assets/cloud_2.png';
import cloud3 from '../assets/cloud_3.png';
import quizCharacterImg from '../assets/quiz_banner.png';
import groupIcon from '../assets/icon_group.png';
import storeIcon from '../assets/icon_store.png';
import coinIcon from '../assets/icon_coin.png';
import foundTreasureImg from '../assets/found_treasure.png';
import trapImg from '../assets/trap.png';
import ribbonsBannerImg from '../assets/store_ribbons.png';
import { loadGroups } from './GroupComposeScreen';

// ── 맵 구성 (공용 설정에서 로드) ─────────────────────────────────────
import {
  TOTAL_STEPS, YELLOW_STEPS, RED_EFFECTS, COLOR, stepColor,
  STEP_W, STEP_H, DEPTH, stepPos, MAP_HEIGHT, ROAD_PATH,
} from './mapConfig';

// 그룹 토글 — 나만의 맵(솔로 플레이, id -1) + 내가 참여한 그룹들
const SOLO_MAP = -1;
function loadGroupOptions() {
  return [
    { id: SOLO_MAP, label: '나만의 맵' },
    ...loadGroups()
      .map((g, i) => (g !== null ? { id: i, label: `그룹 ${i + 1}` } : null))
      .filter(Boolean),
  ];
}

// 무지개 (본인 마커 stroke)
const RAINBOW = 'linear-gradient(135deg, #FF7682 0%, #FF9F45 25%, #F5C308 45%, #1CD1A1 65%, #90BAFF 82%, #B78CF7 100%)';

// 하단 플로팅 배너 로테이션 — 화면 진입 시마다 번갈아 표시 (모듈 스코프라 세션 내 유지)
let bannerRotation = 0;

// 금융 퀴즈 문제 은행 — TODO: 백엔드 연동 시 API로 대체
const QUIZ_BANK = [
  { q: '목돈을 한 번에 맡기고 이자를 받는 저축 상품은?', options: ['정기적금', '정기예금', '주식', '보험'], answer: 1, explain: '정기예금은 목돈을 한 번에 맡기고 만기까지 두는 상품이에요. 정기적금은 매달 일정 금액을 넣는 상품이죠.' },
  { q: '매달 일정 금액을 넣어 목돈을 만드는 상품은?', options: ['펀드', '채권', '정기적금', '정기예금'], answer: 2, explain: '정기적금은 매달 꾸준히 저축해 목돈을 만드는 데 적합한 상품이에요.' },
  { q: '신용점수가 낮아질 수 있는 행동은?', options: ['적금 가입', '카드값 연체', '체크카드 사용', '예산 세우기'], answer: 1, explain: '카드값이나 대출 이자를 연체하면 신용점수가 크게 떨어져요. 연체는 꼭 피하세요!' },
  { q: '물가가 계속 오르는 현상을 뭐라고 할까?', options: ['디플레이션', '리세션', '스태그네이션', '인플레이션'], answer: 3, explain: '인플레이션은 물가가 지속적으로 올라 돈의 가치가 떨어지는 현상이에요.' },
  { q: '수입에서 지출을 뺀 나머지 돈은?', options: ['잉여자금', '부채', '원금', '이자'], answer: 0, explain: '수입에서 지출을 빼고 남은 돈이 잉여자금이에요. 저축이나 투자의 재원이 되죠.' },
  { q: '분산 투자의 가장 큰 목적은?', options: ['수익 늘리기', '세금 줄이기', '위험 줄이기', '수수료 아끼기'], answer: 2, explain: '여러 자산에 나눠 투자하면 한 곳에서 손실이 나도 전체 위험을 줄일 수 있어요.' },
  { q: '은행에 돈을 맡기면 받는 대가는?', options: ['배당금', '이자', '월세', '수수료'], answer: 1, explain: '은행에 예금하면 맡긴 돈에 대한 대가로 이자를 받아요.' },
  { q: '갑작스러운 지출에 대비해 모아두는 돈은?', options: ['용돈', '투자금', '대출금', '비상금'], answer: 3, explain: '비상금은 예상치 못한 지출에 대비해 따로 모아두는 돈이에요. 보통 월 지출의 3배 정도를 권장해요.' },
];

// 파티원 mock — TODO: 백엔드 연동 시 실제 파티 데이터로 대체
const PARTY_MEMBERS = [
  { nickname: '핑키', step: 8,  color: '#F5C308' },
  { nickname: '초코', step: 14, color: '#1CD1A1' },
  { nickname: '몽이', step: 3,  color: '#FF7682' },
];

// 구름 배치 — 화면(844px)당 최대 3개, C1/C2/C3 골고루
const CLOUDS = Array.from({ length: Math.floor(MAP_HEIGHT / 320) }, (_, i) => ({
  src: [cloud1, cloud2, cloud3][i % 3],
  x: [12, 265, 150, 300, 40, 210][i % 6],
  y: 140 + i * 320,
  w: [70, 110, 88, 60, 120, 80][i % 6],
}));

// ── 플레이어 마커 (본인/파티원 공용) ─────────────────────────────────
function PlayerMarker({ stroke, isRainbow, nickname, animateKey }) {
  return (
    <div style={{ position: 'relative', width: 80, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* 닉네임 원 — 배경 상단 중앙 */}
      <div
        style={{
          position: 'absolute',
          top: -13,
          left: '50%',
          transform: 'translateX(-50%)',
          minWidth: 26,
          height: 26,
          padding: '0 6px',
          borderRadius: 13,
          background: stroke,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          boxSizing: 'border-box',
        }}
      >
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 10, fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
          {nickname}
        </span>
      </div>

      {/* 배경 (80x80, stroke는 그라데이션 테두리 기법) */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 1000,
          background: stroke,
          padding: 4,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 1000,
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <img
            key={animateKey}
            src={characterImg}
            alt={nickname}
            draggable={false}
            className={animateKey !== undefined ? 'marker-hop' : undefined}
            style={{ width: 56, height: 56, objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* 스텝 연결 세로선 (weight 4) */}
      <div style={{ width: 4, height: 14, background: stroke, ...(isRainbow ? {} : {}) }} />
    </div>
  );
}

export default function CharacterMapScreen({ onGroupCompose, onExtraDice, onStore }) {
  const [mapLevel, setMapLevel] = useState(() => {
    try { return JSON.parse(localStorage.getItem('delta_map_level') || '1'); } catch { return 1; }
  });
  const [position, setPosition] = useState(() => {
    try { return JSON.parse(localStorage.getItem('delta_map_position') || '1'); } catch { return 1; }
  });
  // 화면에 표시되는 마커 위치 — position을 향해 한 칸씩 통통 튀며 따라감
  const [displayPos, setDisplayPos] = useState(position);
  // 그룹 토글 후보 — 그룹 구성 화면에서 만든 그룹만 노출
  const groupOptions = loadGroupOptions();
  const [group, setGroup] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('delta_map_group') ?? String(SOLO_MAP));
      // 저장된 그룹이 탈퇴 등으로 사라졌으면 나만의 맵으로 복귀
      return loadGroupOptions().some(o => o.id === saved) ? saved : SOLO_MAP;
    } catch { return SOLO_MAP; }
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toast, setToast] = useState(null);
  // 보물상자/함정 도착 팝업 — { type: 'treasure'|'trap', value: 코인수|뒤로 갈 칸수, next: 확인 후 이동할 칸 }
  const [mapEvent, setMapEvent] = useState(null);
  // 하단 배너 — 진입할 때마다 퀴즈 ↔ 상점 추천 번갈아 표시
  const [banner] = useState(() => (bannerRotation++ % 2 === 0 ? 'quiz' : 'store'));
  // 금융 퀴즈 — { step, quiz } | null
  const [quiz, setQuiz] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(null); // null | 'correct' | 'wrong'
  const [showExplain, setShowExplain] = useState(false);
  const [quizAd, setQuizAd] = useState(null); // null | 'retry'
  const [coinToast, setCoinToast] = useState(false);
  const stepRefs = useRef({});

  useEffect(() => { localStorage.setItem('delta_map_level', JSON.stringify(mapLevel)); }, [mapLevel]);
  useEffect(() => { localStorage.setItem('delta_map_position', JSON.stringify(position)); }, [position]);
  useEffect(() => { localStorage.setItem('delta_map_group', JSON.stringify(group)); }, [group]);

  // 마커가 목표 위치로 한 칸씩 이동 (멀면 한 번에 글라이드)
  useEffect(() => {
    if (displayPos === position) return;
    if (Math.abs(position - displayPos) > 6) {
      setDisplayPos(position); // 처음으로 등 장거리는 부드럽게 한 번에
      return;
    }
    const dir = position > displayPos ? 1 : -1;
    const t = setTimeout(() => setDisplayPos(d => d + dir), 230);
    return () => clearTimeout(t);
  }, [position, displayPos]);

  // 마커 위치가 화면에 보이게 스크롤
  const firstScroll = useRef(true);
  useEffect(() => {
    const node = stepRefs.current[displayPos];
    if (!node) return;
    const t = setTimeout(() => {
      node.scrollIntoView({ behavior: firstScroll.current ? 'auto' : 'smooth', block: 'center' });
      firstScroll.current = false;
    }, 80); // App의 스크롤 리셋(rAF) 이후 실행
    return () => clearTimeout(t);
  }, [displayPos, mapLevel]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  }

  function giveCoin(amount = 1) {
    try {
      const coins = JSON.parse(localStorage.getItem('delta_coins') || '0');
      localStorage.setItem('delta_coins', JSON.stringify(coins + amount));
    } catch { /* noop */ }
  }

  // 보물상자/함정 팝업 확인 → 예약된 위치로 이동
  function handleMapEventConfirm() {
    const next = mapEvent?.next;
    setMapEvent(null);
    if (next != null) setPosition(next);
  }

  // ── 이동 규칙 ─────────────────────────────────────────────────────
  // - 앞으로: 초록 칸 퀴즈 정답 시 +1칸 (임의 이동 불가)
  // - 뒤로: 빨간 칸 도착 시에만 자동 후퇴
  // - 노랑: 도착 시 코인 지급 후 자동으로 다음 칸 통과
  // 도착 효과 중복 실행 방지 — null로 시작해 마운트 시에도 1회 처리 (노랑/빨강에 갇힌 상태 자가 복구)
  // 마운트 시 현재 칸은 이미 처리된 도착으로 간주 — 보물 칸에 머문 채 재진입해도 코인 재지급 방지
  const arrivedRef = useRef(position);

  // 주사위 결과 소비 — 소비 입력 → 광고 → 주사위에서 예약된 이동을 실행
  useEffect(() => {
    let pending = 0;
    try { pending = JSON.parse(localStorage.getItem('delta_pending_dice') || '0'); } catch { /* noop */ }
    if (pending > 0) {
      const t = setTimeout(() => {
        // 소비(키 삭제)는 실행 시점에 — StrictMode 이중 마운트에도 안전
        localStorage.removeItem('delta_pending_dice');
        showToast(`주사위 ${pending}! ${pending}칸 이동!`);
        setPosition(p => Math.min(TOTAL_STEPS, p + pending));
      }, 700);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (displayPos !== position) return;       // 아직 이동 중
    if (arrivedRef.current === position) return; // 이미 처리한 도착
    arrivedRef.current = position;
    const n = position;

    // 100번 도착 → 다음 맵으로 (1번부터 다시)
    if (n >= TOTAL_STEPS) {
      showToast('맵 클리어! 다음 맵으로 이동!');
      const t = setTimeout(() => {
        setMapLevel(l => l + 1);
        setPosition(1);
        setDisplayPos(1);
        arrivedRef.current = 1;
      }, 1600);
      return () => clearTimeout(t);
    }

    // 빨강: 함정 팝업 → 확인 시 후퇴
    const red = RED_EFFECTS[n];
    if (red) {
      const to = Math.max(1, red.to(n));
      setMapEvent({ type: 'trap', value: n - to, next: to });
      return;
    }

    // 노랑: 보물상자 팝업 → 코인 2~5개 랜덤 지급, 확인 후 해당 칸에 머무름
    if (YELLOW_STEPS.has(n)) {
      const reward = 2 + Math.floor(Math.random() * 4); // 2~5
      giveCoin(reward);
      setMapEvent({ type: 'treasure', value: reward, next: null });
      return;
    }

    // 초록: 대기 — 해당 칸을 클릭하면 퀴즈 시작
  }, [displayPos, position]);

  // 스텝 클릭 — 현재 서 있는 초록 칸만 반응 (퀴즈 열기)
  function handleStepClick(n) {
    if (n !== position || displayPos !== position) return; // 현재 칸 외 클릭 무시
    if (YELLOW_STEPS.has(n) || RED_EFFECTS[n] || n >= TOTAL_STEPS) return;
    setSelectedOption(null);
    setAnswered(null);
    setShowExplain(false);
    setQuiz({ step: n, quiz: QUIZ_BANK[Math.floor(Math.random() * QUIZ_BANK.length)] });
  }

  function closeQuiz() {
    setQuiz(null);
    setSelectedOption(null);
    setAnswered(null);
    setShowExplain(false);
  }

  function handleAnswer(i) {
    if (answered) return; // 이미 답변함
    setSelectedOption(i);
    if (i === quiz.quiz.answer) {
      setAnswered('correct');
      giveCoin();
      setCoinToast(true);
      setTimeout(() => setCoinToast(false), 2500);
    } else {
      setAnswered('wrong');
    }
  }

  const marker = stepPos(displayPos);
  // 마커 전체 높이: 배지 80 + 세로선 14 → 스텝 상단(중심-30)에 선 끝이 닿게
  const MARKER_H = 80 + 14;

  return (
    <div
      style={{
        position: 'relative',
        width: 390,
        // 무지개 배경 — 위에서부터 빨/주/노/초/파/보, 투명도 10%
        background: `linear-gradient(180deg,
          rgba(255, 118, 130, 0.10) 0%,
          rgba(255, 159, 69, 0.10) 20%,
          rgba(245, 195, 8, 0.10) 40%,
          rgba(28, 209, 161, 0.10) 60%,
          rgba(144, 186, 255, 0.10) 80%,
          rgba(183, 140, 247, 0.10) 100%)`,
      }}
    >
      {/* 상단 구름 낀 블러 — 스크롤 올리면 아래 콘텐츠는 선명 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 390,
          height: 140,
          zIndex: 15,
          pointerEvents: 'none',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          maskImage: 'linear-gradient(180deg, black 25%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, black 25%, transparent 100%)',
        }}
      />

      {/* 그룹 선택 드롭다운 (x24 y82 고정) */}
      <div style={{ position: 'fixed', top: 82, left: 'calc(50% - 195px + 24px)', zIndex: 30 }}>
        <button
          onClick={() => setDropdownOpen(o => !o)}
          style={{
            minWidth: 78,
            height: 39,
            padding: '0 12px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(90deg, #1CD1A1 0%, #34E8B6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            boxShadow: '0 4px 14px rgba(28, 209, 161, 0.35)',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>
            {groupOptions.find(o => o.id === group)?.label ?? '나만의 맵'}
          </span>
          <ChevronDown size={14} color="#FFFFFF" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {/* 펼침 목록 — 현재 선택은 상단 버튼에 표시, 후보에는 나머지만 (중복 없음) */}
        {dropdownOpen && (
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {groupOptions.map(({ id, label }) => id !== group && (
              <button
                key={id}
                onClick={() => { setGroup(id); setDropdownOpen(false); }}
                style={{
                  minWidth: 78,
                  height: 39,
                  padding: '0 12px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 500, color: '#000000' }}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 그룹 구성 / 상점 아이콘 (상단 우측 고정, 배경 없이 벡터만) */}
      <div style={{ position: 'fixed', top: 82, left: 'calc(50% + 195px - 24px - 64px)', zIndex: 20, display: 'flex', alignItems: 'center', gap: 12, height: 39 }}>
        {[
          { icon: groupIcon, label: '그룹 구성', size: 26, onClick: onGroupCompose },
          { icon: storeIcon, label: '상점', size: 20, onClick: onStore },
        ].map(({ icon, label, size, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="active:scale-90 transition-transform"
            style={{
              width: size,
              height: size,
              border: 'none',
              cursor: 'pointer',
              background: 'none',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src={icon} alt={label} draggable={false} style={{ width: size, height: size, objectFit: 'contain' }} />
          </button>
        ))}
      </div>

      {/* ── 금융 퀴즈 배너 (하단 내비게이터 위 고정, 363x95 섹션) ────── */}
      <div
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 363,
          height: 95,
          zIndex: 25,
        }}
      >
        {/* 보이는 박스: 353x73, 하단 정렬 */}
        <div
          style={{
            position: 'absolute',
            left: 5,
            bottom: 0,
            width: 353,
            height: 73,
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.10), inset 0 2px 6px rgba(255, 255, 255, 0.7)',
          }}
        />
        {/* 캐릭터/아이템 이미지 (섹션 기준 x11 y0, 96x90 — 박스 위로 살짝 돌출) */}
        <img
          src={banner === 'quiz' ? quizCharacterImg : ribbonsBannerImg}
          alt={banner === 'quiz' ? '퀴즈 캐릭터' : '추천 아이템'}
          draggable={false}
          style={{ position: 'absolute', left: 11, top: 0, width: 96, height: 90, objectFit: 'contain', pointerEvents: 'none' }}
        />
        {/* 텍스트 */}
        <span
          style={{
            position: 'absolute',
            left: 118,
            bottom: 18,
            fontFamily: 'Pretendard, sans-serif',
            fontSize: 16,
            fontWeight: 600,
            color: '#555555',
            lineHeight: 1.3,
            whiteSpace: 'pre-line',
          }}
        >
          {banner === 'quiz' ? '금융 퀴즈 풀고\n주사위 한 번 더!' : '오늘의 귀여운\n추천 아이템 등장!'}
        </span>
        {/* 액션 버튼 — 퀴즈 풀기 / 상점 가기 */}
        <button
          onClick={banner === 'store' ? onStore : undefined}
          className="active:scale-95 transition-transform"
          style={{
            position: 'absolute',
            right: 16,
            bottom: 20,
            width: 92,
            height: 33,
            padding: '8px 20px',
            borderRadius: 100,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: '#1CD1A1',
            boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.45), inset 0 -2px 4px rgba(0, 0, 0, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 13, fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
            {banner === 'quiz' ? '퀴즈 풀기' : '상점 가기'}
          </span>
        </button>
      </div>

      {/* ── 금융 퀴즈 오버레이 ─────────────────────────────────────── */}
      {quiz && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.55)', zIndex: 40 }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 390, height: '100%' }}>
            {/* 코인 획득 토스트 (x136 y65, 121x36) */}
            {coinToast && (
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  top: 20,
                  padding: '5px 12px',
                  borderRadius: 1000,
                  backgroundColor: 'rgba(254, 208, 35, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                }}
              >
                {/* 코인 아이콘 */}
                <img src={coinIcon} alt="코인" draggable={false} style={{ width: 15, height: 15, objectFit: 'contain' }} />
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 13, fontWeight: 600, color: '#FFCF19', whiteSpace: 'nowrap' }}>
                  1코인 획득!
                </span>
              </div>
            )}

            {/* 닫기 버튼 (x328 y80) */}
            <button
              onClick={closeQuiz}
              className="active:scale-90 transition-transform"
              style={{ position: 'absolute', left: 328, top: 20, width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={26} color="#FFFFFF" />
            </button>

            {/* 질문 카드 (x24 y174, 344x141) — 정답보기 시 해설 표시 */}
            <div
              style={{
                position: 'absolute',
                left: 24,
                top: 114,
                width: 344,
                height: 141,
                borderRadius: 20,
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '44px 24px 20px',
                boxSizing: 'border-box',
              }}
            >
              {showExplain ? (
                <>
                  <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 700, color: '#1CD1A1' }}>
                    해설 · 정답: {quiz.quiz.options[quiz.quiz.answer]}
                  </span>
                  <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 13, fontWeight: 500, color: '#555555', textAlign: 'center', lineHeight: 1.5 }}>
                    {quiz.quiz.explain}
                  </span>
                </>
              ) : (
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 16, fontWeight: 600, color: '#1A1A1A', textAlign: 'center', lineHeight: 1.45 }}>
                  {quiz.quiz.q}
                </span>
              )}
            </div>

            {/* 단계 숫자 원 (x157 y120, 77x77) — #1CD1A1 링이 회전 */}
            <div style={{ position: 'absolute', left: 157, top: 60, width: 77, height: 77 }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: '#FFFFFF' }} />
              <svg width={77} height={77} viewBox="0 0 77 77" style={{ position: 'absolute', inset: 0 }}>
                {/* 기본 stroke */}
                <circle cx="38.5" cy="38.5" r="35" fill="none" stroke="#77E3C7" strokeWidth="7" />
                {/* 회전하는 링 (끝 둥글게) */}
                <g className="quiz-ring-spin">
                  <circle
                    cx="38.5" cy="38.5" r="35"
                    fill="none"
                    stroke="#1CD1A1"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray="66 154"
                  />
                </g>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 28, fontWeight: 600, color: '#1CD1A1' }}>
                  {quiz.step}
                </span>
              </div>
            </div>

            {/* 사지선다 카드 (x24 y343, 344x281) */}
            <div
              style={{
                position: 'absolute',
                left: 24,
                top: 283,
                width: 344,
                height: 281,
                borderRadius: 25,
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxSizing: 'border-box',
              }}
            >
              {quiz.quiz.options.map((option, i) => {
                const isSelected = selectedOption === i;
                const isWrongPick   = answered === 'wrong' && isSelected;
                const isCorrectPick = answered === 'correct' && isSelected;
                return (
                  <button
                    key={option}
                    onClick={() => handleAnswer(i)}
                    style={{
                      width: 312,
                      height: 48,
                      padding: '6px 8px 6px 16px',
                      borderRadius: 100,
                      backgroundColor: isWrongPick ? '#FF7682' : isCorrectPick ? '#1CD1A1' : '#FAFAFA',
                      border: isWrongPick ? '1px solid #FAFAFA' : '1px solid #EDEDED',
                      cursor: answered ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 500, color: (isWrongPick || isCorrectPick) ? '#FFFFFF' : '#1A1A1A' }}>
                      {option}
                    </span>
                    {isCorrectPick ? (
                      // 정답: 흰 원 + 초록 체크
                      <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#FFFFFF', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.8 6.8L9 1.2" stroke="#1CD1A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    ) : (
                      <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#1CD1A1', flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* 결과 버튼 영역 */}
            {answered && (
              <>
                {/* 광고 버튼 — 오답: 재도전 / 정답: 주사위 한 번 더 (광고 → 주사위 → 이동) */}
                <button
                  onClick={() => {
                    if (answered === 'wrong') {
                      setQuizAd('retry');
                    } else {
                      closeQuiz();
                      onExtraDice?.();
                    }
                  }}
                  className="active:scale-95 transition-transform"
                  style={{
                    position: 'absolute',
                    left: 24,
                    top: 588,
                    width: 344,
                    height: 56,
                    borderRadius: 100,
                    border: 'none',
                    cursor: 'pointer',
                    background: 'linear-gradient(90deg, #1CD1A1 0%, #34E8B6 100%)',
                    boxShadow: '0 4px 20px rgba(28, 209, 161, 0.40)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 16, fontWeight: 600, color: '#FFFFFF' }}>
                    {answered === 'wrong' ? '광고 보고 재도전하기' : '광고 보고 주사위 한 번 더!'}
                  </span>
                </button>

                {/* 텍스트 버튼 — 오답: 정답보기 / 정답: 홈으로 */}
                <button
                  onClick={() => (answered === 'wrong' ? setShowExplain(true) : closeQuiz())}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 660,
                    margin: '0 auto',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Pretendard, sans-serif',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#FFFFFF',
                  }}
                >
                  {answered === 'wrong' ? '정답보기' : '홈으로'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 퀴즈 광고 (30초) — 오답 재도전용 */}
      {quizAd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, backgroundColor: '#1A1A1A', display: 'flex', justifyContent: 'center' }}>
          <AdScreen
            onDone={() => {
              // 같은 문제로 재도전
              setSelectedOption(null);
              setAnswered(null);
              setShowExplain(false);
              setQuizAd(null);
            }}
          />
        </div>
      )}

      {/* 보물상자/함정 도착 팝업 */}
      {mapEvent && (
        <div
          className="map-event-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 70,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 20px',
          }}
        >
          {/* 타이틀 */}
          <p
            className="map-event-pop"
            style={{
              fontFamily: 'Pretendard, sans-serif',
              fontSize: '36px',
              fontWeight: 700,
              color: '#FFFFFF',
              textAlign: 'center',
              animationDelay: '0.05s',
            }}
          >
            {mapEvent.type === 'treasure' ? '앗싸! 보물상자 발견' : '앗, 함정에 빠졌어요!'}
          </p>

          {/* 이미지 (281x281) */}
          <img
            src={mapEvent.type === 'treasure' ? foundTreasureImg : trapImg}
            alt={mapEvent.type === 'treasure' ? '보물상자' : '함정'}
            draggable={false}
            className="map-event-pop"
            style={{ width: '281px', height: '281px', objectFit: 'contain', animationDelay: '0.18s' }}
          />

          {/* 설명 */}
          <p
            className="map-event-fade-up"
            style={{
              fontFamily: 'Pretendard, sans-serif',
              fontSize: '18px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
              animationDelay: '0.4s',
            }}
          >
            {mapEvent.type === 'treasure'
              ? `${mapEvent.value}코인을 획득했어요!`
              : `아쉽지만 ${mapEvent.value}칸 뒤로 돌아가야 해요`}
          </p>

          {/* 확인 버튼 (148x56) */}
          <button
            onClick={handleMapEventConfirm}
            className="map-event-fade-up"
            style={{
              marginTop: '28px',
              width: '148px',
              height: '56px',
              padding: '20px 10px',
              borderRadius: '100px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animationDelay: '0.5s',
            }}
          >
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '16px', fontWeight: 600, color: '#1CD1A1' }}>
              확인
            </span>
          </button>
        </div>
      )}

      {/* 토스트 */}
      {toast && (
        <div
          className="toast-enter"
          style={{
            position: 'fixed',
            bottom: 100,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '6px 16px',
            borderRadius: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 50,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 500, color: '#FFFFFF' }}>
            {toast}
          </span>
        </div>
      )}

      {/* 맵 본체 */}
      <div style={{ position: 'relative', width: 390, height: MAP_HEIGHT }}>
        {/* 길(도로) — 아래 어두운 레이어 + 윗면 + 점선으로 입체 표현 */}
        <svg
          width={390}
          height={MAP_HEIGHT}
          viewBox={`0 0 390 ${MAP_HEIGHT}`}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          {/* 입체 바닥 */}
          <path d={ROAD_PATH} stroke="#B9BEC4" strokeWidth={34} fill="none" strokeLinejoin="round" strokeLinecap="round" transform={`translate(0 ${DEPTH})`} />
          {/* 도로 윗면 */}
          <path d={ROAD_PATH} stroke="#DDDFE2" strokeWidth={34} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          {/* 중앙 점선 */}
          <path d={ROAD_PATH} stroke="#FFFFFF" strokeWidth={3} fill="none" strokeLinejoin="round" strokeDasharray="10 12" opacity={0.9} />
        </svg>

        {/* 구름들 */}
        {CLOUDS.map(({ src, x, y, w }, i) => (
          <img
            key={i}
            src={src}
            alt=""
            draggable={false}
            style={{ position: 'absolute', left: x, top: y, width: w, objectFit: 'contain', pointerEvents: 'none', opacity: 0.9 }}
          />
        ))}

        {/* 스텝 버튼들 — 현재 서 있는 초록 칸만 클릭 가능 (퀴즈) */}
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const n = i + 1;
          const { x, y } = stepPos(n);
          const color = stepColor(n);
          const clickable = n === position && displayPos === position && !YELLOW_STEPS.has(n) && !RED_EFFECTS[n] && n < TOTAL_STEPS;
          return (
            <div
              key={n}
              ref={el => { stepRefs.current[n] = el; }}
              style={{ position: 'absolute', left: x - STEP_W / 2, top: y - STEP_H / 2, width: STEP_W, textAlign: 'center' }}
            >
              <button
                onClick={() => handleStepClick(n)}
                className={clickable ? 'active:scale-95 transition-transform' : undefined}
                style={{
                  width: STEP_W,
                  height: STEP_H,
                  borderRadius: 30,
                  border: 'none',
                  cursor: clickable ? 'pointer' : 'default',
                  backgroundColor: color.top,
                  // 입체: 아래 어두운 같은 도형 레이어 + 안쪽 하이라이트
                  boxShadow: `0 ${DEPTH}px 0 ${color.base}, inset 0 2px 3px rgba(255,255,255,0.45)`,
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 26, fontWeight: 600, color: '#FFFFFF' }}>
                  {n}
                </span>
              </button>
            </div>
          );
        })}

        {/* 파티원 마커들 (mock) — 나만의 맵에서는 혼자 플레이 */}
        {group !== SOLO_MAP && PARTY_MEMBERS.map(({ nickname, step, color }) => {
          const p = stepPos(step);
          return (
            <div
              key={nickname}
              style={{
                position: 'absolute',
                left: p.x - 40,
                top: p.y - STEP_H / 2 - MARKER_H,
                zIndex: 4,
                pointerEvents: 'none',
              }}
            >
              <PlayerMarker stroke={color} nickname={nickname} />
            </div>
          );
        })}

        {/* 본인 마커 — 무지개 stroke, 통통 튀며 이동 */}
        <div
          style={{
            position: 'absolute',
            left: marker.x - 40,
            top: marker.y - STEP_H / 2 - MARKER_H,
            transition: 'left 0.22s ease, top 0.22s ease',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          <PlayerMarker stroke={RAINBOW} isRainbow nickname="나" animateKey={displayPos} />
        </div>
      </div>
    </div>
  );
}
