import { useState, useRef } from 'react';

// 주사위 눈 좌표 (3x3 그리드 기준)
const PIP_LAYOUT = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

function DiceFace({ value, rolling }) {
  return (
    <div
      className={rolling ? 'dice-rolling' : undefined}
      style={{
        width: 140,
        height: 140,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.14), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
        position: 'relative',
      }}
    >
      {PIP_LAYOUT[value].map(([r, c], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 24 + c * 34,
            top: 24 + r * 34,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1CD1A1 0%, #34E8B6 100%)',
          }}
        />
      ))}
    </div>
  );
}

/**
 * 주사위 화면 — 소비 내역 입력 + 광고 시청 후 진입
 * onDone(value): 나온 눈만큼 맵 이동
 */
export default function DiceRollScreen({ onDone }) {
  const [face, setFace] = useState(1);
  const [phase, setPhase] = useState('ready'); // ready | rolling | done
  const resultRef = useRef(1);

  function roll() {
    if (phase !== 'ready') return;
    setPhase('rolling');
    // 굴리는 동안 눈이 빠르게 바뀜
    const interval = setInterval(() => {
      setFace(Math.floor(Math.random() * 6) + 1);
    }, 90);
    setTimeout(() => {
      clearInterval(interval);
      const result = Math.floor(Math.random() * 6) + 1;
      resultRef.current = result;
      setFace(result);
      setPhase('done');
    }, 1400);
  }

  return (
    <div
      className="bg-white"
      style={{
        width: '390px',
        minHeight: '100svh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(180deg, #E8FAF6 0%, #FFFFFF 60%)',
      }}
    >
      {/* 타이틀 */}
      <p style={{ marginTop: 120, fontFamily: 'Pretendard, sans-serif', fontSize: 24, fontWeight: 600, color: '#1A1A1A', textAlign: 'center' }}>
        {phase === 'done' ? '결과가 나왔어요!' : '주사위를 굴려보세요!'}
      </p>
      <p style={{ marginTop: 8, fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 400, color: '#999999', textAlign: 'center' }}>
        {phase === 'done' ? `맵에서 ${resultRef.current}칸 이동해요` : '나온 눈만큼 맵에서 이동해요'}
      </p>

      {/* 주사위 */}
      <div style={{ marginTop: 64 }}>
        <DiceFace value={face} rolling={phase === 'rolling'} />
      </div>

      {/* 결과 숫자 */}
      {phase === 'done' && (
        <p className="toast-enter" style={{ marginTop: 32, fontFamily: 'Pretendard, sans-serif', fontSize: 40, fontWeight: 700, color: '#1CD1A1' }}>
          +{resultRef.current}
        </p>
      )}

      {/* 버튼 */}
      <button
        onClick={phase === 'done' ? () => onDone(resultRef.current) : roll}
        disabled={phase === 'rolling'}
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '353px',
          height: '56px',
          background: 'linear-gradient(90deg, #1CD1A1 0%, #34E8B6 100%)',
          borderRadius: '100px',
          border: 'none',
          cursor: phase === 'rolling' ? 'default' : 'pointer',
          opacity: phase === 'rolling' ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(28, 209, 161, 0.40)',
        }}
      >
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 16, fontWeight: 600, color: '#FFFFFF' }}>
          {phase === 'ready' ? '주사위 굴리기' : phase === 'rolling' ? '굴리는 중...' : '이동하기'}
        </span>
      </button>
    </div>
  );
}
