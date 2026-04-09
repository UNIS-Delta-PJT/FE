import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockCalendarData } from '../data/mockData';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function formatManwon(amount) {
  if (amount === 0) return '';
  const man = amount / 10000;
  return man >= 1
    ? `${man % 1 === 0 ? man : man.toFixed(1)}만`
    : `${(amount / 1000).toFixed(1)}천`;
}

function getWeekDates(baseDate) {
  const day = baseDate.getDay(); // 0=일
  const sunday = new Date(baseDate);
  sunday.setDate(baseDate.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function CalendarView() {
  const today = new Date();
  const [expanded, setExpanded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);

  const weekDates = getWeekDates(today);

  // 월간 달력용 날짜 배열
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startOffset = firstDay.getDay();
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;
  const monthDates = Array.from({ length: totalCells }, (_, i) => {
    const d = new Date(firstDay);
    d.setDate(1 - startOffset + i);
    return d;
  });

  const monthLabel = currentMonth.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  });

  const renderCell = (date, isMonthView = false) => {
    const key = toKey(date);
    const amount = mockCalendarData[key] ?? 0;
    const isToday = toKey(date) === toKey(today);
    const isSelected = toKey(date) === toKey(selectedDate);
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    const isSun = date.getDay() === 0;
    const isSat = date.getDay() === 6;

    return (
      <button
        key={key}
        onClick={() => setSelectedDate(date)}
        style={{ padding: '3px' }}
        className={`
          flex flex-col items-center justify-start rounded-xl transition-all
          ${isSelected ? 'bg-[#2ECC71]/20 border border-[#2ECC71]/50' : 'hover:bg-gray-50'}
          ${isMonthView && !isCurrentMonth ? 'opacity-20' : ''}
        `}
      >
        <span
          className={`
            w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold mb-0.5
            ${isToday ? 'bg-[#2ECC71] text-white shadow-md shadow-[#2ECC71]/40' : ''}
            ${!isToday && isSun ? 'text-rose-400' : ''}
            ${!isToday && isSat ? 'text-sky-400' : ''}
            ${!isToday && !isSun && !isSat ? 'text-gray-700' : ''}
          `}
        >
          {date.getDate()}
        </span>
        {amount > 0 && (
          <span className="text-[9px] font-semibold text-[#2ECC71] leading-none">
            {formatManwon(amount)}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="mx-4 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden" style={{ padding: '10px' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        {expanded ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                )
              }
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100"
            >
              <ChevronLeft size={14} className="text-gray-400" />
            </button>
            <span className="text-sm font-bold text-gray-900">{monthLabel}</span>
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                )
              }
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100"
            >
              <ChevronRight size={14} className="text-gray-400" />
            </button>
          </div>
        ) : (
          <span className="text-sm font-bold text-gray-900">
            {today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
          </span>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span>{expanded ? '주간' : '월간'}</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 px-3 mb-1" style={{ marginTop: '10px', marginBottom: '3px' }}>
        {DAY_LABELS.map((d, i) => (
          <span
            key={d}
            className={`text-center text-[10px] font-bold mb-1
              ${i === 0 ? 'text-rose-400/60' : i === 6 ? 'text-sky-400/60' : 'text-gray-400'}
            `}
          >
            {d}
          </span>
        ))}
      </div>

      {/* 캘린더 본문 */}
      <div className="px-3 pb-4">
        {expanded ? (
          // 월간 뷰
          <div className="grid grid-cols-7 gap-0.5">
            {monthDates.map((date) => renderCell(date, true))}
          </div>
        ) : (
          // 주간 뷰
          <div className="grid grid-cols-7 gap-0.5">
            {weekDates.map((date) => renderCell(date))}
          </div>
        )}
      </div>
    </div>
  );
}
