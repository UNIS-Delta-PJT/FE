import { useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { updateNotifications } from '../api/user';

/**
 * 야간 방해금지 설정 여부 확인 유틸
 * 알림 발송 지점에서 이 함수를 통과해야 알림을 보냄 (22:00 ~ 07:00 차단)
 * TODO: 푸시 알림 도입 시 발송 로직에서 호출
 */
export function canNotify() {
  try {
    const dnd = JSON.parse(localStorage.getItem('delta_dnd_night') || 'false');
    if (!dnd) return true;
    const hour = new Date().getHours();
    return !(hour >= 22 || hour < 7);
  } catch {
    return true;
  }
}

// 온/오프 스위치
function Switch({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={on ? '알림 방해금지 끄기' : '알림 방해금지 켜기'}
      style={{
        width: 48,
        height: 28,
        borderRadius: 14,
        backgroundColor: on ? '#1CD1A1' : '#EAEAEA',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 0.2s ease',
        padding: 0,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 23 : 3,
          width: 22,
          height: 22,
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left 0.2s ease',
        }}
      />
    </button>
  );
}

export default function SettingsScreen({ onBack, onLogout }) {
  const [dnd, setDnd] = useState(() => {
    try { return JSON.parse(localStorage.getItem('delta_dnd_night') || 'false'); }
    catch { return false; }
  });
  const [toast, setToast] = useState(false);
  const [toastFading, setToastFading] = useState(false);

  function toggleDnd() {
    setDnd(prev => {
      const next = !prev;
      localStorage.setItem('delta_dnd_night', JSON.stringify(next));
      // 서버 알림 설정 동기화 (PATCH /api/v1/users/notifications) — 실패 시 로컬만 유지
      updateNotifications({ isPushEnabled: true, isNightPushDisabled: next }).catch(() => {});
      return next;
    });
  }

  function showComingSoonToast() {
    setToast(true);
    setToastFading(false);
    setTimeout(() => {
      setToastFading(true);
      setTimeout(() => setToast(false), 300);
    }, 1700);
  }

  const rowLabelStyle = {
    fontFamily: 'Pretendard, sans-serif',
    fontSize: '16px',
    fontWeight: 500,
    color: '#000000',
  };

  return (
    <div
      className="bg-white"
      style={{ width: '390px', minHeight: '844px', position: 'relative' }}
    >
      {/* 추가 예정 토스트 */}
      {toast && (
        <div
          className={toastFading ? 'toast-exit' : 'toast-enter'}
          style={{
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '6px 16px',
            backgroundColor: 'rgba(255, 90, 95, 0.5)',
            borderRadius: '20px',
            zIndex: 50,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 400, color: '#FFFFFF' }}>
            추가 예정이예요
          </span>
        </div>
      )}

      {/* 뒤로가기 */}
      <button
        onClick={onBack}
        className="active:scale-90 transition-transform"
        style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', cursor: 'pointer', padding: 4, zIndex: 2 }}
      >
        <ArrowLeft size={22} color="#1A1A1A" />
      </button>

      {/* 헤딩 */}
      <p
        style={{
          position: 'absolute',
          top: '20px',
          left: 0,
          right: 0,
          fontFamily: 'Pretendard, sans-serif',
          fontSize: '24px',
          fontWeight: 600,
          color: '#000000',
          textAlign: 'center',
        }}
      >
        설정
      </p>

      {/* 야간 알림 방해금지 */}
      <div
        style={{
          position: 'absolute',
          top: '95px',
          left: '24px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={rowLabelStyle}>야간 알림 방해금지</span>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 500, color: '#999999' }}>
            22:00 이후 알림 끄기
          </span>
        </div>
        <Switch on={dnd} onToggle={toggleDnd} />
      </div>

      {/* 자주 묻는 질문(FAQ) */}
      <button
        onClick={showComingSoonToast}
        style={{
          position: 'absolute',
          top: '171px',
          left: '24px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <span style={rowLabelStyle}>자주 묻는 질문(FAQ)</span>
        <ChevronRight size={20} color="#999999" />
      </button>

      {/* 개인정보 처리방침 */}
      <button
        onClick={showComingSoonToast}
        style={{
          position: 'absolute',
          top: '227px',
          left: '24px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <span style={rowLabelStyle}>개인정보 처리방침</span>
        <ChevronRight size={20} color="#999999" />
      </button>

      {/* 로그아웃 */}
      <button
        onClick={onLogout}
        style={{
          position: 'absolute',
          top: '283px',
          left: '24px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          fontFamily: 'Pretendard, sans-serif',
          fontSize: '16px',
          fontWeight: 500,
          color: '#FF7682',
        }}
      >
        로그아웃
      </button>
    </div>
  );
}
