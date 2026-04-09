import { PenLine, ScanLine } from 'lucide-react';

export default function QuickActions() {
  return (
    <div className="mx-4 grid grid-cols-2 gap-3" style={{ padding: '5px' }}>
      {/* 직접 입력 */}
      <button className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-[#2ECC71]/100 border border-[#2ECC71]/100 shadow-md active:scale-95 transition-transform" style={{ paddingTop: '5px', paddingBottom: '5px' }}>
        <div className="w-10 h-10 rounded-xl bg-[#2ECC71]/20 flex items-center justify-center">
          <PenLine size={25} className="text-[#FFFFFF]" />
        </div>
        <span className="text-xs font-bold text-[#FFFFFF]/100" style={{ marginTop: '-5px' }}>직접 입력</span>
      </button>
      

      {/* AI 영수증 스캔 */}
      <button className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-[#FFFFFF]-100 border border-[#FFFFFF]/100 shadow-md active:scale-95 transition-transform" style={{ paddingTop: '5px', paddingBottom: '5px' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center">
          <ScanLine size={25} className="text-gray/100" />
        </div>
        <span className="text-xs font-bold text-gray/100" style={{ marginTop: '-5px' }}>AI 영수증 스캔</span>
      </button>
    </div>
  );
}
