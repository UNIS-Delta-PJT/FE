const features = [
  {
    icon: '📸',
    title: 'AI 스캔으로 간편 기록',
    desc: '은행 앱 스크린샷만 올리면\nAI가 자동으로 지출을 분석해요',
  },
  {
    icon: '📊',
    title: '예산 관리',
    desc: '카테고리별 예산을 설정하고\n한눈에 소비 패턴을 파악해요',
  },
  {
    icon: '🐪',
    title: '마스코트와 함께',
    desc: '출석체크하고 카멜과 함께\n건강한 소비 습관을 만들어봐요',
  },
];

export default function OnboardingScreen({ onNext }) {
  return (
    <div
      className="flex flex-col items-center justify-center px-8 overflow-hidden"
      style={{ height: '100vh' }}
    >
      {/* 로고 */}
      <div className="flex flex-col items-center gap-1 mb-14">
        <p className="text-2xl font-black text-[#2ECC71] tracking-widest">DELTA</p>
        <p className="text-xs text-gray-400">서비스 소개</p>
      </div>

      {/* 기능 소개 카드 목록 */}
      <div className="flex flex-col gap-5 w-full">
        {features.map(({ icon, title, desc }) => (
          <div key={title} className="flex items-center gap-4 bg-gray-50 rounded-3xl px-5 py-4">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
              <span style={{ fontSize: '24px' }}>{icon}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-gray-900 font-bold text-sm">{title}</p>
              <p className="text-gray-400 text-xs leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 시작하기 버튼 */}
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
        <span className="text-white font-bold">시작하기</span>
      </button>
    </div>
  );
}
