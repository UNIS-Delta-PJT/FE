import navHomeOn       from '../assets/nav_home_activated.png';
import navHomeOff      from '../assets/nav_home_deactivated.png';
import navReportOn     from '../assets/nav_report_activated.png';
import navReportOff    from '../assets/nav_report_deactivated.png';
import navCharacterOn  from '../assets/nav_character_activated.png';
import navCharacterOff from '../assets/nav_character_deactivated.png';
import navBudgetOn     from '../assets/nav_budget_activated.png';
import navBudgetOff    from '../assets/nav_budget_deactivated.png';

// size: 표시 높이(px). 캐릭터 아이콘은 원본(18x21)에 여백이 없어
// 40x40에 여백이 포함된 다른 아이콘들과 시각적 크기를 맞추기 위해 작게 렌더링
const NAV_ITEMS = [
  { key: 'home',      on: navHomeOn,      off: navHomeOff,      size: 36 },
  { key: 'report',    on: navReportOn,    off: navReportOff,    size: 36 },
  { key: 'character', on: navCharacterOn, off: navCharacterOff, size: 24 },
  { key: 'budget',    on: navBudgetOn,    off: navBudgetOff,    size: 36 },
];

export default function BottomNav({ activeTab = 'home', onTabChange }) {
  return (
    <nav className="shrink-0 px-4 pb-4">
      <div
        className="flex items-center justify-around bg-white rounded-[20px]"
        style={{ padding: 14, boxShadow: '0 -4px 12px rgba(0,0,0,0.06)' }}
      >
        {NAV_ITEMS.map(({ key, on, off, size }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => onTabChange?.(key)}
              className="flex items-center justify-center px-5 py-1 rounded-xl active:scale-90 transition-transform"
            >
              <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={active ? on : off}
                  alt={key}
                  draggable={false}
                  style={{ height: size, width: 'auto', objectFit: 'contain' }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
