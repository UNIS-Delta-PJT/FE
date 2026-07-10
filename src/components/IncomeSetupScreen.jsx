import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Pencil, PlusCircle, Trash2, X, PiggyBank, Briefcase, BookOpen, Gift, Building2, Star, Coins, GraduationCap, Wallet, Coffee } from 'lucide-react';

const ICON_CONFIG = [
  { id: 'piggy',      Icon: PiggyBank,      bg: '#FED02333', color: '#735C00' },
  { id: 'briefcase',  Icon: Briefcase,      bg: '#5FBAFF33', color: '#006397' },
  { id: 'book',       Icon: BookOpen,       bg: '#1CD1A133', color: '#1CD1A1' },
  { id: 'gift',       Icon: Gift,           bg: '#FF69B433', color: '#BE185D' },
  { id: 'building',   Icon: Building2,      bg: '#FCA52233', color: '#B45309' },
  { id: 'star',       Icon: Star,           bg: '#FDE68A33', color: '#92400E' },
  { id: 'coins',      Icon: Coins,          bg: '#6EE7B733', color: '#065F46' },
  { id: 'graduation', Icon: GraduationCap,  bg: '#A78BFA33', color: '#6D28D9' },
  { id: 'wallet',     Icon: Wallet,         bg: '#EAEAEA',   color: '#555555' },
  { id: 'coffee',     Icon: Coffee,         bg: '#D9770633', color: '#92400E' },
];

function getIconConfig(id) {
  return ICON_CONFIG.find(c => c.id === id) || ICON_CONFIG[0];
}

function IconCircle({ iconId, size = 40 }) {
  const { Icon, bg, color } = getIconConfig(iconId);
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: bg }}
    >
      <Icon size={size * 0.45} style={{ color }} strokeWidth={1.8} />
    </div>
  );
}

function IconPicker({ selected, onSelect }) {
  return (
    // 5개 x 2줄 고정: 아이콘 5개(36px) + gap 4개(8px) + 좌우 패딩 16px = 228px
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-md"
      style={{
        padding: 8,
        width: 228,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 36px)',
        gap: 8,
      }}
    >
      {ICON_CONFIG.map(({ id, Icon, bg, color }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{
            backgroundColor: bg,
            outline: selected === id ? `2px solid ${color}` : 'none',
            outlineOffset: 1,
          }}
        >
          <Icon size={17} style={{ color }} strokeWidth={1.8} />
        </button>
      ))}
    </div>
  );
}

function IncomeForm({ iconId, name, amount, showPicker, onIconClick, onIconSelect, onNameChange, onAmountChange, onConfirm, onCancel }) {
  return (
    <div className="flex flex-col">
      <div className="px-4 flex items-center gap-3" style={{ minHeight: 66 }}>
        <button onClick={onIconClick} className="active:scale-90 transition-transform flex-shrink-0">
          <IconCircle iconId={iconId} />
        </button>
        <div className="flex-1 min-w-0">
          <input
            autoFocus
            type="text"
            placeholder="카테고리명"
            value={name}
            onChange={e => onNameChange(e.target.value)}
            className="text-sm outline-none bg-transparent"
            style={{ color: '#555555', fontWeight: 600, width: 200, height: 24 }}
          />
          <input
            type="number"
            placeholder="금액 입력"
            value={amount}
            onChange={e => onAmountChange(e.target.value.replace(/[^0-9]/g, ''))}
            className="text-sm outline-none"
            style={{
              width: 200,
              height: 37,
              borderRadius: 50,
              border: 'none',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.10)',
              paddingTop: 8,
              paddingBottom: 8,
              paddingLeft: 16,
              color: '#555555',
              fontWeight: 'normal',
              marginTop: 4,
            }}
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center active:scale-90 transition-transform"
          >
            <X size={15} className="text-gray-500" strokeWidth={2.5} />
          </button>
          <button
            onClick={onConfirm}
            className="w-8 h-8 rounded-full bg-[#1CD1A1] flex items-center justify-center active:scale-90 transition-transform"
          >
            <Check size={15} className="text-white" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {showPicker && (
        <div className="px-4 pb-3">
          <IconPicker selected={iconId} onSelect={onIconSelect} />
        </div>
      )}
    </div>
  );
}

