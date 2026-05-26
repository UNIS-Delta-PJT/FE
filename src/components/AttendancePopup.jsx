import { createPortal } from 'react-dom';
import { useState } from 'react';
import { X } from 'lucide-react';
import { mockAttendance } from '../data/mockData';

export default function AttendancePopup({ onClose }) {
  const today = new Date();
  const todayDate = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthName = today.toLocaleDateString('ko-KR', { month: 'long' });

  const [checkedDays, setCheckedDays] = useState(mockAttendance.checkedDays);
  const [streak, setStreak] = useState(mockAttendance.currentStreak);

  const alreadyChecked = checkedDays.includes(todayDate);

  function handleCheckIn() {
    if (alreadyChecked) return;

    const newCheckedDays = [...checkedDays, todayDate];
    const newStreak = streak + 1;

    // mock 객체에도 반영 (세션 내 유지)
    mockAttendance.checkedDays = newCheckedDays;
    mockAttendance.currentStreak = newStreak;

    setCheckedDays(newCheckedDays);
    setStreak(newStreak);

    // 잠깐 체크 표시 보여준 뒤 닫기
    setTimeout(() => onClose(), 500);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl"
        style={{ width: 320, padding: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between" style={{ marginBottom: 17 }}>
          <div>
            <h2 className="text-base font-bold text-gray-900">{monthName} 출석 현황</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              🔥 {streak}일 연속 출석 중!
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <X size={13} className="text-gray-500" />
          </button>
        </div>

        {/* 스탬프 그리드 */}
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const isChecked = checkedDays.includes(day);
            const isToday = day === todayDate;
            return (
              <div
                key={day}
                className={`
                  aspect-square rounded-lg flex flex-col items-center justify-center font-bold
                  ${isChecked
                    ? 'bg-[#2ECC71] text-white shadow-sm shadow-[#2ECC71]/30'
                    : isToday
                    ? 'bg-gray-50 text-gray-700 border border-[#2ECC71]/50'
                    : 'bg-gray-50 text-gray-300'
                  }
                `}
              >
                <span className="text-[9px] opacity-70">{day}</span>
                {isChecked && <span className="text-xs leading-none">✦</span>}
              </div>
            );
          })}
        </div>

        {/* 출석 버튼 */}
        <button
          onClick={handleCheckIn}
          disabled={alreadyChecked}
          style={{ marginTop: 21, paddingTop: 15, paddingBottom: 15, borderRadius: 50 }}
          className={`
            w-full font-bold text-sm transition-all active:scale-95
            ${alreadyChecked
              ? 'bg-gray-100 text-gray-400 cursor-default'
              : 'bg-[#2ECC71] text-white shadow-md shadow-[#2ECC71]/30'
            }
          `}
        >
          {alreadyChecked ? '오늘 출석 완료 ✓' : '오늘 출석 체크 완료! ✦'}
        </button>
      </div>
    </div>,
    document.body
  );
}
