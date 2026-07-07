import { useState } from 'react';
import characterImg from '../assets/character_preview.png';

// 색상 탭 팔레트 (4x2)
const COLORS = ['#FFFFFF', '#FFD1DC', '#E0C3FC', '#CAF0F8', '#FFECD2', '#AAF0D1', '#FBC4AB', '#98F5E1'];

const TABS = ['색상', '눈'];

export default function CharacterSetupScreen({ onNext }) {
  const [tab, setTab] = useState('색상');
  const [color, setColor] = useState('#FFFFFF');
  const [nickname, setNickname] = useState('');

  function handleStart() {
    localStorage.setItem('delta_nickname', nickname.trim());
    localStorage.setItem('delta_character_color', color);
    onNext();
  }

  return (
    <div
      className="bg-white overflow-hidden"
      style={{ width: '390px', minHeight: '844px', position: 'relative' }}
    >
      {/* 헤딩 */}
      <p
        style={{
          position: 'absolute',
          top: '89px',
          left: '20px',
          right: '20px',
          fontFamily: 'Pretendard, sans-serif',
          fontSize: '24px',
          fontWeight: 600,
          color: '#1A1A1A',
          textAlign: 'center',
          zIndex: 2,
        }}
      >
        나의 캐릭터를 꾸며보세요!
      </p>

      {/* 캐릭터 프리뷰 영역 */}
      <div style={{ position: 'absolute', top: '99px', left: '21px', width: '348px', height: '310px' }}>
        {/* overlay + blur 배경 원 */}
        <div
          style={{
            position: 'absolute',
            top: '47px',
            left: '47px',
            width: '256px',
            height: '256px',
            borderRadius: '50%',
            backgroundColor: 'rgba(170, 240, 209, 0.3)', // #AAF0D1 30%
            filter: 'blur(30px)',
          }}
        />
        {/* 캐릭터 이미지 + 선택 색상 틴트 */}
        <div style={{ position: 'absolute', top: '10px', left: '44px', width: '260px', height: '260px' }}>
          <img
            src={characterImg}
            alt="기본 캐릭터"
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
          {color !== '#FFFFFF' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: color,
                mixBlendMode: 'multiply',
                opacity: 0.6,
                WebkitMaskImage: `url(${characterImg})`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskImage: `url(${characterImg})`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      </div>

      {/* 닉네임 입력 */}
      <div
        style={{
          position: 'absolute',
          top: '372px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임을 입력해주세요"
          maxLength={10}
          style={{
            width: '200px',
            height: '40px',
            backgroundColor: '#F4F4F4',
            border: 'none',
            borderRadius: '20px',
            outline: 'none',
            textAlign: 'center',
            fontFamily: 'Pretendard, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            color: '#1A1A1A',
          }}
        />
      </div>

      {/* 캐릭터 상세 수정 섹션 */}
      <div
        style={{
          position: 'absolute',
          top: '436px',
          left: '21px',
          width: '350px',
          height: '272px',
          backgroundColor: '#FFFFFF',
          borderRadius: '48px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.08)', // 위쪽 drop shadow
          boxSizing: 'border-box',
        }}
      >
        {/* 슬라이딩 탭 바 */}
        <div
          style={{
            position: 'relative',
            width: '302px',
            height: '56px',
            backgroundColor: '#F4F4F4',
            borderRadius: '32px',
            padding: '6px',
            display: 'flex',
            boxSizing: 'border-box',
          }}
        >
          {/* 슬라이딩 인디케이터 */}
          <div
            style={{
              position: 'absolute',
              top: '6px',
              left: '6px',
              width: '145px',
              height: '44px',
              borderRadius: '26px',
              background: 'linear-gradient(90deg, #1CD1A1 0%, #34E8B6 100%)',
              transform: tab === '색상' ? 'translateX(0)' : 'translateX(145px)',
              transition: 'transform 0.25s ease',
            }}
          />
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                position: 'relative',
                flex: 1,
                height: '44px',
                border: 'none',
                background: 'none',
                borderRadius: '26px',
                cursor: 'pointer',
                fontFamily: 'Pretendard, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: tab === t ? '#FFFFFF' : '#3F4944',
                transition: 'color 0.25s ease',
                padding: 0,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* 색상 탭 콘텐츠 */}
        {tab === '색상' && (
          <div
            style={{
              width: '302px',
              height: '144px',
              padding: '8px 0',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 56px)',
              gap: '16px',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                aria-label={`색상 ${c}`}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: c,
                  boxShadow:
                    '4px 4px 10px rgba(0, 0, 0, 0.10), inset 3px 3px 6px rgba(255, 255, 255, 0.5), inset -3px -3px 6px rgba(0, 0, 0, 0.05)',
                  outline: color === c ? '2px solid #1CD1A1' : 'none',
                  outlineOffset: '3px',
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}

        {/* 눈 탭 콘텐츠 (준비 중) */}
        {tab === '눈' && (
          <div
            style={{
              width: '302px',
              height: '144px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'Pretendard, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: '#999999',
              }}
            >
              준비 중이에요!
            </span>
          </div>
        )}
      </div>

      {/* 시작하기 버튼 */}
      <button
        onClick={handleStart}
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
