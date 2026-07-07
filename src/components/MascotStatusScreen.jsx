const mascotStatus = '행복';
const mascotMessage = '오늘 또 날 보러 와줬네! 기분 엄청 좋다~';

export default function MascotStatusScreen({ onNext }) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 px-6 overflow-hidden bg-white" style={{ height: '100vh', paddingBottom: '80px' }}>
      {/* 말풍선 — 사각형, 하단에 꼬리 */}
      <div className="relative bg-gray-100 rounded-2xl px-5 py-4 w-[80%] h-10 flex items-center justify-center">
        <p className="text-gray-700 text-sm font-medium leading-relaxed text-center">
          {mascotMessage}
        </p>
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: '-10px',
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '10px solid #F4F4F4',
          }}
        />
      </div>

      {/* 마스코트 — 추후 이미지/gif로 교체 */}
      <div className="w-52 h-52 rounded-full bg-[#F4FDFA] flex items-center justify-center">
        <span style={{ fontSize: '90px', lineHeight: 1 }}>🐪</span>
      </div>

      {/* 상태 배지 */}
      <div className="bg-gray-100 rounded-4xl w-[30%] h-6 px-6 py-2 flex items-center justify-center">
        <p className="text-gray-700 font-medium text-sm">카멜이 {mascotStatus} 상태!</p>
      </div>

      {/* 출석체크 버튼 */}
      <button
        onClick={onNext}
        className="bg-[#1CD1A1] rounded-4xl flex items-center justify-center active:scale-95 transition-transform shadow-lg"
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
        <span className="text-white font-bold">출석체크 하러 가기</span>
      </button>
    </div>
  );
}
