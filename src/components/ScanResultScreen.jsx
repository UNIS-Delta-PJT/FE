import { ArrowLeft, CheckCircle, Utensils } from 'lucide-react';
import { todayString } from '../api/expenses';

function ReceiptIcon({ color = '#3D4A3E', width = 18, height = 20 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1 2C1 1.45 1.45 1 2 1H16C16.55 1 17 1.45 17 2V15L14.5 19L12 15L9.5 19L7 15L4.5 19L2 15L1 15V2Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M4.5 6H13.5M4.5 9H13.5M4.5 12H9.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const mockResults = [
  { expense_id: 1, merchant: '바나프레소 커피', icon: '☕', amount: 8500, name: '식비' },
  { expense_id: 2, merchant: '올리브영', icon: '🛍️', amount: 23000, name: '쇼핑' },
  { expense_id: 3, merchant: '지하철', icon: '🚇', amount: 1400, name: '교통' },
];

function ResultCard({ merchant, icon, amount, name }) {
  return (
    <div className="w-[85%] self-center rounded-3xl bg-[#FFFFFF] border border-gray-100 flex flex-col gap-3 shadow-sm" style={{ padding: '15px' }}>
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-4xl bg-gray-200 flex items-center justify-center shadow-sm flex-shrink-0">
          <ReceiptIcon />
        </div>
        <div className="flex flex-col gap-0.5">
          <p style={{ fontSize: '12px' }} className="text-gray-400">가맹점</p>
          <p className="text-base font-bold text-gray-900">{merchant}</p>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      <div className="flex items-start w-full">
        <div className="w-1/2">
          <p style={{ fontSize: '12px' }} className="text-gray-400 mb-1">금액</p>
          <p className="text-xl font-bold text-gray-800">
            ₩{amount.toLocaleString('ko-KR')}
          </p>
        </div>
        <div className="w-1/2">
          <p style={{ fontSize: '12px' }} className="text-gray-400 mb-1">카테고리</p>
          <div className="flex items-center gap-1.5 bg-gray-200 rounded-full w-fit h-6" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
            <Utensils size={12} className="text-gray/800" />
            <span className="text-xs font-semibold text-gray/800">{name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getNowTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export default function ScanResultScreen({ onBack, onHome }) {
  function handleHome() {
    const now = new Date();
    const scannedExpenses = mockResults.map(r => ({
      expense_id: Date.now() + r.expense_id,
      icon: r.icon,
      place: r.merchant,
      name: r.name,
      expense_date: todayString(),
      saved_at: now.toISOString(),
      amount: r.amount,
    }));
    onHome(scannedExpenses);
  }
  return (
    <div className="flex flex-col gap-4 px-3 pt-4 bg-white">
      {/* 타이틀 + 뒤로 가기 */}
      <div className="w-[90%] self-center relative text-center" style={{ marginTop: '20px' }}>
        <button
          onClick={onBack}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-1 active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} className="text-gray-800" />
        </button>
        <h1
          style={{ fontSize: '20px' }}
          className="font-bold text-gray-900 flex items-center justify-center gap-2"
        >
          <CheckCircle size={22} className="text-[#2ECC71]" />
          스캔 완료!
        </h1>
        <p style={{ fontSize: '12px' }} className="text-gray-400 mt-1">
          스크린샷을 성공적으로 읽었어요
        </p>
      </div>

      {/* 캐릭터 영역 */}
      <div
        className="w-80 self-center rounded-[40px] bg-[#f0faf4] flex items-center justify-center"
        style={{ height: '280px' }}
      >
        <span className="animate-bounce" style={{ fontSize: '90px', lineHeight: 1 }}>🥳</span>
      </div>

      {/* 스캔 결과 카드 목록 */}
      {mockResults.map((result) => (
        <ResultCard key={result.expense_id} {...result} />
      ))}

      <div style={{ height: '100px', flexShrink: 0 }} />

      {/* 홈으로 버튼 (floating) */}
      <button
        onClick={handleHome}
        className="bg-[#2ECC71] rounded-4xl active:scale-95 transition-transform shadow-lg flex items-center justify-center"
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
        <span className="text-[#FFFFFF] font-bold">홈으로</span>
      </button>
    </div>
  );
}