export default function IncomeSetupScreen({ onNext, onBack }) {
  const [incomes, setIncomes] = useState(() => {
    try {
      const saved = localStorage.getItem('delta_incomes');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formIconId, setFormIconId] = useState('piggy');
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const totalIncome = incomes.reduce((sum, item) => sum + (parseInt(item.amount) || 0), 0);
  // TODO: 백엔드 연동 시 지난달 예산 잔액으로 대체
  const lastMonthLeftover = 0;

  useEffect(() => {
    localStorage.setItem('delta_incomes', JSON.stringify(incomes));
  }, [incomes]);

  function openAdd() {
    setEditingId(null);
    setFormIconId('piggy');
    setFormName('');
    setFormAmount('');
    setShowPicker(false);
    setIsAdding(true);
  }

  function openEdit(income) {
    setIsAdding(false);
    setFormIconId(income.iconId);
    setFormName(income.name);
    setFormAmount(String(income.amount));
    setShowPicker(false);
    setEditingId(income.income_id);
  }

  function handleAdd() {
    if (!formName.trim() || !formAmount) return;
    setIncomes(prev => [...prev, {
      income_id: Date.now(),
      iconId: formIconId,
      name: formName.trim(),
      amount: parseInt(formAmount),
    }]);
    resetForm();
  }

  function handleDelete(income_id) {
    setIncomes(prev => prev.filter(item => item.income_id !== income_id));
    resetForm();
  }

  function handleSaveEdit() {
    if (!formName.trim() || !formAmount) return;
    setIncomes(prev => prev.map(item =>
      item.income_id === editingId
        ? { ...item, iconId: formIconId, name: formName.trim(), amount: parseInt(formAmount) }
        : item
    ));
    resetForm();
  }

  function resetForm() {
    setIsAdding(false);
    setEditingId(null);
    setFormIconId('piggy');
    setFormName('');
    setFormAmount('');
    setShowPicker(false);
  }

  return (
    <div className="flex flex-col overflow-y-auto bg-white" style={{ minHeight: '100%', paddingBottom: '100px', paddingLeft: '20px', paddingRight: '17px' }}>

      {/* 헤더 고정 (spacer) */}
      <div style={{ height: '64px', flexShrink: 0 }} />

      {/* 헤더 */}
      <div
        className="flex items-center gap-3 bg-white z-10"
        style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '390px', paddingTop: '20px', paddingBottom: '12px', paddingLeft: '20px', paddingRight: '17px' }}
      >
        <button onClick={onBack} className="active:scale-90 transition-transform p-1">
          <ArrowLeft size={20} className="text-gray-800" />
        </button>
        <h1 className="font-black text-gray-900" style={{ fontSize: '18px' }}>
          이번 달 수입 리스트
        </h1>
      </div>

      {/* 총합 박스 */}
      <div style={{ width: 353, marginBottom: 15 }}>
        <div
          className="flex flex-col items-center justify-center"
          style={{
            height: 144,
            borderRadius: 20,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            padding: '20px 24px',
            gap: 8,
            boxSizing: 'border-box',
            textAlign: 'center',
          }}
        >
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '18px', fontWeight: 600, color: '#1A1A1A', margin: 0 }}>총합</p>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '24px', fontWeight: 700, color: '#1CD1A1', margin: 0 }}>
            {(totalIncome + lastMonthLeftover).toLocaleString('ko-KR')}원
          </p>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 500, color: '#999999', margin: 0 }}>
            이번 달 수입 {totalIncome.toLocaleString('ko-KR')}원
          </p>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 500, color: '#FF7682', margin: 0 }}>
            + 지난달 남은 돈 {lastMonthLeftover.toLocaleString('ko-KR')}원
          </p>
        </div>
        <div className="flex justify-end" style={{ marginTop: 6 }}>
          <button
            onClick={() => { setIncomes([]); resetForm(); }}
            className="text-xs text-gray-400 underline active:opacity-60"
          >
            초기화
          </button>
        </div>
      </div>

      {/* 수입 목록 */}
      <div className="flex flex-col gap-1 mb-1" style={{ width: 353 }}>
        {incomes.map(income => {
          const isEditing = editingId === income.income_id;
          return (
            <div key={income.income_id}>
              <div className="px-4 flex items-center gap-3" style={{ height: 66 }}>
                {isEditing ? (
                  <button onClick={() => setShowPicker(p => !p)} className="active:scale-90 transition-transform flex-shrink-0">
                    <IconCircle iconId={formIconId} />
                  </button>
                ) : (
                  <IconCircle iconId={income.iconId} />
                )}

                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <>
                      <input
                        autoFocus
                        type="text"
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        className="text-sm outline-none bg-transparent"
                        style={{ color: '#555555', fontWeight: 600, width: 200, height: 24 }}
                      />
                      <input
                        type="number"
                        value={formAmount}
                        onChange={e => setFormAmount(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="금액"
                        className="text-sm outline-none"
                        style={{
                          width: 200,
                          height: 37,
                          borderRadius: 50,
                          border: 'none',
                          backgroundColor: '#FFFFFF',
                          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.10)',
                          paddingTop: 8,
                          paddingBottom: 8,
                          paddingLeft: 16,
                          color: '#555555',
                          fontWeight: 'normal',
                          marginTop: 4,
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <p className="text-sm truncate" style={{ color: '#555555', fontWeight: 600 }}>
                        {income.name}
                      </p>
                      <p className="text-sm" style={{ color: '#555555', fontWeight: 'normal' }}>
                        {income.amount.toLocaleString('ko-KR')}원
                      </p>
                    </>
                  )}
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDelete(income.income_id)}
                      className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="w-8 h-8 rounded-full bg-[#1CD1A1] flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Check size={15} className="text-white" strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => openEdit(income)} className="active:scale-90 transition-transform">
                    <Pencil size={15} className="text-gray-300" />
                  </button>
                )}
              </div>

              {isEditing && showPicker && (
                <div className="px-4 pb-3">
                  <IconPicker selected={formIconId} onSelect={id => { setFormIconId(id); setShowPicker(false); }} />
                </div>
              )}
            </div>
          );
        })}

        {/* 추가 폼 */}
        {isAdding && (
          <IncomeForm
            iconId={formIconId}
            name={formName}
            amount={formAmount}
            showPicker={showPicker}
            onIconClick={() => setShowPicker(p => !p)}
            onIconSelect={id => { setFormIconId(id); setShowPicker(false); }}
            onNameChange={setFormName}
            onAmountChange={setFormAmount}
            onConfirm={handleAdd}
            onCancel={resetForm}
          />
        )}
      </div>

      {/* 카테고리 추가 버튼 */}
      {!isAdding && editingId === null && (
        <div className="flex justify-center" style={{ width: 353 }}>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 text-[#1CD1A1] font-semibold active:opacity-60"
            style={{ fontSize: '15px', padding: '8px' }}
          >
            <PlusCircle size={20} color="#1CD1A1" />
            카테고리 추가하기
          </button>
        </div>
      )}

      {/* 다음 버튼 */}
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
        <span className="text-white font-bold">다음</span>
      </button>
    </div>
  );
}
