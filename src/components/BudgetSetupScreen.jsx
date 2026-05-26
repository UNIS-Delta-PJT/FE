import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, SquarePen, Check, Utensils, Bus, Film,
  Sparkles, Wallet, ShoppingBag, Home, Dumbbell,
  Heart, Coffee, BookOpen, X, PlusCircle,
} from 'lucide-react';
import deltaClappingImg from '../assets/delta_clapping.png';
import WarningToast from './WarningToast';

// ─── 고정 카테고리 아이콘 맵 ──────────────────────────────────────────
const ICON_MAP = {
  '식비':      { Icon: Utensils },
  '교통':      { Icon: Bus      },
  '문화/여가': { Icon: Film     },
};

// ─── 커스텀 카테고리 아이콘 설정 ──────────────────────────────────────
const CUSTOM_ICON_CONFIG = [
  { id: 'food',    Icon: Utensils,    bg: '#FF6B6B22', color: '#FF6B6B' },
  { id: 'bus',     Icon: Bus,         bg: '#4ECDC422', color: '#4ECDC4' },
  { id: 'film',    Icon: Film,        bg: '#45B7D122', color: '#45B7D1' },
  { id: 'shop',    Icon: ShoppingBag, bg: '#F9A82522', color: '#F9A825' },
  { id: 'home',    Icon: Home,        bg: '#66BB6A22', color: '#66BB6A' },
  { id: 'fitness', Icon: Dumbbell,    bg: '#FF752222', color: '#FF7522' },
  { id: 'health',  Icon: Heart,       bg: '#EC407A22', color: '#EC407A' },
  { id: 'coffee',  Icon: Coffee,      bg: '#A1887F22', color: '#A1887F' },
  { id: 'edu',     Icon: BookOpen,    bg: '#7E57C222', color: '#7E57C2' },
];

function getCustomIcon(id) {
  return CUSTOM_ICON_CONFIG.find(c => c.id === id) || CUSTOM_ICON_CONFIG[0];
}

const DEFAULT_CATEGORIES = [
  { category_id: 1, name: '식비',      amount: 0 },
  { category_id: 2, name: '교통',      amount: 0 },
  { category_id: 3, name: '문화/여가', amount: 0 },
];

// ─── 커스텀 아이콘 픽커 ───────────────────────────────────────────────
function CustomIconPicker({ selected, onSelect }) {
  return (
    <div
      className="flex flex-wrap gap-2 p-3 bg-white rounded-2xl border border-gray-100 shadow-md"
      style={{ marginTop: 8 }}
    >
      {CUSTOM_ICON_CONFIG.map(({ id, Icon, bg, color }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
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

// ─── 고정 카테고리 아이템 ─────────────────────────────────────────────
// maxAllowed: 이 카테고리에 배분 가능한 최대 금액 (= 현재 금액 + 아직 배분 안 된 예산)
function CategoryItem({ cat, totalBudget, maxAllowed, onAmountChange }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(cat.amount));

  const pct = totalBudget > 0 ? Math.min(Math.round((cat.amount / totalBudget) * 100), 100) : 0;
  const { Icon } = ICON_MAP[cat.name] || { Icon: Film };
  const sliderMax = Math.max(0, maxAllowed);

  function handleConfirm() {
    const raw = parseInt(inputVal) || 0;
    // 남은 예산을 초과하지 않도록 강제 클램프
    const clamped = Math.min(raw, sliderMax);
    setInputVal(String(clamped));
    onAmountChange(cat.category_id, clamped);
    setEditing(false);
  }

  return (
    <div
      style={{
        width: 353,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingLeft: 17,
        paddingRight: 17,
        paddingTop: 16,
        paddingBottom: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 10,
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.07)',
      }}
    >
      <div className="flex items-center justify-between" style={{ width: '100%' }}>
        <div className="flex items-center gap-3">
          <div className="rounded-full flex items-center justify-center flex-shrink-0 bg-white" style={{ width: 40, height: 40 }}>
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
                style={{ width: 123, height: 34, borderRadius: 9999, borderWidth: 1, borderStyle: 'solid', borderColor: '#2ECC71', backgroundColor: '#EDF4FF', paddingLeft: 12, paddingRight: 12, color: '#374151' }}
              />
              <button onClick={handleConfirm} className="w-7 h-7 rounded-full bg-[#2ECC71] flex items-center justify-center active:scale-90 transition-transform flex-shrink-0">
                <Check size={13} className="text-white" strokeWidth={2.5} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setInputVal(String(cat.amount)); setEditing(true); }}
                style={{ width: 123, height: 34, borderRadius: 9999, borderWidth: 1, borderStyle: 'solid', borderColor: '#E5E7EB', backgroundColor: '#EDF4FF', paddingLeft: 12, paddingRight: 12 }}
              >
                <span className="text-sm text-gray-700">{cat.amount.toLocaleString('ko-KR')}원</span>
              </button>
              <button onClick={() => { setInputVal(String(cat.amount)); setEditing(true); }}>
                <SquarePen size={16} color="#8A8A8A" />
              </button>
            </>
          )}
        </div>
      </div>
      {/* 슬라이더: 0–100 % 기준 → thumb 위치와 그라데이션 일치 */}
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={pct}
        onChange={e => {
          const newPct = parseInt(e.target.value) || 0;
          const newAmount = Math.round(newPct * totalBudget / 100);
          // 남은 예산 초과 시 클램프
          const clamped = Math.min(newAmount, sliderMax);
          onAmountChange(cat.category_id, clamped);
        }}
        className="budget-slider"
        style={{ width: 319, height: 12, borderRadius: 6, background: `linear-gradient(to right, #2ECC71 ${pct}%, #E5E7EB ${pct}%)` }}
      />
    </div>
  );
}

