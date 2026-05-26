/* 경고 토스트 공통 컴포넌트
   - 배경: #FF5A5F  높이: 30px  좌우패딩: 20px  border-radius: 20
   - 좌측 흰색 경고 아이콘 20×20 + 텍스트
*/

function WarningIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path
        d="M10 2L1.5 17H18.5L10 2Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      <rect x="9.25" y="8" width="1.5" height="5" rx="0.75" fill="white" />
      <rect x="9.25" y="14.5" width="1.5" height="1.5" rx="0.75" fill="white" />
    </svg>
  );
}

export default function WarningToast({ visible, fading, message, bottom = 100, style = {} }) {
  if (!visible) return null;
  return (
    <div
      className={fading ? 'toast-exit' : 'toast-enter'}
      style={{
        position: 'fixed',
        bottom,
        left: '50%',
        transform: 'translateX(-50%)',
        height: '30px',
        backgroundColor: '#FF5A5F',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        zIndex: 50,
        whiteSpace: 'nowrap',
        paddingLeft: '20px',
        paddingRight: '20px',
        ...style,
      }}
    >
      <WarningIcon />
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 400, color: '#FFFFFF' }}>
        {message}
      </span>
    </div>
  );
}
