import baseImg from '../assets/character_base_noeyes.png';
import eyesRound from '../assets/eyes_01_round.png';
import eyesWink from '../assets/eyes_02_wink.png';
import eyesMixed from '../assets/eyes_03_mixed.png';
import eyesClosed from '../assets/eyes_04_closed.png';
import eyesCross from '../assets/eyes_05_cross.png';
import eyesHeart from '../assets/eyes_06_heart.png';

const EYE_SRC = {
  round: eyesRound,
  wink: eyesWink,
  mixed: eyesMixed,
  closed: eyesClosed,
  cross: eyesCross,
  heart: eyesHeart,
};

// 온보딩(260px 기준) 눈 좌표의 비율 — left 97, top 122, w 66, h 27
const EYE_RATIO = { left: 97 / 260, top: 122 / 260, w: 66 / 260, h: 27 / 260 };

/**
 * 온보딩에서 커스텀한 내 캐릭터 (색상 + 눈) 렌더링
 * localStorage: delta_character_color, delta_character_eyes
 */
export default function CharacterAvatar({ size = 140, style = {}, color: colorProp, eyes: eyesProp }) {
  // props로 지정하면 그 외형을, 아니면 내 커스텀(localStorage)을 사용
  let color = colorProp ?? '#FFFFFF';
  let eyes = eyesProp ?? 'round';
  if (colorProp === undefined && eyesProp === undefined) {
    try {
      color = localStorage.getItem('delta_character_color') || '#FFFFFF';
      eyes = localStorage.getItem('delta_character_eyes') || 'round';
    } catch { /* noop */ }
  }

  const eyeSrc = EYE_SRC[eyes] || eyesRound;

  return (
    <div style={{ position: 'relative', width: size, height: size, ...style }}>
      <img
        src={baseImg}
        alt="내 캐릭터"
        draggable={false}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
      {color !== '#FFFFFF' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: color, // 단색 hex와 그라데이션(상점 아이템) 모두 지원
            mixBlendMode: 'multiply',
            opacity: 0.6,
            WebkitMaskImage: `url(${baseImg})`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskImage: `url(${baseImg})`,
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            pointerEvents: 'none',
          }}
        />
      )}
      <img
        src={eyeSrc}
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          left: EYE_RATIO.left * size,
          top: EYE_RATIO.top * size,
          width: EYE_RATIO.w * size,
          height: EYE_RATIO.h * size,
          objectFit: 'contain',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
