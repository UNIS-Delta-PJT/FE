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

function TicketIcon({ color = COLOR, width = 18, height = 16 }) {
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

function HomeIcon({ color = COLOR, width = 18, height = 16 }) {
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

const CATEGORY_MAP = {
  교통: TransportIcon,
  카페: FoodIcon,
  식비: FoodIcon,
  문화비: TicketIcon,
  생활비: HomeIcon,
};

export default function CategoryIcon({ name, width = 18, height = 16, color }) {
  const Icon = CATEGORY_MAP[name] ?? ShoppingIcon;
  return <Icon width={width} height={height} color={color} />;
}
