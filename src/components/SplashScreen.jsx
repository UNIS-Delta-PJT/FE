import { useEffect } from 'react';

export default function SplashScreen({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: '844px' }}>
      {/* 로고 — 추후 이미지로 교체 */}
      <div className="animate-bounce flex flex-col items-center gap-3">
        <div className="w-28 h-28 rounded-3xl bg-[#f0faf4] flex items-center justify-center shadow-sm">
          <span style={{ fontSize: '64px' }}>💚</span>
        </div>
        <p className="text-3xl font-black text-[#2ECC71] tracking-widest">DELTA</p>
      </div>
    </div>
  );
}
