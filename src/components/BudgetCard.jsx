import { mockBudget } from '../data/mockData';

export default function BudgetCard() {
  const { total_amount, spent } = mockBudget;
  const remaining = total_amount - spent;
  const percent = Math.round((spent / total_amount) * 100);

  const formatKRW = (n) => n.toLocaleString('ko-KR');

  // 프로그레스 색상: 80% 이상이면 빨강, 60% 이상이면 노랑
  const barColor =
    percent >= 80
      ? 'from-red-500 to-rose-400'
      : percent >= 60
      ? 'from-amber-400 to-orange-400'
      : 'from-[#2ECC71] to-emerald-400';

  return (
    <div className="mx-4 rounded-2xl bg-gray-50 border border-gray-200 shadow-sm" style={{ marginTop: '8px', padding: '10px' }}>
      {/* 상단: 남은 예산 */}
      <div className="mb-4">
        <p className="text-xs text-gray-400 mb-1 font-medium tracking-wide uppercase">
          이번 달 남은 예산
        </p>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-black text-gray-900 tracking-tight">
            {formatKRW(remaining)}
          </span>
          <span className="text-sm text-gray-400 mb-1 font-medium">원</span>
        </div>
      </div>

      {/* 프로그레스 바 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-400"> </span>
          <span
            className={`text-xs font-bold ${
              percent >= 80 ? 'text-rose-500' : percent >= 60 ? 'text-amber-500' : 'text-[#2ECC71]'
            }`}
          >
            {percent}%
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* 하단: 사용/예산 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71]" />
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
