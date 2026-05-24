import { useState } from 'react';
import { Settings } from 'lucide-react';
import AttendancePopup from './AttendancePopup';
import logoImg from '../assets/logo.png';

export default function TopBar() {
  const [showAttendance, setShowAttendance] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between bg-white sticky top-0 z-10" style={{ paddingTop: '7px', paddingBottom: '7px', paddingLeft: '18.5px', paddingRight: '18.5px' }}>
        {/* 로고 */}
        <div className="flex items-center">
          <img src={logoImg} alt="DELTA" className="h-8 object-contain" />
        </div>

        {/* 우측 아이콘들 */}
        <div className="flex items-center gap-3">
          {/* 출석 체크 버튼 */}
          <button
            onClick={() => setShowAttendance(true)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 border border-gray-200 active:scale-95 transition-transform"
          >
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
              <circle cx="9" cy="4.5" r="3" stroke="#555555" strokeWidth="1.5"/>
              <path
                d="M6.5 7.8C4.5 9 3 11.5 3 15V18.5H15V15C15 11.5 13.5 9 11.5 7.8"
                stroke="#555555"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
