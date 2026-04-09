import { PenLine, ScanLine } from 'lucide-react';

export default function QuickActions() {
  return (
    <div className="mx-4 grid grid-cols-2 gap-3" style={{ padding: '5px' }}>
      {/* 직접 입력 */}
      <button className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-[#2ECC71]/10 border border-[#2ECC71]/30 active:scale-95 transition-transform" style={{ paddingTop: '5px', paddingBottom: '5px' }}>
        <div className="w-10 h-10 rounded-xl bg-[#2ECC71]/20 flex items-center justify-center">
          <PenLine size={20} className="text-[#2ECC71]" />
        </div>
        <span className="text-xs font-bold text-gray-700">직접 입력</span>
      </button>
      

      {/* AI 영수증 스캔 */}
      <button className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-sky-500/10 border border-sky-400/30 active:scale-95 transition-transform" style={{ paddingTop: '5px', paddingBottom: '5px' }}>
        <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
          <ScanLine size={20} className="text-sky-500" />
        </div>
        <span className="text-xs font-bold text-gray-700">AI 영수증 스캔</span>
      </button>
    </div>
  );
}
