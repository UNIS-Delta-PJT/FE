const COLOR = '#006D37';

function ShoppingIcon({ color = COLOR, width = 18, height = 16 }) {
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

function FoodIcon({ color = COLOR, width = 18, height = 16 }) {
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

function TransportIcon({ color = COLOR, width = 18, height = 16 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 18 16" fill="none">
      {/* 차체 정면 실루엣 */}
      <path
        d="M1 13V9L4.5 3H13.5L17 9V13C17 13.55 16.55 14 16 14H2C1.45 14 1 13.55 1 13Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* 왼쪽 헤드라이트 */}
      <circle cx="5" cy="11" r="1.5" stroke={color} strokeWidth="1.3"/>
      {/* 오른쪽 헤드라이트 */}
      <circle cx="13" cy="11" r="1.5" stroke={color} strokeWidth="1.3"/>
    </svg>
  );
}

const CATEGORY_MAP = {
  교통: TransportIcon,
  카페: FoodIcon,
  식비: FoodIcon,
};

export default function CategoryIcon({ name, width = 18, height = 16 }) {
  const Icon = CATEGORY_MAP[name] ?? ShoppingIcon;
  return <Icon width={width} height={height} />;
}
