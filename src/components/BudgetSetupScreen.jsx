import { useState, useEffect } from 'react';
import { ArrowLeft, SquarePen, Check, Utensils, Bus, Film, Package, Sparkles } from 'lucide-react';

const ICON_MAP = {
  '식비':     { Icon: Utensils },
  '교통':     { Icon: Bus      },
  '문화/여가': { Icon: Film    },
  '기타':     { Icon: Package  },
};

const MAX_AMOUNT = 1000000;

const DEFAULT_CATEGORIES = [
  { category_id: 1, name: '식비',      amount: 0 },
  { category_id: 2, name: '교통',      amount: 0 },
  { category_id: 3, name: '문화/여가', amount: 0 },
  { category_id: 4, name: '기타',      amount: 0 },
];

function CategoryItem({ cat, onAmountChange }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(cat.amount));

  const pct = Math.min((cat.amount / MAX_AMOUNT) * 100, 100);
  const { Icon } = ICON_MAP[cat.name] || ICON_MAP['기타'];

  function handleConfirm() {
    onAmountChange(cat.category_id, parseInt(inputVal) || 0);
    setEditing(false);
  }

  return (
    <div
      className="flex flex-col justify-center"
      style={{
        width: 353,
        height: 99,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingLeft: 17,
        paddingRight: 17,
        paddingTop: 16,
        paddingBottom: 16,
        gap: 10,
      }}
    >
      {/* 아이콘 | 이름 | 금액 pill | 편집 */}
      <div className="flex items-center justify-between" style={{ width: 318.75, height: 40 }}>
        <div className="flex items-center gap-3">
          <div
            className="rounded-full flex items-center justify-center flex-shrink-0 bg-white"
            style={{ width: 40, height: 40 }}
          >
            <Icon size={18} color="#2ECC71" strokeWidth={1.8} />
          </div>
          <span className="text-sm text-gray-700" style={{ fontWeight: 500 }}>{cat.name}</span>
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <input
                autoFocus
                type="number"
                value={inputVal}
                onChange={e => setInputVal(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                className="text-sm outline-none text-center"
                style={{
                  width: 123,
                  height: 34,
                  borderRadius: 9999,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: '#2ECC71',
                  backgroundColor: '#EDF4FF',
                  paddingTop: 4,
                  paddingBottom: 4,
                  paddingLeft: 12,
                  paddingRight: 12,
                  color: '#374151',
                }}
              />
              <button
                onClick={handleConfirm}
                className="w-7 h-7 rounded-full bg-[#2ECC71] flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
              >
                <Check size={13} className="text-white" strokeWidth={2.5} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setInputVal(String(cat.amount)); setEditing(true); }}
                style={{
                  width: 123,
                  height: 34,
                  borderRadius: 9999,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: '#E5E7EB',
                  backgroundColor: '#EDF4FF',
                  paddingTop: 4,
                  paddingBottom: 4,
                  paddingLeft: 12,
                  paddingRight: 12,
                }}
              >
                <span className="text-sm text-gray-700">
                  {cat.amount.toLocaleString('ko-KR')}원
                </span>
              </button>
              <button onClick={() => { setInputVal(String(cat.amount)); setEditing(true); }}>
                <SquarePen size={16} color="#8A8A8A" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 슬라이더 */}
      <input
        type="range"
        min={0}
        max={MAX_AMOUNT}
        step={10000}
        value={cat.amount}
        onChange={e => onAmountChange(cat.category_id, parseInt(e.target.value))}
        className="budget-slider"
        style={{
          width: 319,
          height: 12,
          borderRadius: 6,
          background: `linear-gradient(to right, #2ECC71 ${pct}%, #E5E7EB ${pct}%)`,
        }}
      />
    </div>
  );
}

