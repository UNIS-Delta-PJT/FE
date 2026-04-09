import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { mockTodayExpenses } from '../data/mockData';

const CATEGORY_COLORS = {
  카페: 'bg-amber-100 text-amber-600',
  식비: 'bg-green-100 text-green-600',
  교통: 'bg-sky-100 text-sky-600',
  편의점: 'bg-orange-100 text-orange-600',
  문화: 'bg-pink-100 text-pink-600',
};

function ExpenseRow({ item }) {
  return (
    <div className="flex items-center gap-3" style={{ paddingTop: '10px', paddingBottom: '10px' }}>
      {/* 아이콘 */}
      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
        {item.icon}
      </div>

      {/* 소비처 + 카테고리 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{item.place}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${CATEGORY_COLORS[item.category] ?? 'bg-gray-100 text-gray-500'}`}
          >
            {item.category}
          </span>
          <span className="text-[10px] text-gray-400">{item.time}</span>
        </div>
      </div>

      {/* 금액 */}
      <span className="text-sm font-black text-gray-900 flex-shrink-0">
        -{item.amount.toLocaleString('ko-KR')}
        <span className="text-xs font-normal text-gray-400 ml-0.5">원</span>
      </span>
    </div>
  );
}

export default function TodayExpenses() {
  const [showAll, setShowAll] = useState(false);
  const PREVIEW_COUNT = 3;
  const items = mockTodayExpenses;
  const visibleItems = showAll ? items : items.slice(0, PREVIEW_COUNT);
  const hasMore = items.length > PREVIEW_COUNT;

  const totalToday = items.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="mx-4 rounded-2xl bg-gray-50 border border-gray-200" style={{ padding: '10px' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-gray-900">오늘의 소비 내역</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            총 {items.length}건 ·{' '}
            <span className="text-[#2ECC71] font-semibold">
              {totalToday.toLocaleString('ko-KR')}원
            </span>
          </p>
        </div>
        <span className="text-xs text-gray-400">
          {new Date().toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
        </span>
      </div>

      {/* 구분선 */}
      <div className="h-px bg-gray-100 mb-1" />

      {/* 소비 내역 목록 */}
      <div className="divide-y divide-gray-100">
        {visibleItems.map((item) => (
          <ExpenseRow key={item.id} item={item} />
        ))}
      </div>

      {/* 더보기 / 접기 버튼 */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-2 flex items-center justify-center gap-1 text-xs text-[#2ECC71] font-semibold rounded-xl bg-[#2ECC71]/10 active:scale-95 transition-transform" style={{ paddingTop: '8px', paddingBottom: '8px' }}
        >
          {showAll ? (
            <>
              접기 <ChevronUp size={13} />
            </>
          ) : (
            <>
              {items.length - PREVIEW_COUNT}개 더보기 <ChevronDown size={13} />
            </>
          )}
        </button>
      )}
    </div>
  );
}
