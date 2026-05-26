import navHomeOn       from '../assets/nav_home_activated.png';
import navHomeOff      from '../assets/nav_home_deactivated.png';
import navReportOn     from '../assets/nav_report_activated.png';
import navReportOff    from '../assets/nav_report_deactivated.png';
import navCharacterOn  from '../assets/nav_character_activated.png';
import navCharacterOff from '../assets/nav_character_deactivated.png';
import navBudgetOn     from '../assets/nav_budget_activated.png';
import navBudgetOff    from '../assets/nav_budget_deactivated.png';

const NAV_ITEMS = [
  { key: 'home',      on: navHomeOn,      off: navHomeOff      },
  { key: 'report',    on: navReportOn,    off: navReportOff    },
  { key: 'character', on: navCharacterOn, off: navCharacterOff },
  { key: 'budget',    on: navBudgetOn,    off: navBudgetOff    },
];

export default function BottomNav({ activeTab = 'home', onTabChange }) {
  return (
    <nav className="shrink-0 px-4 pb-4">
      <div
        className="flex items-center justify-around bg-white rounded-[20px]"
        style={{ padding: 14, boxShadow: '0 -4px 12px rgba(0,0,0,0.06)' }}
      >
        {NAV_ITEMS.map(({ key, on, off }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => onTabChange?.(key)}
              className="flex items-center justify-center px-5 py-1 rounded-xl active:scale-90 transition-transform"
            >
              <img src={active ? on : off} alt={key} width={36} height={36} draggable={false} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