export default function BudgetSetupScreen({ onComplete, onBack }) {
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('delta_budget_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch { return DEFAULT_CATEGORIES; }
  });
  const [toast, setToast] = useState(false);
  const [toastFading, setToastFading] = useState(false);

  useEffect(() => {
    localStorage.setItem('delta_budget_categories', JSON.stringify(categories));
  }, [categories]);

  function handleAmountChange(category_id, amount) {
    setCategories(prev => prev.map(cat =>
      cat.category_id === category_id ? { ...cat, amount } : cat
    ));
  }

  function handleCopyLastMonth() {
    setToast(true);
    setToastFading(false);
    setTimeout(() => {
      setToastFading(true);
      setTimeout(() => setToast(false), 300);
    }, 1700);
  }

  return (
    <div className="flex flex-col overflow-y-auto bg-white" style={{ minHeight: '100%', paddingTop: '20px', paddingBottom: '100px', paddingLeft: '20px', paddingRight: '17px' }}>

      {/* 토스트 */}
      {toast && (
        <div
          className={`fixed z-50 flex items-center rounded-2xl shadow-md ${toastFading ? 'toast-exit' : 'toast-enter'}`}
          style={{
            bottom: '96px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#FECACA',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: '#FECACA',
            whiteSpace: 'nowrap',
            paddingTop: '4px',
            paddingBottom: '4px',
            paddingLeft: '12px',
            paddingRight: '12px',
          }}
        >
          <span className="font-medium text-red-400" style={{ fontSize: '11px' }}>지난달에 설정한 계획이 없어요!</span>
        </div>
      )}

      {/* 헤더 */}
      <div className="flex items-center gap-3" style={{ marginBottom: '18px' }}>
        <button onClick={onBack} className="active:scale-90 transition-transform p-1">
          <ArrowLeft size={20} className="text-gray-800" />
        </button>
        <h1 className="font-black text-gray-900" style={{ fontSize: '18px' }}>목표 예산 작성</h1>
      </div>

      {/* 서브타이틀 */}
      <p style={{ fontSize: '13px', color: '#8C8C8C', marginBottom: '24px', paddingLeft: '4px' }}>
        멋진 계획은 부자가 되는 첫걸음이에요!
      </p>

      {/* 지난달 계획 복사하기 */}
      <button
        onClick={handleCopyLastMonth}
        className="flex items-center active:scale-[0.98] transition-transform"
        style={{
          width: 353,
          height: 97.5,
          borderRadius: 32,
          borderWidth: 1.5,
          borderStyle: 'solid',
          borderColor: '#E5E7EB',
          paddingTop: 24,
          paddingBottom: 24,
          paddingLeft: 24,
          gap: 20,
          marginBottom: 32,
        }}
      >
        <div
          className="rounded-full flex items-center justify-center flex-shrink-0"
          style={{ width: 40, height: 40, backgroundColor: '#2ECC7133' }}
        >
          <Sparkles size={18} color="#2ECC71" />
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="text-gray-800 font-semibold text-sm">지난달 계획 복사하기</span>
          <span className="text-gray-400 text-xs">이전 예산을 그대로 가져올게요</span>
        </div>
      </button>

      {/* 예산 항목별 설정 */}
      <p
        style={{
          fontFamily: 'Pretendard, sans-serif',
          fontWeight: 600,
          fontSize: '18px',
          lineHeight: '20px',
          letterSpacing: '0.28px',
          color: '#1F2937',
          marginBottom: '20px',
        }}
      >
        예산 항목별 설정
      </p>

      {/* 카테고리 목록 */}
      <div className="flex flex-col gap-3">
        {categories.map(cat => (
          <CategoryItem
            key={cat.category_id}
            cat={cat}
            onAmountChange={handleAmountChange}
          />
        ))}
      </div>

      {/* 완료 버튼 */}
      <button
        onClick={() => onComplete(categories.reduce((sum, cat) => sum + cat.amount, 0))}
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
        <span className="text-white font-bold">완료</span>
      </button>
    </div>
  );
}
