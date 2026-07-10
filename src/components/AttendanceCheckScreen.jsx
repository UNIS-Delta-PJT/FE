import tickIcon from '../assets/clipboard_tick.png';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export default function AttendanceCheckScreen({ onNext, streak = 31 }) {
  // 이번 주 날짜 계산 (일요일 시작)
  const today = new Date();
  const todayDay = today.getDay(); // 0=일 ~ 6=토
  const week = DAY_LABELS.map((label, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - todayDay + i);
    return {
      label,
      date: d.getDate(),
      checked: i <= todayDay, // 오늘까지 연속 출석 성공
    };
  });

  return (
    <div
      className="bg-white overflow-hidden"
      style={{ width: '390px', minHeight: '844px', position: 'relative' }}
    >
      {/* 연속 출석 일수 */}
      <p
        style={{
          position: 'absolute',
          top: '223px',
          left: 0,
          right: 0,
          fontFamily: 'Pretendard, sans-serif',
          fontSize: '100px',
          fontWeight: 700,
          color: '#34E8B6',
          lineHeight: '74px',
          textAlign: 'center',
        }}
      >
        {streak}
      </p>

      {/* 일 연속 출석 */}
      <p
        style={{
          position: 'absolute',
          top: '297px',
          left: 0,
          right: 0,
          fontFamily: 'Pretendard, sans-serif',
          fontSize: '30px',
          fontWeight: 600,
          color: '#000000',
          textAlign: 'center',
        }}
      >
        일 연속 출석
      </p>

      {/* 요일 라벨 + 일별 출석 원 */}
      <div
        style={{
          position: 'absolute',
          top: '361px',
          left: '25.5px',
          width: '339px',
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 45px)',
          columnGap: '4px',
          justifyItems: 'center',
          rowGap: '10px',
        }}
      >
        {week.map(({ label }) => (
          <span
            key={label}
            style={{
              fontFamily: 'Pretendard, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              color: '#5D5D5D',
              height: '16px',
              lineHeight: '16px',
            }}
          >
            {label}
          </span>
        ))}
        {week.map(({ label, date, checked }) => (
          <div
            key={`circle-${label}`}
            style={{
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              backgroundColor: checked ? '#34E8B6' : '#F0F0F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {checked ? (
              <img
                src={tickIcon}
                alt="출석 완료"
                style={{
                  width: '24px',
                  height: '24px',
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)', // #FFFFFF
                }}
              />
            ) : (
              <span
                style={{
                  fontFamily: 'Pretendard, sans-serif',
                  fontSize: '18px',
                  fontWeight: 500,
                  color: '#575757',
                }}
              >
                {date}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 응원 멘트 */}
      <p
        style={{
          position: 'absolute',
          top: '455px',
          left: 0,
          right: 0,
          fontFamily: 'Pretendard, sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          color: '#000000',
          textAlign: 'center',
        }}
      >
        벌써 한달이나 지났다니!
      </p>

      {/* 계속하기 버튼 (floating) */}
      <button
        onClick={onNext}
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          width: '353px',
          height: '56px',
          background: 'linear-gradient(90deg, #1CD1A1 0%, #34E8B6 100%)',
          borderRadius: '100px',
          border: 'none',
          cursor: 'pointer',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
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
          계속하기
        </span>
      </button>
    </div>
  );
}
