import { useState } from 'react';
import AttendancePopup from './AttendancePopup';
import logoImg   from '../assets/logo.png';
import stampImg  from '../assets/stamp.png';
import settingImg from '../assets/setting.png';

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
            className="relative active:scale-95 transition-transform"
          >
            <img src={stampImg} alt="출석체크" width={40} height={40} draggable={false} />
            {/* 출석 뱃지 */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2ECC71] rounded-full text-[9px] font-bold text-white flex items-center justify-center">
              4
            </span>
          </button>

          {/* 환경설정 버튼 */}
          <button className="active:scale-95 transition-transform">
            <img src={settingImg} alt="환경설정" width={40} height={40} draggable={false} />
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
