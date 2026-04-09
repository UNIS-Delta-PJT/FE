import { useState } from 'react';
import { Settings } from 'lucide-react';
import AttendancePopup from './AttendancePopup';

export default function TopBar() {
  const [showAttendance, setShowAttendance] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-4" style={{ padding: '7px'}}>
        {/* 로고 */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2ECC71] flex items-center justify-center text-sm font-black text-white shadow-lg shadow-[#2ECC71]/30">
            D
          </div>
          <span className="text-lg font-black tracking-tight text-gray-900">
            DELTA
          </span>
        </div>

        {/* 우측 아이콘들 */}
        <div className="flex items-center gap-3">
          {/* 출석 체크 버튼 */}
          <button
            onClick={() => setShowAttendance(true)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 border border-gray-200 active:scale-95 transition-transform"
          >
            <span className="text-lg">📅</span>
            {/* 출석 뱃지 */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2ECC71] rounded-full text-[9px] font-bold text-white flex items-center justify-center">
              4
            </span>
          </button>

          {/* 환경설정 버튼 */}
          <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 border border-gray-200 active:scale-95 transition-transform">
            <Settings size={18} className="text-gray-500" />
          </button>
        </div>
      </header>

      {/* 출석 팝업 */}
      {showAttendance && (
        <AttendancePopup onClose={() => setShowAttendance(false)} />
      )}
    </>
  );
}
