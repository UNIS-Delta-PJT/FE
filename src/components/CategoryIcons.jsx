import vehicleImg from '../assets/icon_vehicle.png';

const W = '#FFFFFF'; // 벡터 아이콘 기본 컬러

// PNG 아이콘을 SVG color prop과 동일하게 색상 적용하기 위한 CSS filter 변환
function hexToFilter(hex = '#FFFFFF') {
  const h = (hex || '#FFFFFF').toUpperCase().trim();
  if (h === '#FFFFFF' || h === '#FFF' || h === 'WHITE') return 'brightness(0) invert(1)';
  if (h === '#000000' || h === '#000' || h === 'BLACK') return 'brightness(0)';
  if (h === '#006D37') return 'brightness(0) saturate(100%) invert(23%) sepia(76%) saturate(745%) hue-rotate(107deg) brightness(97%) contrast(101%)';
  if (h === '#3D4A3E') return 'brightness(0) saturate(100%) invert(27%) sepia(6%) saturate(651%) hue-rotate(83deg) brightness(82%) contrast(89%)';
  if (h === '#EF4444') return 'brightness(0) saturate(100%) invert(42%) sepia(73%) saturate(5000%) hue-rotate(335deg) brightness(101%) contrast(91%)';
  if (h === '#27AE60') return 'brightness(0) saturate(100%) invert(44%) sepia(64%) saturate(556%) hue-rotate(104deg) brightness(97%) contrast(91%)';
  if (h === '#2ECC71') return 'brightness(0) saturate(100%) invert(65%) sepia(49%) saturate(500%) hue-rotate(99deg) brightness(99%) contrast(91%)';
  if (h === '#555555' || h === '#555') return 'brightness(0) saturate(0%) brightness(33%)';
  return 'brightness(0) invert(1)'; // fallback: white
}

function ShoppingIcon({ color = W, width = 18, height = 16 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 18 16" fill="none">
      <rect x="2" y="5" width="14" height="10" rx="1.5" stroke={color} strokeWidth="1.5"/>
      <path
        d="M6.5 5C6.5 3.2 7.5 1.5 9 1.5C10.5 1.5 11.5 3.2 11.5 5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FoodIcon({ color = W, width = 18, height = 16 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 18 16" fill="none">
      <rect x="2" y="2" width="10" height="10" rx="1" stroke={color} strokeWidth="1.5"/>
      <path
        d="M12 5C14 5 15.5 5.8 15.5 7C15.5 8.2 14 9 12 9"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line x1="1" y1="14" x2="15" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function TicketIcon({ color = W, width = 18, height = 16 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 18 16" fill="none">
      <path
        d="M4 2H14C15.1 2 16 2.9 16 4V6.5C15.2 6.5 14.5 7.2 14.5 8C14.5 8.8 15.2 9.5 16 9.5V12C16 13.1 15.1 14 14 14H4C2.9 14 2 13.1 2 12V9.5C2.8 9.5 3.5 8.8 3.5 8C3.5 7.2 2.8 6.5 2 6.5V4C2 2.9 2.9 2 4 2Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomeIcon({ color = W, width = 18, height = 16 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 18 16" fill="none">
      <path
        d="M1 8L9 1.5L17 8V15H1V8Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 8L8.5 11.5H10.5L8.5 15"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── 카테고리별 아이콘 + 배경색 설정 ────────────────────────────────
const CATEGORY_CONFIG = {
  교통:   { isPng: true,  pngSrc: vehicleImg, bg: '#FED023' },
  카페:   { Icon: FoodIcon,    bg: '#0FA950' },
  쇼핑:   { Icon: ShoppingIcon, bg: '#90BAFF' },
  식비:   { Icon: FoodIcon,    bg: '#BCBCBC' },
  문화비:  { Icon: TicketIcon,  bg: '#BCBCBC' },
  문화:   { Icon: TicketIcon,  bg: '#BCBCBC' },
  생활비:  { Icon: HomeIcon,   bg: '#BCBCBC' },
  기타:   { Icon: ShoppingIcon, bg: '#90BAFF' },
};

const DEFAULT_CONFIG = { Icon: ShoppingIcon, bg: '#90BAFF' };

export function getCategoryBg(name) {
  return (CATEGORY_CONFIG[name] ?? DEFAULT_CONFIG).bg;
}

export default function CategoryIcon({ name, width = 18, height = 16, color = W }) {
  const config = CATEGORY_CONFIG[name] ?? DEFAULT_CONFIG;
  if (config.isPng) {
    return (
      <img
        src={config.pngSrc}
        alt={name}
        draggable={false}
        style={{ width, height, objectFit: 'contain', filter: hexToFilter(color) }}
      />
    );
  }
  const { Icon } = config;
  return <Icon width={width} height={height} color={color} />;
}
