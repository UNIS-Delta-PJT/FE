import { useState } from 'react';
import appleIcon from '../assets/icon-apple.png';
import kakaoIcon from '../assets/icon-kakao.png';
import googleIcon from '../assets/icon-google.png';
import loginCharacterImg from '../assets/login_character.png';

const TOAST_STYLE = {
  position: 'fixed',
  bottom: '100px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '179px',
  height: '40px',
  backgroundColor: 'rgba(255, 90, 95, 0.5)',
  borderRadius: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
  whiteSpace: 'nowrap',
};

export default function LoginScreen({ onLogin, onTempLogin }) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastFading, setToastFading] = useState(false);

  function showToast() {
    setToast(true);
    setToastFading(false);
    setTimeout(() => {
      setToastFading(true);
      setTimeout(() => setToast(false), 300);
    }, 1700);
  }

  async function handleTempLogin() {
    if (loading) return;
    setLoading(true);
    try {
      await onTempLogin();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="bg-white overflow-hidden"
      style={{ width: '390px', minHeight: '844px', position: 'relative' }}
    >
      {/* 연동 예정 토스트 */}
      {toast && (
        <div className={toastFading ? 'toast-exit' : 'toast-enter'} style={TOAST_STYLE}>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 400, color: '#FFFFFF' }}>
            연동 예정이예요.
          </span>
        </div>
      )}
      {/* 로그인 캐릭터 이미지 */}
      <img
        src={loginCharacterImg}
        alt="델타 캐릭터"
        style={{
          position: 'absolute',
          left: '109px',
          top: '89px',
          width: '175px',
          height: '77px',
          objectFit: 'contain',
          zIndex: 1,
        }}
      />

      {/* 헤딩 영역 (텍스트만) */}
      <div style={{ position: 'absolute', top: '174px', left: '20px', right: '20px' }}>
        <p
          style={{
            fontFamily: 'Pretendard, sans-serif',
            fontSize: '28px',
            fontWeight: 700,
            color: '#1A1A1A',
            lineHeight: '1.3',
            marginBottom: '12px',
            textAlign: 'center',
          }}
        >
          델타에 오신 것을 환영합니다!
        </p>
        <p
          style={{
            fontFamily: 'Pretendard, sans-serif',
            fontSize: '16px',
            fontWeight: 500,
            color: '#999999',
            lineHeight: '1.5',
            whiteSpace: 'pre-line',
            textAlign: 'center',
          }}
        >
          {`지루한 가계부 대신 델타와 함께하는 매일의\n미션을 즐겨보세요!`}
        </p>
      </div>

      {/* 버튼 영역 */}
      <div style={{ position: 'absolute', top: '340px', left: '20px', right: '20px' }}>

        {/* 계정 생성하기 버튼 */}
        <button
          onClick={onLogin}
          style={{
            width: '353px',
            height: '60px',
            background: 'linear-gradient(90deg, #1CD1A1 0%, #34E8B6 100%)',
            borderRadius: '100px',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(28, 209, 161, 0.40)',
          }}
        >
          <span
            style={{
              fontFamily: 'Pretendard, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              color: '#FFFFFF',
            }}
          >
            계정 생성하기
          </span>
        </button>

        {/* 로그인 안내 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            marginTop: '20px',
          }}
        >
          <span
            style={{
              fontFamily: 'Pretendard, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              color: '#1A1A1A',
            }}
          >
            이미 계정이 있으신가요?
          </span>
          <button
            onClick={handleTempLogin}
            disabled={loading}
            style={{
              fontFamily: 'Pretendard, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              color: '#1CD1A1',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </div>

        {/* Divider + or */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '28px',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: '#EAEAEA' }} />
          <span
            style={{
              fontFamily: 'Pretendard, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              color: '#999999',
            }}
          >
            or
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#EAEAEA' }} />
        </div>

        {/* 소셜 로그인 버튼 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          {[
            { icon: appleIcon, label: 'Apple로 계속하기' },
            { icon: kakaoIcon, label: '카카오톡으로 계속하기' },
            { icon: googleIcon, label: 'Google로 계속하기' },
          ].map(({ icon, label }) => (
            <button
              key={label}
              onClick={showToast}
              style={{
                width: '353px',
                height: '60px',
                backgroundColor: '#EAEAEA',
                border: '1.5px solid #F4F4F4',
                borderRadius: '100px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              }}
            >
              <img src={icon} alt={label} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
              <span
                style={{
                  fontFamily: 'Pretendard, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#1A1A1A',
                }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
