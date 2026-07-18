import { useState, useEffect } from 'react';

/**
 * 광고 화면 (기본 30초, duration으로 조절 가능)
 * TODO: 광고 SDK(카카오 AdFit / AdMob 등) 연동 시 플레이스홀더 영역을 실제 광고로 교체
 */
export default function AdScreen({ onDone, duration = 30 }) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const finished = remaining <= 0;

  return (
    <div
      style={{
        width: '390px',
        minHeight: '100svh',
        position: 'relative',
        backgroundColor: '#1A1A1A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 우측 상단: 카운트다운 → 종료 시 닫기 버튼 (컨테이너 기준 absolute — 앱 프레임 안에 고정) */}
      <div style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 16px)', right: 16, zIndex: 10 }}>
        {finished ? (
          <button
            onClick={onDone}
            aria-label="광고 닫기"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 14M14 2L2 14" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        ) : (
          <div
            style={{
              minWidth: 36,
              height: 36,
              borderRadius: 18,
              padding: '0 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>
              {remaining}
            </span>
          </div>
        )}
      </div>

      {/* 좌측 상단: 광고 라벨 */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          left: 16,
          padding: '4px 10px',
          borderRadius: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          zIndex: 10,
        }}
      >
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 500, color: '#FFFFFF' }}>
          광고
        </span>
      </div>

      {/* ── 광고 콘텐츠 플레이스홀더 (SDK 연동 시 교체) ────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 24, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
          AD
        </span>
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>
          광고가 표시될 영역이에요
        </span>
      </div>

      {/* 하단 안내 */}
      {!finished && (
        <span
          style={{
            position: 'absolute',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: 'Pretendard, sans-serif',
            fontSize: 12,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          {remaining}초 후에 닫을 수 있어요
        </span>
      )}
    </div>
  );
}
