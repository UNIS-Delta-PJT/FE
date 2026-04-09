import { X } from 'lucide-react';
import { mockAttendance } from '../data/mockData';

export default function AttendancePopup({ onClose }) {
  const { checkedDays, currentStreak } = mockAttendance;
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthName = today.toLocaleDateString('ko-KR', { month: 'long' });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* 딤 배경 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* 팝업 패널 */}
      <div
        className="relative w-full max-w-sm mx-auto bg-white rounded-t-3xl px-6 pt-6 pb-10 border-t border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{monthName} 출석 현황</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              🔥 {currentStreak}일 연속 출석 중!
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
          >
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        {/* 스탬프 그리드 */}
        <div className="grid grid-cols-7 gap-2 mt-5">
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const isChecked = checkedDays.includes(day);
            const isToday = day === today.getDate();
            return (
              <div
                key={day}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold
                  ${isChecked
                    ? 'bg-[#2ECC71] text-white shadow-md shadow-[#2ECC71]/30'
                    : isToday
                    ? 'bg-gray-50 text-gray-700 border border-[#2ECC71]/50'
                    : 'bg-gray-50 text-gray-300'
                  }
                `}
              >
                <span className="text-[10px] mb-0.5 opacity-70">{day}</span>
                {isChecked && <span className="text-base leading-none">✦</span>}
              </div>
            );
          })}
        </div>

        {/* 오늘 출석 버튼 */}
        <button className="w-full mt-5 py-3.5 rounded-2xl bg-[#2ECC71] text-white font-bold text-sm shadow-lg shadow-[#2ECC71]/30 active:scale-95 transition-transform">
          오늘 출석 체크 완료! ✦
        </button>
      </div>
    </div>
  );
}
