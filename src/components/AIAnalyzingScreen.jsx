import { useEffect, useState, useRef } from 'react';
import deltaFloating from '../assets/delta_floating.png';

/**
 * AI 분석 중 화면
 *
 * Props:
 *   onComplete   - 분석 완료 시 호출되는 콜백 (→ ScanResultScreen으로 전환)
 *   progress     - [백엔드 연동용] 외부에서 주입하는 진행률(0~100).
 *                  undefined이면 내부 시뮬레이션 실행.
 *                  100 전달 시 onComplete 자동 호출.
 *
 * 백엔드 연동 방법:
 *   1. 업로드 API 호출 후 진행률을 polling/websocket으로 수신
 *   2. 수신한 값을 progress prop으로 내려주면 됨
 *   3. progress === 100 이 되면 onComplete 호출 → result 화면으로 이동
 */
export default function AIAnalyzingScreen({ onComplete, progress: externalProgress }) {
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    // ── 외부 진행률(백엔드 연동 시) ───────────────────────
    if (externalProgress !== undefined) {
      setProgress(externalProgress);
      if (externalProgress >= 100 && !completedRef.current) {
        completedRef.current = true;
        setTimeout(onComplete, 350);
      }
      return;
    }

    // ── 시뮬레이션 (백엔드 연동 전) ──────────────────────
    // 약 3초에 걸쳐 0 → 95%까지 점진적으로 증가, 이후 100%로 완료
    let current = 0;
    const interval = setInterval(() => {
      // 속도감 있게: 초반엔 빠르고 후반엔 천천히
      const step = current < 60
        ? Math.random() * 10 + 5   // 초반: 5~15%
        : Math.random() * 4 + 1;   // 후반: 1~5%

      current = Math.min(current + step, 95);
      setProgress(current);

      if (current >= 95) {
        clearInterval(interval);
        setTimeout(() => {
          setProgress(100);
          if (!completedRef.current) {
            completedRef.current = true;
            setTimeout(onComplete, 350);
          }
        }, 600);
      }
    }, 220);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '390px',
        height: '844px',
        background: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      {/* 마스코트: 원본 302×375의 80% → 242×300, 가로 중심 유지 */}
      <img
        src={deltaFloating}
        alt="Delta"
        draggable={false}
        style={{
          position: 'absolute',
          left: 76,
          top: 128,
          width: 242,
          height: 300,
          objectFit: 'contain',
          userSelect: 'none',
        }}
      />

      {/* 메인 텍스트: x=52, y=455 · Pretendard 24pt Medium #1A1A1A */}
      <p
        style={{
          position: 'absolute',
          left: 52,
          top: 455,
          margin: 0,
          fontFamily: 'Pretendard, sans-serif',
          fontSize: 24,
          fontWeight: 500,
          color: '#1A1A1A',
          whiteSpace: 'nowrap',
          lineHeight: '1.35',
        }}
      >
        AI가 영수증을 분석하고 있어요
      </p>

      {/* 서브 텍스트: 화면 중앙 · Pretendard 16pt Regular #555555 */}
      <p
        style={{
          position: 'absolute',
          top: 497,
          left: 0,
          right: 0,
          margin: 0,
          textAlign: 'center',
          fontFamily: 'Pretendard, sans-serif',
          fontSize: 16,
          fontWeight: 400,
          color: '#555555',
          lineHeight: '1.4',
        }}
      >
        잠시만 기다려 주세요!
      </p>

      {/* 진행률 바 트랙 */}
      <div
        style={{
          position: 'absolute',
          top: 543,
          left: 52,
          right: 52,
          height: 8,
          background: '#EBEBEB',
          borderRadius: 100,
          overflow: 'hidden',
        }}
      >
        {/* 초록 진행 바 */}
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: '#2ECC71',
            borderRadius: 100,
            transition: 'width 0.25s ease',
          }}
        />
      </div>
    </div>
  );
}