// ─── 커스텀 카테고리 아이템 ───────────────────────────────────────────
function CustomCategoryItem({ cat, totalBudget, maxAllowed, onUpdate, onDelete }) {
  const [editingAmount, setEditingAmount] = useState(false);
  const [editingName, setEditingName] = useState(!cat.name);
  const [inputVal, setInputVal] = useState(String(cat.amount));
  const [nameVal, setNameVal] = useState(cat.name);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const pct = totalBudget > 0 ? Math.min(Math.round((cat.amount / totalBudget) * 100), 100) : 0;
  const { Icon, bg, color } = getCustomIcon(cat.iconId);
  const sliderMax = Math.max(0, maxAllowed);

  function confirmAmount() {
    const raw = parseInt(inputVal) || 0;
    // 남은 예산을 초과하지 않도록 강제 클램프
    const clamped = Math.min(raw, sliderMax);
    setInputVal(String(clamped));
    onUpdate({ ...cat, amount: clamped });
    setEditingAmount(false);
  }

  function confirmName() {
    if (nameVal.trim()) onUpdate({ ...cat, name: nameVal.trim() });
    setEditingName(false);
  }

  function handleSlider(e) {
    const newPct = parseInt(e.target.value) || 0;
    const newAmount = Math.round(newPct * totalBudget / 100);
    // 남은 예산 초과 시 클램프
    const clamped = Math.min(newAmount, sliderMax);
    onUpdate({ ...cat, amount: clamped });
    setInputVal(String(clamped));
  }

  return (
    <div
      style={{
        width: 353, borderWidth: 1, borderStyle: 'solid', borderColor: '#E5E7EB',
        borderRadius: 16, paddingLeft: 17, paddingRight: 17, paddingTop: 16, paddingBottom: 16,
        display: 'flex', flexDirection: 'column', gap: 10,
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.07)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => setShowIconPicker(p => !p)}
          className="active:scale-90 transition-transform flex-shrink-0"
          style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon size={18} style={{ color }} strokeWidth={1.8} />
        </button>
        <div style={{ flex: 1, marginLeft: 12 }}>
          {editingName ? (
            <input
              autoFocus type="text" value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={confirmName}
              onKeyDown={e => e.key === 'Enter' && confirmName()}
              placeholder="카테고리명"
              style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 500, color: '#374151', outline: 'none', background: 'transparent', border: 'none', borderBottom: '1.5px solid #2ECC71', width: '100%', paddingBottom: 2 }}
            />
          ) : (
            <button onClick={() => { setNameVal(cat.name); setEditingName(true); }} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 500, color: '#374151' }}>{cat.name || '카테고리명'}</span>
              <SquarePen size={12} color="#C0C0C0" />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {editingAmount ? (
            <>
              <input
                autoFocus type="number" value={inputVal}
                onChange={e => setInputVal(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={e => e.key === 'Enter' && confirmAmount()}
                style={{ width: 100, height: 34, borderRadius: 9999, border: '1px solid #2ECC71', backgroundColor: '#EDF4FF', paddingLeft: 12, paddingRight: 12, fontSize: 13, color: '#374151', outline: 'none', textAlign: 'center' }}
              />
              <button onClick={confirmAmount} style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#2ECC71', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                <Check size={13} color="white" strokeWidth={2.5} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setInputVal(String(cat.amount)); setEditingAmount(true); }} style={{ width: 100, height: 34, borderRadius: 9999, border: '1px solid #E5E7EB', backgroundColor: '#EDF4FF', paddingLeft: 12, paddingRight: 12, cursor: 'pointer' }}>
                <span style={{ fontSize: 13, color: '#374151' }}>{cat.amount.toLocaleString('ko-KR')}원</span>
              </button>
              <button onClick={() => { setInputVal(String(cat.amount)); setEditingAmount(true); }}>
                <SquarePen size={15} color="#8A8A8A" />
              </button>
            </>
          )}
        </div>
        <button onClick={onDelete} className="active:scale-90 transition-transform" style={{ marginLeft: 6, flexShrink: 0 }}>
          <X size={16} color="#C0C0C0" />
        </button>
      </div>
      {showIconPicker && (
        <CustomIconPicker selected={cat.iconId} onSelect={id => { onUpdate({ ...cat, iconId: id }); setShowIconPicker(false); }} />
      )}
      {/* 슬라이더: 0–100 % 기준 → thumb 위치와 그라데이션 일치 */}
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={pct}
        onChange={handleSlider}
        className="budget-slider"
        style={{ width: 319, height: 12, borderRadius: 6, background: `linear-gradient(to right, #2ECC71 ${pct}%, #E5E7EB ${pct}%)` }}
      />
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────
export default function BudgetSetupScreen({ onComplete, onBack, initialBudget = 0 }) {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [customCategories, setCustomCategories] = useState([]);
  const [budgetInput, setBudgetInput] = useState(initialBudget > 0 ? String(initialBudget) : '');

  const [toast, setToast] = useState(false);
  const [toastFading, setToastFading] = useState(false);
  const [budgetToast, setBudgetToast] = useState(null);
  const [budgetToastFading, setBudgetToastFading] = useState(false);

  const [completionToast, setCompletionToast] = useState(false);
  const [completionToastFading, setCompletionToastFading] = useState(false);

  const totalIncome = (() => {
    try {
      const incomes = JSON.parse(localStorage.getItem('delta_incomes') || '[]');
      return incomes.reduce((sum, i) => sum + (parseInt(i.amount) || 0), 0);
    } catch { return 0; }
  })();

  const totalBudget = budgetInput ? parseInt(budgetInput) : 0;

  // ── 실시간 배분 현황 ──────────────────────────────────────────────
  // 카테고리별 금액 합산 (모든 렌더마다 최신 state 기반으로 계산)
  const totalAllocated = [...categories, ...customCategories].reduce((sum, c) => sum + (c.amount || 0), 0);
  // 아직 배분 안 된 잔여 예산
  const unallocated = totalBudget - totalAllocated;

  useEffect(() => {
    localStorage.setItem('delta_budget_categories', JSON.stringify([...categories, ...customCategories]));
  }, [categories, customCategories]);

  // ── 배분 완료 감지 → 말풍선 토스트 ──────────────────────────────
  const prevAllocatedRef = useRef(0);
  useEffect(() => {
    if (
      totalBudget > 0 &&
      totalAllocated === totalBudget &&
      prevAllocatedRef.current !== totalBudget
    ) {
      setCompletionToast(true);
      setCompletionToastFading(false);
      setTimeout(() => {
        setCompletionToastFading(true);
        setTimeout(() => setCompletionToast(false), 300);
      }, 2000);
    }
    prevAllocatedRef.current = totalAllocated;
  }, [totalAllocated, totalBudget]);

  function handleAmountChange(category_id, amount) {
    setCategories(prev => prev.map(cat =>
      cat.category_id === category_id ? { ...cat, amount } : cat
    ));
  }

  function showBudgetToast(message) {
    setBudgetToast(message);
    setBudgetToastFading(false);
    setTimeout(() => {
      setBudgetToastFading(true);
      setTimeout(() => setBudgetToast(null), 300);
    }, 1700);
  }

  function handleComplete() {
    if (!budgetInput) {
      showBudgetToast('총 예산을 먼저 입력해주세요!');
      return;
    }
    // 안전망: 입력값 클램프 이후에도 혹시 불일치라면 최종 차단
    const sum = [...categories, ...customCategories].reduce((s, c) => s + (c.amount || 0), 0);
    if (sum > totalBudget) {
      showBudgetToast(`${(sum - totalBudget).toLocaleString('ko-KR')}원 초과해서 입력되었어요!`);
      return;
    }
    if (sum < totalBudget) {
      showBudgetToast(`${(totalBudget - sum).toLocaleString('ko-KR')}원이 아직 배분되지 않았어요!`);
      return;
    }
    onComplete(totalBudget);
  }

  function handleCopyLastMonth() {
    setToast(true);
    setToastFading(false);
    setTimeout(() => {
      setToastFading(true);
      setTimeout(() => setToast(false), 300);
    }, 1700);
  }

  function addCustomCategory() {
    setCustomCategories(prev => [
      ...prev,
      { category_id: Date.now(), iconId: 'food', name: '', amount: 0 },
    ]);
  }

  function updateCustomCategory(updated) {
    setCustomCategories(prev => prev.map(c => c.category_id === updated.category_id ? updated : c));
  }

  function deleteCustomCategory(category_id) {
    setCustomCategories(prev => prev.filter(c => c.category_id !== category_id));
  }

  return (
    <div className="flex flex-col overflow-y-auto bg-white" style={{ minHeight: '100%', paddingBottom: '100px', paddingLeft: '20px', paddingRight: '17px' }}>

      {/* ── 말풍선 + 마스코트 토스트 ────────────────────────────────── */}
      {completionToast && (
        <div
          className={completionToastFading ? 'toast-exit' : 'toast-enter'}
          style={{
            position: 'fixed',
            right: '20px',
            bottom: '92px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            zIndex: 100,
            pointerEvents: 'none',
          }}
        >
          {/* 말풍선 */}
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <div style={{ backgroundColor: '#F2F2F2', borderRadius: '16px', padding: '12px 20px', whiteSpace: 'nowrap' }}>
              <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', fontWeight: 500, color: '#5B5B5B' }}>
                이번 달도 잘 지켜보자!
              </span>
            </div>
            {/* 꼬리 — 오른쪽 하단 (마스코트 방향) */}
            <div style={{ position: 'absolute', bottom: '-9px', right: '32px', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '9px solid #F2F2F2' }} />
          </div>
          {/* 마스코트 */}
          <img src={deltaClappingImg} alt="delta clapping" style={{ width: 120, height: 149, objectFit: 'contain' }} />
        </div>
      )}

      {/* ── 에러 토스트 ──────────────────────────────────────────────── */}
      <WarningToast visible={!!budgetToast} fading={budgetToastFading} message={budgetToast} bottom={96} />
      <WarningToast visible={toast} fading={toastFading} message="지난달에 설정한 계획이 없어요!" bottom={96} />

      {/* ── 헤더 spacer ──────────────────────────────────────────────── */}
      <div style={{ height: '64px', flexShrink: 0 }} />

      {/* ── 헤더 고정 ─────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 bg-white z-10"
        style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '390px', paddingTop: '20px', paddingBottom: '12px', paddingLeft: '20px', paddingRight: '17px' }}
      >
        <button onClick={onBack} className="active:scale-90 transition-transform p-1">
          <ArrowLeft size={20} className="text-gray-800" />
        </button>
        <h1 className="font-black text-gray-900" style={{ fontSize: '18px' }}>목표 예산 작성</h1>
      </div>

      {/* ── 서브타이틀 ───────────────────────────────────────────────── */}
      <p style={{ fontSize: '13px', color: '#8C8C8C', marginBottom: '24px', paddingLeft: '4px' }}>
        멋진 계획은 부자가 되는 첫걸음이에요!
      </p>

      {/* ── 지난달 계획 복사하기 ─────────────────────────────────────── */}
      <button
        onClick={handleCopyLastMonth}
        className="flex items-center active:scale-[0.98] transition-transform"
        style={{ width: 353, height: 97.5, borderRadius: 32, borderWidth: 1.5, borderStyle: 'solid', borderColor: '#E5E7EB', paddingTop: 24, paddingBottom: 24, paddingLeft: 24, gap: 20, marginBottom: 32 }}
      >
        <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, backgroundColor: '#2ECC7133' }}>
          <Sparkles size={18} color="#2ECC71" />
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="text-gray-800 font-semibold text-sm">지난달 계획 복사하기</span>
          <span className="text-gray-400 text-xs">이전 예산을 그대로 가져올게요</span>
        </div>
      </button>

      {/* ── 예산 항목별 설정 헤더 ────────────────────────────────────── */}
      <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: '18px', lineHeight: '20px', letterSpacing: '0.28px', color: '#1F2937', marginBottom: '20px' }}>
        예산 항목별 설정
      </p>

      {/* ── 총 예산 입력 ─────────────────────────────────────────────── */}
      <div
        className="flex items-center"
        style={{ width: 353, minHeight: 97.5, borderRadius: 32, borderWidth: 1.5, borderStyle: 'solid', borderColor: '#2ECC7166', paddingTop: 24, paddingBottom: 24, paddingLeft: 24, gap: 20, marginBottom: 12 }}
      >
        <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, backgroundColor: '#2ECC7133' }}>
          <Wallet size={18} color="#2ECC71" />
        </div>
        <div className="flex flex-col items-start gap-1.5 flex-1">
          <span className="text-gray-800 font-semibold text-sm">이번 달 총 예산</span>
          <div className="flex items-center gap-1">
            <input
              type="number" placeholder="금액 입력" value={budgetInput}
              onChange={e => setBudgetInput(e.target.value.replace(/[^0-9]/g, ''))}
              className="text-sm outline-none bg-transparent placeholder-[#2ECC71]"
              style={{ color: '#2ECC71', fontWeight: 400, width: 150 }}
            />
            <span className="text-sm font-semibold" style={{ color: '#2ECC71' }}>원</span>
          </div>
          <span className="text-xs text-gray-400">수입 총액: {totalIncome.toLocaleString('ko-KR')}원</span>
        </div>
      </div>

      {/* ── 남은 예산 실시간 표시 ────────────────────────────────────── */}
      {totalBudget > 0 && (
        <div
          className="flex items-center justify-between"
          style={{ width: 353, marginBottom: 12, paddingLeft: 6, paddingRight: 6 }}
        >
          <span style={{ fontSize: 12, color: '#8C8C8C' }}>배분 가능 남은 예산</span>
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: unallocated < 0 ? '#EF4444' : unallocated === 0 ? '#2ECC71' : '#1F2937',
          }}>
            {unallocated.toLocaleString('ko-KR')}원
          </span>
        </div>
      )}

      {/* ── 카테고리 초기화 ──────────────────────────────────────────── */}
      <div className="flex justify-end" style={{ width: 353, marginBottom: 8 }}>
        <button onClick={() => { setCategories(DEFAULT_CATEGORIES); setCustomCategories([]); setBudgetInput(''); }} className="text-xs text-gray-400 underline active:opacity-60">
          초기화
        </button>
      </div>

      {/* ── 카테고리 목록 ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {categories.map(cat => (
          <CategoryItem
            key={cat.category_id}
            cat={cat}
            totalBudget={totalBudget}
            // 이 카테고리의 배분 가능 최대 금액 = 현재 금액 + 아직 남은 예산
            // → 슬라이더와 직접 입력 모두 이 값 초과 불가
            maxAllowed={cat.amount + Math.max(0, unallocated)}
            onAmountChange={handleAmountChange}
          />
        ))}
        {customCategories.map(cat => (
          <CustomCategoryItem
            key={cat.category_id}
            cat={cat}
            totalBudget={totalBudget}
            maxAllowed={cat.amount + Math.max(0, unallocated)}
            onUpdate={updateCustomCategory}
            onDelete={() => deleteCustomCategory(cat.category_id)}
          />
        ))}
      </div>

      {/* ── 카테고리 추가하기 버튼 ──────────────────────────────────── */}
      <button
        onClick={addCustomCategory}
        className="flex items-center justify-center gap-[10px] active:scale-[0.98] transition-transform"
        style={{ width: 353, height: 64, backgroundColor: '#F4F4F4', borderRadius: 15, border: 'none', cursor: 'pointer', marginTop: 12 }}
      >
        <PlusCircle size={22} color="#2ECC71" strokeWidth={2} />
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', fontWeight: 600, color: '#2ECC71' }}>
          카테고리 추가하기
        </span>
      </button>

      {/* ── 설정 완료 버튼 (고정) ────────────────────────────────────── */}
      <button
        onClick={handleComplete}
        className="bg-[#2ECC71] rounded-4xl flex items-center justify-center active:scale-95 transition-transform shadow-lg"
        style={{ position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', width: `${390 * 0.85}px`, height: '48px', fontSize: '15px' }}
      >
        <span className="text-white font-bold">설정 완료</span>
      </button>
    </div>
  );
}
