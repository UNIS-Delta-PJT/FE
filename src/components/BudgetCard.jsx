import { mockBudget } from '../data/mockData';

export default function BudgetCard({ totalAmount, spent = 0 }) {
  const { total_amount: defaultTotal } = mockBudget;
  const total_amount = totalAmount ?? defaultTotal;
  const remaining = total_amount - spent;
  const percent = total_amount > 0 ? Math.round((spent / total_amount) * 100) : 0;

  const formatKRW = (n) => n.toLocaleString('ko-KR');

  return (
    <div
      className="flex flex-col"
      style={{ width: 353, height: 140, padding: '16px', gap: 8, boxSizing: 'border-box', borderRadius: 20, backgroundColor: '#FFFFFF', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}
    >
      {/* 상단: 남은 예산 + % */}
      <div>
        <p className="text-xs text-gray-400 mb-1 font-medium tracking-wide uppercase">
          이번 달 남은 예산
        </p>
        <div className="flex items-end justify-between">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-gray-900 tracking-tight">
              {formatKRW(remaining)}
            </span>
            <span className="text-sm text-gray-400 mb-1 font-medium">원</span>
          </div>
          <span className={`text-xs font-bold mb-1 ${percent >= 80 ? 'text-rose-500' : percent >= 60 ? 'text-amber-500' : 'text-[#1CD1A1]'}`}>
            {percent}%
          </span>
        </div>
      </div>

      {/* 프로그레스 바 */}
      <div>
        <div style={{ height: 14, borderRadius: 9999, backgroundColor: '#F4F4F4', overflow: 'hidden' }}>
          <div
            className="transition-all duration-700"
            style={{ width: `${percent}%`, height: '100%', borderRadius: 9999, background: 'linear-gradient(90deg, #D4F8E9 0%, #33E7B5 100%)' }}
          />
        </div>
      </div>

      {/* 하단: 사용/예산 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1CD1A1]" />
          <span className="text-xs text-gray-400">사용</span>
          <span className="text-xs font-bold text-gray-600">
            {formatKRW(spent)}원
          </span>
        </div>
        <div className="w-px h-3 bg-gray-200" />
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          <span className="text-xs text-gray-400">예산</span>
          <span className="text-xs font-bold text-gray-600">
            {formatKRW(total_amount)}원
          </span>
        </div>
      </div>
    </div>
  );
}
