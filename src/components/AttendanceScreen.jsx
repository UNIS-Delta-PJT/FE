const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 목업 데이터 — 추후 백엔드 연동
const mockStreak = 14;
const mockAttendance = [true, true, false, true, true, true, false];
const mockDurationText = '벌써 한 달이나 지났다니!';
const mascotMessage = '오늘 벌써 예산 설정을 다시 해보는 날이야!';

export default function AttendanceScreen({ onNext }) {
  return (
    <div className="overflow-hidden px-6 bg-white" style={{ height: '100vh', position: 'relative' }}>

      {/* 상단: 말풍선 + 빼꼼 마스코트 */}
      <div className="flex items-start justify-between" style={{ paddingTop: '180px' }}>
        {/* 말풍선 — 꼬리가 오른쪽(마스코트 방향) */}
        <div
          className="relative bg-gray-100 rounded-2xl w-[70%] h-10 px-4 py-3 flex items-center justify-center"
          style={{marginLeft: '24px' }}
        >
          <p className="text-gray-700 text-sm font-medium leading-relaxed">
            {mascotMessage}
          </p>
          <div
            className="absolute top-1/2 -translate-y-1/2"
            style={{
              right: '-10px',
              width: 0,
              height: 0,
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderLeft: '10px solid #F3F4F6',
            }}
          />
        </div>
        <div style={{ marginRight: '-16px', marginTop: '8px' }}>
          <span style={{ fontSize: '64px', lineHeight: 1, display: 'inline-block', transform: 'rotate(-15deg)' }}>🐪</span>
        </div>
      </div>

      {/* 연속 출석 섹션 — 숫자 원 중심이 화면 정중앙(50vh) */}
      <div
        className="absolute left-0 right-0 px-6 flex flex-col items-center gap-3"
        style={{ top: '50%', transform: 'translateY(-60px)' }}
      >
        {/* 숫자 원 (height 120px → 중심 오프셋 -60px) */}
        <div
          className="rounded-full bg-gray-100 flex items-center justify-center"
          style={{ width: '120px', height: '120px' }}
        >
          <span className="text-[#2ECC71] font-black" style={{ fontSize: '70px', lineHeight: 1 }}>
            {mockStreak}
          </span>
        </div>

        {/* "일 연속 출석" */}
        <p className="text-gray-900 font-black" style={{ fontSize: '20px' }}>
          일 연속 출석
        </p>

        {/* 요일 + 출석 원 */}
        <div className="flex gap-3 mt-1">
          {DAYS.map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-2">
              <p className="text-gray-500 text-xs font-medium">{day}</p>
              <div
                className="w-7 h-7 rounded-full"
                style={{ backgroundColor: mockAttendance[i] ? '#2ECC71' : '#E5E7EB' }}
              />
            </div>
          ))}
        </div>

        {/* 기간 텍스트 */}
        <p className="text-gray-600 text-sm mt-1">{mockDurationText}</p>
      </div>

      {/* 계속하기 버튼 */}
      <button
        onClick={onNext}
        className="bg-[#2ECC71] rounded-4xl flex items-center justify-center active:scale-95 transition-transform shadow-lg"
        style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${390 * 0.85}px`,
          height: '48px',
          fontSize: '15px',
        }}
      >
        <span className="text-white font-bold">계속하기</span>
      </button>
    </div>
  );
}
