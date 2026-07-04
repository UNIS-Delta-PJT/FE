import deltaFloatingImg from '../assets/delta_floating.png';

export default function CharacterComingSoon() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70svh',
      gap: 0,
      userSelect: 'none',
    }}>
      {/* 캐릭터 이미지 */}
      <img
        src={deltaFloatingImg}
        alt="레온"
        draggable={false}
        style={{ width: 140, height: 140, objectFit: 'contain', marginBottom: 24 }}
      />

      {/* 메인 멘트 */}
      <p style={{
        fontFamily: 'Pretendard, sans-serif',
        fontSize: 22,
        fontWeight: 700,
        color: '#1A1A1A',
        margin: '0 0 10px',
        textAlign: 'center',
        lineHeight: 1.35,
      }}>
        레온이가 준비 중이에요! 🌱
      </p>

      {/* 서브 멘트 */}
      <p style={{
        fontFamily: 'Pretendard, sans-serif',
        fontSize: 14,
        fontWeight: 400,
        color: '#999999',
        margin: 0,
        textAlign: 'center',
        lineHeight: 1.6,
        whiteSpace: 'pre-line',
      }}>
        {'절약 습관을 쌓으면 레온이가 성장해요.\n곧 멋진 모습으로 찾아올게요 👀'}
      </p>

    </div>
  );
}
