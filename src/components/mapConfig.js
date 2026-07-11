// ── 맵 구성 공용 설정 (CharacterMapScreen + 홈 미니맵) ────────────────
export const TOTAL_STEPS = 100;

// 노랑: 보물상자 (코인 지급)
export const YELLOW_STEPS = new Set([2, 7, 16, 20, 23, 30, 37, 43, 47, 50, 52, 56, 61, 65, 70, 71, 78, 83, 92, 97]);

// 빨강: 페널티 (이동 효과)
export const RED_EFFECTS = {
  10: { label: '처음으로', to: () => 1 },
  22: { label: '처음으로', to: () => 1 },
  86: { label: '처음으로', to: () => 1 },
  55: { label: '2칸 뒤로', to: n => n - 2 },
  91: { label: '2칸 뒤로', to: n => n - 2 },
  67: { label: '1칸 뒤로', to: n => n - 1 },
  27: { label: '3칸 뒤로', to: n => n - 3 },
  40: { label: '5칸 뒤로', to: n => n - 5 },
  77: { label: '5칸 뒤로', to: n => n - 5 },
  75: { label: '6칸 뒤로', to: n => n - 6 },
};

// 컬러칩 (top: 윗면, base: 아래 입체 레이어)
export const COLOR = {
  green:  { top: '#1CD1A1', base: '#149B77' },
  yellow: { top: '#F5C308', base: '#C09903' },
  red:    { top: '#FF7682', base: '#D9545F' },
};

export function stepColor(n) {
  if (YELLOW_STEPS.has(n)) return COLOR.yellow;
  if (RED_EFFECTS[n]) return COLOR.red;
  return COLOR.green;
}

// ── 지그재그 좌표 ────────────────────────────────────────────────────
export const ROW_H = 96;         // 스텝 간 세로 간격
export const PAD_TOP = 160;      // 최상단(100번) 위 여백
export const PAD_BOTTOM = 80;    // 최하단(1번) 아래 여백
export const X_LEFT = 120;
export const X_RIGHT = 270;
export const STEP_W = 65;
export const STEP_H = 60;
export const DEPTH = 7;          // 입체 두께

// n번 스텝의 중심 좌표 (1번이 맨 아래)
export function stepPos(n) {
  const y = PAD_TOP + (TOTAL_STEPS - n) * ROW_H;
  const x = n % 2 === 0 ? X_LEFT : X_RIGHT;
  return { x, y };
}

export const MAP_HEIGHT = PAD_TOP + (TOTAL_STEPS - 1) * ROW_H + PAD_BOTTOM + STEP_H;

// 길(도로) SVG 경로 문자열
export const ROAD_PATH = Array.from({ length: TOTAL_STEPS }, (_, i) => {
  const { x, y } = stepPos(i + 1);
  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
}).join(' ');
