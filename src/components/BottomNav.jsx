import { Home, BarChart2, Swords, Wallet } from 'lucide-react';

const NAV_ITEMS = [
  { icon: Home, label: '홈', active: true },
  { icon: BarChart2, label: '리포트', active: false },
  { icon: Swords, label: '캐릭터', active: false },
  { icon: Wallet, label: '예산', active: false },
];

export default function BottomNav() {
  return (
    <nav className="sticky bottom-0 left-0 right-0 z-40 px-4 pb-4">
      <div className="flex items-center justify-around px-2 pt-2 pb-2 bg-white/100 backdrop-md rounded-xl shadow-[0_-4px_12px_rgba(0,0,0,0.06)]" style={{padding: 10}}>
        {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl active:scale-95 transition-transform"
          >
            <Icon
              size={22}
              className={active ? 'text-[#2ECC71]' : 'text-gray-400'}
              strokeWidth={active ? 2.5 : 1.8}
            />
            <span
              className={`text-[10px] font-bold ${active ? 'text-[#2ECC71]' : 'text-gray-400'}`}
            >
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
