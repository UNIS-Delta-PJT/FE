import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockCalendarData } from '../data/mockData';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DARK_GREEN = '#006D37';

function formatAmount(amount) {
  if (amount === 0) return '';
  const man = amount / 10000;
  return man >= 1
    ? `${man % 1 === 0 ? man : man.toFixed(1)}만`
    : `${(amount / 1000).toFixed(1)}천`;
}

// 월요일 시작 기준 해당 주의 날짜 배열
function getWeekDates(baseDate) {
  const day = baseDate.getDay();
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
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

  const weekDates = getWeekDates(today);

  // 월간 달력 날짜 배열 (월요일 시작)
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;
  const monthDates = Array.from({ length: totalCells }, (_, i) => {
    const d = new Date(firstDay);
    d.setDate(1 - startOffset + i);
    return d;
  });

  const renderCell = (date, isMonthView = false) => {
    const key = toKey(date);
    const amount = mockCalendarData[key] ?? 0;
    const isToday = key === toKey(today);
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    // M T W T F S S 순서: Mon=0 ... Sat=5, Sun=6
    const dayIdx = (date.getDay() + 6) % 7;
    const isSat = dayIdx === 5;
    const isSun = dayIdx === 6;

    const textColorClass = isToday || amount > 0
      ? ''
      : isSun
      ? 'text-rose-400'
      : isSat
      ? 'text-sky-400'
      : 'text-gray-700';

    const circleBg = isToday
      ? 'bg-[#2ECC71]/20 border border-[#2ECC71]/20'
      : amount > 0
      ? 'bg-[#F3F4F5]'
      : '';

    const dateStyle = isToday || amount > 0 ? { color: '#006D37' } : {};

    return (
      <button
        key={key}
        onClick={() => {}}
        className={`flex flex-col items-center justify-start py-1 rounded-xl transition-all ${isMonthView && !isCurrentMonth ? 'opacity-20' : ''}`}
      >
        <span
          className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold mb-0.5 ${circleBg} ${textColorClass}`}
          style={dateStyle}
        >
          {date.getDate()}
        </span>
        {amount > 0 && (
          <span className="text-[9px] font-bold leading-none" style={{ color: '#006D37' }}>
            {formatAmount(amount)}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-2" style={{ width: 353 }}>
      {/* 헤더 — 카드 바깥 */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-bold text-[#000000]">소비 캘린더</h3>
        <div className="flex items-center gap-2">
          {expanded && (
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              className="w-6 h-6 flex items-center justify-center rounded-lg bg-gray-100"
            >
              <ChevronLeft size={13} className="text-gray-400" />
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-0.5 text-sm font-bold"
            style={{ color: DARK_GREEN }}
          >
            {MONTHS[expanded ? currentMonth.getMonth() : today.getMonth()]}
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
              style={{ color: DARK_GREEN }}
            />
          </button>
          {expanded && (
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              className="w-6 h-6 flex items-center justify-center rounded-lg bg-gray-100"
            >
              <ChevronRight size={13} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* 캘린더 카드 */}
      <div className="rounded-2xl bg-white border border-gray-100/50 shadow-md overflow-hidden px-3 pt-3 pb-4" style={{padding : 10}}>
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map((d, i) => (
            <span
              key={i}
              className={`text-center text-[10px] font-bold mb-1 ${
                i === 5 ? 'text-sky-400/60' : i === 6 ? 'text-rose-400/60' : 'text-gray-400'
              }`}
            >
              {d}
            </span>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-0.5">
          {expanded
            ? monthDates.map((date) => renderCell(date, true))
            : weekDates.map((date) => renderCell(date))}
        </div>
      </div>
    </div>
  );
}
