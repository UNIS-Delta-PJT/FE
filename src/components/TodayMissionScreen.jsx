import missionCharacterImg from '../assets/mission_character.png';
import coinCheckIcon from '../assets/icon_coin_check.png';
import calendarIcon from '../assets/icon_mission_calendar.png';
import receiptIcon from '../assets/icon_mission_receipt.png';
import diceIcon from '../assets/icon_mission_dice.png';

// ── 미션 데이터 (TODO: 백엔드 연동 시 API로 대체) ───────────────────
const MISSIONS = [
  {
    name: '오늘의 출석',
    icon: calendarIcon,
    iconBg: 'rgba(88, 204, 2, 0.1)',   // #58CC02 10%
    iconColor: '#449F01',
    done: true,
  },
  {
    name: '오늘의 지출 기록하기',
    icon: receiptIcon,
    iconBg: 'rgba(28, 176, 246, 0.1)', // #1CB0F6 10%
    iconColor: '#1CB0F6',
    done: false,
    progress: 0.5,
  },
  {
    name: '주사위 1회 굴리기',
    icon: diceIcon,
    iconBg: 'rgba(144, 186, 255, 0.1)', // #90BAFF 10%
    iconColor: '#90BAFF',
    done: false,
    progress: 0,
  },
];

export default function TodayMissionScreen({ onNext }) {
  return (
    <div
      className="bg-white overflow-hidden"
      style={{ width: '390px', minHeight: '100%', position: 'relative' }}
    >
      {/* 캐릭터 이미지 */}
      <img
        src={missionCharacterImg}
        alt="미션 캐릭터"
        draggable={false}
        style={{
          position: 'absolute',
          top: '25px',
          left: '115px',
          width: '160px',
          height: '129px',
          objectFit: 'contain',
        }}
      />

      {/* 타이틀 */}
      <p
        style={{
          position: 'absolute',
          top: '173px',
          left: 0,
          right: 0,
          fontFamily: 'Pretendard, sans-serif',
          fontSize: '24px',
          fontWeight: 600,
          color: '#1E293B',
          textAlign: 'center',
        }}
      >
        오늘의 미션
      </p>

      {/* 서브 타이틀 */}
      <p
        style={{
          position: 'absolute',
          top: '213px',
          left: 0,
          right: 0,
          fontFamily: 'Pretendard, sans-serif',
          fontSize: '12px',
          fontWeight: 500,
          color: '#94A3B8',
          textAlign: 'center',
        }}
      >
        오늘 획득할 수 있는 코인
      </p>

      {/* 미션 리스트 */}
      <div
        style={{
          position: 'absolute',
          top: '246px',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {MISSIONS.map(({ name, icon, iconBg, iconColor, done, progress }) => (
          <div
            key={name}
            style={{
              width: '353px',
              height: '88px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '16px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxSizing: 'border-box',
            }}
          >
            {/* 아이콘 */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <img src={icon} alt={name} style={{ width: '26px', height: '26px', objectFit: 'contain' }} draggable={false} />
            </div>

            {/* 미션명 + 보상/진행률 */}
            <div
              style={{
                flex: 1,
                height: '56px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span
                style={{
                  fontFamily: 'Pretendard, sans-serif',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#1E293B',
                  lineHeight: '20px',
                }}
              >
                {name}
              </span>
              {done ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <img
                    src={coinCheckIcon}
                    alt="완료"
                    style={{ width: '11.5px', height: '11.5px', objectFit: 'contain' }}
                  />
                  <span
                    style={{
                      fontFamily: 'Pretendard, sans-serif',
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#58CC02',
                      lineHeight: '16px',
                    }}
                  >
                    +1 Coin
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    width: '144px',
                    height: '12px',
                    borderRadius: '99999px',
                    backgroundColor: '#E5E5E5',
                    overflow: 'hidden',
                  }}
                >
                  {progress > 0 && (
                    <div
                      style={{
                        width: `${progress * 100}%`,
                        height: '100%',
                        borderRadius: '99999px',
                        background: `linear-gradient(90deg, ${iconColor}66 0%, ${iconColor} 100%)`,
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* 상태 배지 */}
            <div
              style={{
                width: '84px',
                height: '36px',
                borderRadius: '40px',
                padding: '8px 16px',
                backgroundColor: done ? '#E5E5E5' : '#34E8B6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxSizing: 'border-box',
              }}
            >
              <span
                style={{
                  fontFamily: 'Pretendard, sans-serif',
                  fontSize: '14px',
                  fontWeight: done ? 500 : 600,
                  color: done ? '#999999' : '#FFFFFF',
                  whiteSpace: 'nowrap',
                }}
              >
                {done ? '받기 완료' : '진행 중'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 시작하기 버튼 (floating) */}
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
          시작하기
        </span>
      </button>
    </div>
  );
}
