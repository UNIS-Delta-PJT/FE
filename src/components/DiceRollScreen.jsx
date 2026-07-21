import { useState, useEffect } from 'react';
import diceImg from '../assets/dice.png';
import radialImg from '../assets/radial.png';
import resultCharacterImg from '../assets/dice_result_character.png';
import { rollDice } from '../api/map';

/**
 * 주사위 화면 — 소비 기록/퀴즈 보상으로 진입
 * onDone(data): 명세(POST /map/dice) 응답 { diceResult, previousPosition, landedPosition, finalPosition, event }
 *   서버 미가동 시 event 없이 diceResult만 채워 로컬 규칙 폴백을 알림
 * onError(message): 403 DICE_NOT_ENABLED 등 — 이번엔 주사위를 굴릴 수 없음
 */
export default function DiceRollScreen({ onDone, onError }) {
  const [phase, setPhase] = useState('ready'); // ready | rolling | done
  const [result, setResult] = useState(null);

  async function roll() {
    if (phase !== 'ready') return;
    setPhase('rolling');
    const start = Date.now();
    let data = null;
    try {
      data = await rollDice();
    } catch (err) {
      if (err.response?.data?.code === 'DICE_NOT_ENABLED') {
        setPhase('ready');
        onError?.(err.response.data.message || '금융 퀴즈를 먼저 풀어주세요.');
        return;
      }
      // 네트워크 오류 등 — 로컬 랜덤 눈금으로 폴백 (맵 화면에서 기존 로컬 규칙 적용)
    }
    // 최소 2초는 굴러가는 연출 유지
    const wait = Math.max(0, 2000 - (Date.now() - start));
    setTimeout(() => {
      setResult(data ?? { diceResult: Math.floor(Math.random() * 6) + 1 });
      setPhase('done');
    }, wait);
  }

  // 결과 확인 후 자동으로 맵 이동
  useEffect(() => {
    if (phase !== 'done') return;
    const t = setTimeout(() => onDone(result), 2000);
    return () => clearTimeout(t);
  }, [phase]);

  /* ─── 결과 화면 (2초 후 자동으로 맵 이동) ─── */
  if (phase === 'done') {
    const n = result.diceResult;
    return (
      <div style={{ width: '390px', minHeight: '100svh', position: 'relative', backgroundColor: '#FFFFFF' }}>
        {/* 타이틀 */}
        <p style={{ position: 'absolute', top: 96, left: 0, right: 0, fontFamily: 'Pretendard, sans-serif', fontSize: 28, fontWeight: 700, color: '#38D7AD', textAlign: 'center', lineHeight: 1.35, whiteSpace: 'pre-line', margin: 0 }}>
          {`축하합니다!\n높은 숫자 ${n}가 나왔네요`}
        </p>
        <p style={{ position: 'absolute', top: 182, left: 0, right: 0, fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 500, color: '#999999', textAlign: 'center', margin: 0 }}>
          잠시 후 자동으로 맵으로 이동합니다
        </p>

        {/* radial + n칸! — 화면 가로 중앙 정렬 */}
        <img src={radialImg} alt="" draggable={false} style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 316, width: 200, height: 195, objectFit: 'contain' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 316, height: 195, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 64, fontWeight: 600, color: '#1CD1A1', whiteSpace: 'nowrap' }}>
            {n}칸!
          </span>
        </div>

        {/* 캐릭터 + 말풍선 (radial 우측 하단) */}
        <div style={{ position: 'absolute', left: 214, top: 490 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: '7px 12px', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)' }}>
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 500, color: '#555555' }}>
              좋았어! 이제 출발하자~
            </span>
          </div>
          {/* 꼬리 */}
          <div style={{ position: 'absolute', bottom: -8, left: 40, width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '8px solid #FFFFFF' }} />
        </div>
        <img src={resultCharacterImg} alt="캐릭터" draggable={false} style={{ position: 'absolute', left: 230, top: 528, width: 130, height: 130, objectFit: 'contain' }} />
      </div>
    );
  }

  return (
    <div
      style={{
        width: '390px',
        minHeight: '100svh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* 타이틀 */}
      <p style={{ marginTop: 96, fontFamily: 'Pretendard, sans-serif', fontSize: 28, fontWeight: 700, color: '#38D7AD', textAlign: 'center' }}>
        주사위가 도착했어요!
      </p>
      <p style={{ marginTop: 8, fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 500, color: '#999999', textAlign: 'center' }}>
        소비 기록으로 획득한 주사위로 모험을 이어가세요
      </p>

      {/* 배경 원 (가장자리로 갈수록 흰색으로 페이드) + 주사위 */}
      <div style={{ marginTop: 38, position: 'relative', width: 328, height: 328, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* 배경 그라데이션 — 1초 간격으로 계속 퍼지는 물결 (굴리는 동안엔 정지) */}
        <div className={phase === 'rolling' ? undefined : 'dice-ripple'} style={{ position: 'absolute', width: 328, height: 328, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 153, 204, 0.2) 30%, rgba(255, 153, 204, 0.08) 65%, rgba(255, 153, 204, 0) 100%)' }} />
        {phase !== 'rolling' && (
          <div className="dice-ripple" style={{ position: 'absolute', width: 328, height: 328, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 153, 204, 0.2) 30%, rgba(255, 153, 204, 0.08) 65%, rgba(255, 153, 204, 0) 100%)', animationDelay: '1s' }} />
        )}
        {/* 중심 고정 글로우 */}
        <div style={{ position: 'absolute', width: 236, height: 236, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 153, 204, 0.2) 40%, rgba(255, 153, 204, 0) 100%)' }} />
        {/* 주사위 이미지 (326x269) — 굴리는 동안 시각적 중심 기준 360도 회전 */}
        <div style={{ position: 'relative', zIndex: 1, transform: 'translate(7px, 31px)' }}>
          <img
            src={diceImg}
            alt="주사위"
            draggable={false}
            className={phase === 'rolling' ? 'dice-spinning' : undefined}
            style={{ width: 326, height: 269, objectFit: 'contain', transformOrigin: '47.7% 38.1%' }}
          />
        </div>
      </div>

      {/* 버튼 */}
      <button
        onClick={roll}
        disabled={phase !== 'ready'}
        className={phase === 'rolling' ? undefined : 'active:scale-95 transition-transform'}
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '353px',
          height: '56px',
          padding: 20,
          boxSizing: 'border-box',
          background: 'linear-gradient(90deg, #1CD1A1 0%, #34E8B6 100%)',
          borderRadius: '100px',
          border: 'none',
          cursor: phase === 'ready' ? 'pointer' : 'default',
          opacity: phase === 'ready' ? 1 : 0.6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(28, 209, 161, 0.40)',
        }}
      >
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 16, fontWeight: 600, color: '#FFFFFF' }}>
          {phase === 'ready' ? '주사위 돌리기' : '굴리는 중...'}
        </span>
      </button>
    </div>
  );
}
