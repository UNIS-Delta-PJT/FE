import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { mockTodayExpenses } from '../data/mockData';


const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(date) {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

function formatTime(time) {
  const [h, m] = time.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

function ExpenseCard({ item }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-gray-100 border border-gray-100" style={{padding: 6}}>
      {/* 아이콘 */}
      <div className="w-10 h-10 rounded-3xl bg-white flex items-center justify-center text-lg flex-shrink-0">
        {item.icon}
      </div>

      {/* 소비처 + 카테고리 + 시간 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{item.place}</p>
        <p className="text-[11px] text-gray-900 mt-0.5">
          {item.name} · {formatTime(item.expense_date)}
        </p>
      </div>

      {/* 금액 */}
      <span className="text-sm font-black text-gray-900 flex-shrink-0">
        -{item.amount.toLocaleString('ko-KR')}원
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
    <div className="mx-4 flex flex-col gap-2">
      {/* 헤더 — 카드 바깥 */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-base font-bold text-[#000000]">오늘의 소비 내역</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            총 {items.length}건 ·{' '}
            <span className="text-[#2ECC71] font-semibold">
              {totalToday.toLocaleString('ko-KR')}원
            </span>
          </p>
        </div>
        <span className="text-xs text-gray-400">
          {formatDate(new Date())}
        </span>
      </div>

      {/* 소비 내역 카드 목록 */}
      {visibleItems.map((item) => (
        <ExpenseCard key={item.expense_id} item={item} />
      ))}

      {/* 더보기 / 접기 버튼 */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full flex items-center justify-center gap-1 text-xs text-[#2ECC71] font-semibold rounded-xl bg-[#2ECC71]/10 active:scale-95 transition-transform"
          style={{ paddingTop: '8px', paddingBottom: '8px' }}
        >
          {showAll ? (
            <>접기 <ChevronUp size={13} /></>
          ) : (
            <>{items.length - PREVIEW_COUNT}개 더보기 <ChevronDown size={13} /></>
          )}
        </button>
      )}
    </div>
  );
}
