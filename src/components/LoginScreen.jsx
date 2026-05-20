export default function LoginScreen({ onLogin }) {
  return (
    <div
      className="flex flex-col items-center justify-center px-8 gap-6 overflow-hidden bg-white"
      style={{ height: '100vh' }}
    >
      {/* 로고 */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="w-20 h-20 rounded-3xl bg-[#f0faf4] flex items-center justify-center shadow-sm">
          <span style={{ fontSize: '44px' }}>💚</span>
        </div>
        <p className="text-2xl font-black text-[#2ECC71] tracking-widest">DELTA</p>
        <p className="text-gray-400 text-sm">로그인하고 시작해보세요</p>
      </div>

      {/* 소셜 로그인 버튼 */}
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={onLogin}
          className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm active:scale-95 transition-transform"
          style={{ backgroundColor: '#FEE500', color: '#191919' }}
        >
          <span style={{ fontSize: '20px' }}>💬</span>
          카카오로 시작하기
        </button>

        <button
          onClick={onLogin}
          className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm bg-white border border-gray-200 text-gray-700 active:scale-95 transition-transform shadow-sm"
        >
          <span style={{ fontSize: '20px' }}>🌐</span>
          Google로 시작하기
        </button>
      </div>

      {/* 임시 로그인 */}
      <button
        onClick={onLogin}
        className="text-gray-400 text-xs underline underline-offset-2 mt-2 active:opacity-60 transition-opacity"
      >
        임시 로그인으로 시작
      </button>
    </div>
  );
}
