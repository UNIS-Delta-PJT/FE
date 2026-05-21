import { Home, BarChart2, Swords, Wallet } from 'lucide-react';

const NAV_ITEMS = [
  { icon: Home,     label: '홈',    key: 'home'      },
  { icon: BarChart2,label: '리포트', key: 'report'   },
  { icon: Swords,   label: '캐릭터', key: 'character' },
  { icon: Wallet,   label: '예산',  key: 'budget'    },
];

export default function BottomNav({ activeTab = 'home', onTabChange }) {
  return (
    <nav className="shrink-0 px-4 pb-4">
      <div className="flex items-center justify-around bg-white/100 backdrop-md rounded-[20px] shadow-[0_-4px_12px_rgba(0,0,0,0.06)]" style={{ padding: 10 }}>
        {NAV_ITEMS.map(({ icon: Icon, label, key }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => onTabChange?.(key)}
              className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl active:scale-95 transition-transform"
            >
              <Icon size={22} color={active ? '#2ECC71' : '#9CA3AF'} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] font-bold ${active ? 'text-[#2ECC71]' : 'text-gray-400'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
