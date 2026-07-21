import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, SquarePen, Check, Utensils, Bus, Film,
  Sparkles, Wallet, ShoppingBag, Home, Dumbbell,
  Heart, Coffee, BookOpen, X, PlusCircle,
} from 'lucide-react';
import budgetCompleteImg from '../assets/budget_complete_character.png';
import WarningToast from './WarningToast';
import { getBudget, updateExpenseBudget, copyLastMonthBudget, getExpenseCategories, addExpenseCategory, deleteExpenseCategory } from '../api/finance';
import { CATEGORY_ID_MAP } from '../api/expenses';

// ─── 고정 카테고리 아이콘 맵 ──────────────────────────────────────────
const ICON_MAP = {
  '식비': { Icon: Utensils },
  '교통': { Icon: Bus      },
  '쇼핑': { Icon: ShoppingBag },
  '문화': { Icon: Film     },
};

// ─── 커스텀 카테고리 아이콘 설정 ──────────────────────────────────────
const CUSTOM_ICON_CONFIG = [
  { id: 'food',    Icon: Utensils,    bg: '#FF6B6B22', color: '#FF6B6B' },
  { id: 'bus',     Icon: Bus,         bg: '#4ECDC422', color: '#4ECDC4' },
  { id: 'film',    Icon: Film,        bg: '#45B7D122', color: '#45B7D1' },
  { id: 'shop',    Icon: ShoppingBag, bg: '#F9A82522', color: '#F9A825' },
  { id: 'home',    Icon: Home,        bg: '#1CD1A122', color: '#1CD1A1' },
  { id: 'fitness', Icon: Dumbbell,    bg: '#FF752222', color: '#FF7522' },
  { id: 'health',  Icon: Heart,       bg: '#EC407A22', color: '#EC407A' },
  { id: 'coffee',  Icon: Coffee,      bg: '#A1887F22', color: '#A1887F' },
  { id: 'edu',     Icon: BookOpen,    bg: '#7E57C222', color: '#7E57C2' },
];

function getCustomIcon(id) {
  return CUSTOM_ICON_CONFIG.find(c => c.id === id) || CUSTOM_ICON_CONFIG[0];
}

const DEFAULT_CATEGORIES = [
  { category_id: 1, name: '식비', amount: 0 },
  { category_id: 2, name: '교통', amount: 0 },
  { category_id: 3, name: '쇼핑', amount: 0 },
  { category_id: 4, name: '문화', amount: 0 },
];

// ─── 커스텀 아이콘 픽커 ───────────────────────────────────────────────
function CustomIconPicker({ selected, onSelect }) {
  return (
    // 5개 + 4개 2줄 grid: 아이콘 5개(36px) + gap 4개(8px) + 좌우 패딩 16px = 228px
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-md"
      style={{
        marginTop: 8,
        padding: 8,
        width: 228,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 36px)',
        gap: 8,
      }}
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
        border: 'none',
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
            <Icon size={18} color="#1CD1A1" strokeWidth={1.8} />
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
                style={{ width: 123, height: 34, borderRadius: 9999, borderWidth: 1, borderStyle: 'solid', borderColor: '#1CD1A1', backgroundColor: '#EDF4FF', paddingLeft: 12, paddingRight: 12, color: '#555555' }}
              />
              <button onClick={handleConfirm} className="w-7 h-7 rounded-full bg-[#1CD1A1] flex items-center justify-center active:scale-90 transition-transform flex-shrink-0">
                <Check size={13} className="text-white" strokeWidth={2.5} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setInputVal(String(cat.amount)); setEditing(true); }}
                style={{ width: 123, height: 34, borderRadius: 9999, borderWidth: 1, borderStyle: 'solid', borderColor: '#EAEAEA', backgroundColor: '#EDF4FF', paddingLeft: 12, paddingRight: 12 }}
              >
                <span className="text-sm text-gray-700">{cat.amount.toLocaleString('ko-KR')}원</span>
              </button>
              <button onClick={() => { setInputVal(String(cat.amount)); setEditing(true); }}>
                <SquarePen size={16} color="#999999" />
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
        style={{ width: 319, height: 12, borderRadius: 6, background: `linear-gradient(to right, #1CD1A1 ${pct}%, #EAEAEA ${pct}%)` }}
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
    // 체크 확정 시 아이콘을 기본 카테고리와 동일한 스타일(흰 배경 + 브랜드 그린)로 전환
    onUpdate({ ...cat, amount: clamped, confirmed: true });
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
        width: 353, border: 'none',
        borderRadius: 16, paddingLeft: 17, paddingRight: 17, paddingTop: 16, paddingBottom: 16,
        display: 'flex', flexDirection: 'column', gap: 10,
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.07)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => setShowIconPicker(p => !p)}
          className="active:scale-90 transition-transform flex-shrink-0"
          style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: cat.confirmed ? '#FFFFFF' : bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon size={18} style={{ color: cat.confirmed ? '#1CD1A1' : color }} strokeWidth={1.8} />
        </button>
        <div style={{ flex: 1, marginLeft: 12 }}>
          {editingName ? (
            <input
              autoFocus type="text" value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={confirmName}
              onKeyDown={e => e.key === 'Enter' && confirmName()}
              placeholder="카테고리명"
              style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 500, color: '#555555', outline: 'none', background: 'transparent', border: 'none', borderBottom: '1.5px solid #1CD1A1', width: '100%', paddingBottom: 2 }}
            />
          ) : (
            <button onClick={() => { setNameVal(cat.name); setEditingName(true); }} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 500, color: '#555555' }}>{cat.name || '카테고리명'}</span>
              <SquarePen size={12} color="#999999" />
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
                style={{ width: 100, height: 34, borderRadius: 9999, border: '1px solid #1CD1A1', backgroundColor: '#EDF4FF', paddingLeft: 12, paddingRight: 12, fontSize: 13, color: '#555555', outline: 'none', textAlign: 'center' }}
              />
              <button onClick={confirmAmount} style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#1CD1A1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                <Check size={13} color="white" strokeWidth={2.5} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setInputVal(String(cat.amount)); setEditingAmount(true); }} style={{ width: 100, height: 34, borderRadius: 9999, border: '1px solid #EAEAEA', backgroundColor: '#EDF4FF', paddingLeft: 12, paddingRight: 12, cursor: 'pointer' }}>
                <span style={{ fontSize: 13, color: '#555555' }}>{cat.amount.toLocaleString('ko-KR')}원</span>
              </button>
              <button onClick={() => { setInputVal(String(cat.amount)); setEditingAmount(true); }}>
                <SquarePen size={15} color="#999999" />
              </button>
            </>
          )}
        </div>
        <button onClick={onDelete} className="active:scale-90 transition-transform" style={{ marginLeft: 6, flexShrink: 0 }}>
          <X size={16} color="#999999" />
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
        style={{ width: 319, height: 12, borderRadius: 6, background: `linear-gradient(to right, #1CD1A1 ${pct}%, #EAEAEA ${pct}%)` }}
      />
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────
export default function BudgetSetupScreen({ onComplete, onBack, initialBudget = 0, submitLabel = '설정 완료' }) {
  // 저장된 카테고리가 있으면 로드 (예산 탭에서 수정 진입 시 기존 값 유지)
  // 캐시가 옛 버전(카테고리 개수/이름이 다름)일 수 있어 이름으로만 금액을 가져오고,
  // 기본 4종(식비/교통/쇼핑/문화) 자체는 캐시 내용과 무관하게 항상 보장함
  const [categories, setCategories] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('delta_budget_categories') || '[]');
      return DEFAULT_CATEGORIES.map(d => {
        const cached = saved.find(c => !c.iconId && c.name === d.name);
        return cached ? { ...d, amount: cached.amount } : d;
      });
    } catch { return DEFAULT_CATEGORIES; }
  });
  const [customCategories, setCustomCategories] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('delta_budget_categories') || '[]');
      return saved.filter(c => c.iconId);
    } catch { return []; }
  });
  const [budgetInput, setBudgetInput] = useState(initialBudget > 0 ? String(initialBudget) : '');
  // 삭제된 커스텀 카테고리명 — 저장 시 서버에도 삭제 요청 (명세: DELETE /finances/expense-categories/{categoryId})
  const removedNamesRef = useRef([]);

  const [toast, setToast] = useState(false);
  const [toastFading, setToastFading] = useState(false);
  const [budgetToast, setBudgetToast] = useState(null);
  const [budgetToastFading, setBudgetToastFading] = useState(false);

  // 서버에 저장된 이번 달 예산으로 최초 1회 보정 (예산 탭에서 수정하러 들어온 경우 최신 값 반영)
  useEffect(() => {
    getBudget()
      .then(data => {
        if (!Array.isArray(data?.expenseBudgets)) return;
        const fixedNames = new Set(DEFAULT_CATEGORIES.map(c => c.name));
        const matchServer = (name) => data.expenseBudgets.find(b => b.categoryName === name);
        setCategories(prev => DEFAULT_CATEGORIES.map(d => ({ ...d, amount: matchServer(d.name)?.amount ?? 0 })));
        setCustomCategories(prev => data.expenseBudgets
          .filter(b => !fixedNames.has(b.categoryName))
          .map(b => {
            const existing = prev.find(c => c.name === b.categoryName);
            return {
              category_id: existing?.category_id ?? Date.now() + Math.random(),
              iconId: existing?.iconId ?? 'shop',
              name: b.categoryName,
              amount: b.amount,
              confirmed: true,
            };
          }));
        if (data.totalExpenseBudget) setBudgetInput(String(data.totalExpenseBudget));
      })
      .catch(() => {}); // 서버 미가동/데이터 없음 — 로컬 값 유지
  }, []);

  // FE 카테고리명 → 서버 categoryId 해석 (기본 4종 외엔 서버에서 조회/생성)
  async function resolveCategoryIds(names) {
    const map = {};
    const unresolved = [];
    names.forEach(name => {
      if (CATEGORY_ID_MAP[name]) map[name] = CATEGORY_ID_MAP[name];
      else unresolved.push(name);
    });
    if (unresolved.length) {
      const serverCats = await getExpenseCategories().catch(() => []);
      for (const name of unresolved) {
        const existing = serverCats.find(c => c.name === name);
        if (existing) { map[name] = existing.categoryId; continue; }
        const created = await addExpenseCategory(name).catch(() => null);
        if (created?.categoryId) map[name] = created.categoryId;
      }
    }
    return map;
  }

  // 목표 지출 예산 서버 동기화 — 로컬 플로우를 막지 않도록 백그라운드로 호출
  async function syncBudgetToServer(allCats, total) {
    const named = allCats.filter(c => c.name?.trim());
    const idMap = await resolveCategoryIds(named.map(c => c.name));

    // 삭제된 커스텀 카테고리 — 기본 카테고리(식비/교통/쇼핑/문화)는 서버가 삭제를 거부하므로 제외
    const removedNames = removedNamesRef.current.filter(name => !CATEGORY_ID_MAP[name]);
    if (removedNames.length) {
      const serverCats = await getExpenseCategories().catch(() => []);
      for (const name of removedNames) {
        const existing = serverCats.find(c => c.name === name);
        if (existing) await deleteExpenseCategory(existing.categoryId).catch(() => {});
      }
      removedNamesRef.current = [];
    }

    const expenseBudgets = named
      .map(c => ({ categoryId: idMap[c.name], amount: c.amount || 0 }))
      .filter(b => b.categoryId);
    if (expenseBudgets.length) {
      await updateExpenseBudget(total, expenseBudgets);
    }
  }

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

  // 모든 예산 배분 완료 여부
  const isComplete = totalBudget > 0 && totalAllocated === totalBudget;

  // 배분 완료 순간 감지 → 캐릭터 fade in(1.5s) → 1s 유지 → fade out(0.5s)
  const [showComplete, setShowComplete] = useState(false);
  const prevCompleteRef = useRef(false);
  useEffect(() => {
    const was = prevCompleteRef.current;
    prevCompleteRef.current = isComplete;
    if (isComplete && !was) {
      setShowComplete(true);
      const t = setTimeout(() => setShowComplete(false), 3000); // 애니메이션 총 길이와 동일
      return () => clearTimeout(t);
    }
    if (!isComplete) setShowComplete(false);
  }, [isComplete]);

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
    // 서버 동기화 (명세: PUT /finances/expense-budget) — 실패해도 로컬 플로우는 이미 진행됨
    syncBudgetToServer([...categories, ...customCategories], totalBudget).catch(() => {});
  }

  async function handleCopyLastMonth() {
    try {
      const data = await copyLastMonthBudget();
      if (!data?.expenseBudgets?.length) throw new Error('empty');
      const fixedNames = new Set(DEFAULT_CATEGORIES.map(c => c.name));
      const matchServer = (name) => data.expenseBudgets.find(b => b.categoryName === name);
      setCategories(DEFAULT_CATEGORIES.map(d => ({ ...d, amount: matchServer(d.name)?.amount ?? 0 })));
      setCustomCategories(data.expenseBudgets
        .filter(b => !fixedNames.has(b.categoryName))
        .map(b => ({ category_id: Date.now() + Math.random(), iconId: 'shop', name: b.categoryName, amount: b.amount, confirmed: true })));
      setBudgetInput(String(data.totalExpenseBudget || 0));
    } catch {
      // 404(MONTHLY_FINANCE_NOT_FOUND) 등 — 지난달 계획 없음
      setToast(true);
      setToastFading(false);
      setTimeout(() => {
        setToastFading(true);
        setTimeout(() => setToast(false), 300);
      }, 1700);
    }
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
    setCustomCategories(prev => {
      const target = prev.find(c => c.category_id === category_id);
      if (target?.name?.trim()) removedNamesRef.current.push(target.name.trim());
      return prev.filter(c => c.category_id !== category_id);
    });
  }

  return (
    <div className="flex flex-col overflow-y-auto bg-white" style={{ minHeight: '100%', paddingBottom: '100px', paddingLeft: '20px', paddingRight: '17px' }}>

      {/* ── 배분 완료: 캐릭터 + 말풍선 (설정 완료 버튼 우측 상단) ────── */}
      {showComplete && (
        <div
          className="fade-in-hold-out"
          style={{
            position: 'fixed',
            right: '20px',
            bottom: '88px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            zIndex: 100,
            pointerEvents: 'none',
          }}
        >
          {/* 말풍선 */}
          <div style={{ position: 'relative', marginBottom: 6, marginRight: 8 }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '12px 20px', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)' }}>
              <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', fontWeight: 500, color: '#555555' }}>
                이번 달도 잘 지켜보자!
              </span>
            </div>
            {/* 꼬리 — 오른쪽 하단 (캐릭터 방향) */}
            <div style={{ position: 'absolute', bottom: '-9px', right: '32px', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '9px solid #FFFFFF' }} />
          </div>
          {/* 완료 캐릭터 */}
          <img src={budgetCompleteImg} alt="예산 설정 완료" style={{ width: 155, height: 155, objectFit: 'contain' }} />
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
      <p style={{ fontSize: '13px', color: '#999999', marginBottom: '24px', paddingLeft: '4px' }}>
        멋진 계획은 부자가 되는 첫걸음이에요!
      </p>

      {/* ── 지난달 계획 복사하기 ─────────────────────────────────────── */}
      <button
        onClick={handleCopyLastMonth}
        className="flex items-center active:scale-[0.98] transition-transform"
        style={{ width: 353, height: 97.5, borderRadius: 32, border: 'none', backgroundColor: '#FFFFFF', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)', paddingTop: 24, paddingBottom: 24, paddingLeft: 24, gap: 20, marginBottom: 32 }}
      >
        <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, backgroundColor: '#1CD1A133' }}>
          <Sparkles size={18} color="#1CD1A1" />
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="text-gray-800 font-semibold text-sm">지난달 계획 복사하기</span>
          <span className="text-gray-400 text-xs">이전 예산을 그대로 가져올게요</span>
        </div>
      </button>

      {/* ── 예산 항목별 설정 헤더 ────────────────────────────────────── */}
      <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: '18px', lineHeight: '20px', letterSpacing: '0.28px', color: '#1A1A1A', marginBottom: '20px' }}>
        예산 항목별 설정
      </p>

      {/* ── 총 예산 입력 ─────────────────────────────────────────────── */}
      <div
        className="flex items-center"
        style={{ width: 353, minHeight: 97.5, borderRadius: 32, border: 'none', backgroundColor: 'rgba(28, 209, 161, 0.1)', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)', paddingTop: 24, paddingBottom: 24, paddingLeft: 24, gap: 20, marginBottom: 12 }}
      >
        <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, backgroundColor: '#FFFFFF' }}>
          <Wallet size={18} color="#1CD1A1" />
        </div>
        <div className="flex flex-col items-start gap-1.5 flex-1">
          <span className="text-gray-800 font-semibold text-sm">이번 달 총 예산</span>
          <div className="flex items-center gap-1">
            <input
              type="number" placeholder="금액 입력" value={budgetInput}
              onChange={e => setBudgetInput(e.target.value.replace(/[^0-9]/g, ''))}
              className="text-sm outline-none bg-transparent placeholder-[#1CD1A1]"
              style={{ color: '#1CD1A1', fontWeight: 400, width: 150 }}
            />
            <span className="text-sm font-semibold" style={{ color: '#1CD1A1' }}>원</span>
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
          <span style={{ fontSize: 12, color: '#999999' }}>배분 가능 남은 예산</span>
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: unallocated < 0 ? '#EF4444' : unallocated === 0 ? '#1CD1A1' : '#1A1A1A',
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
        style={{ width: 353, height: 48, backgroundColor: '#F4F4F4', borderRadius: 100, border: 'none', cursor: 'pointer', marginTop: 12 }}
      >
        <PlusCircle size={22} color="#1CD1A1" strokeWidth={2} />
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', fontWeight: 600, color: '#1CD1A1' }}>
          카테고리 추가하기
        </span>
      </button>

      {/* ── 설정 완료 버튼 (고정) ────────────────────────────────────── */}
      <button
        onClick={handleComplete}
        className="bg-[#1CD1A1] rounded-4xl flex items-center justify-center active:scale-95 transition-transform shadow-lg"
        style={{ position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', width: `${390 * 0.85}px`, height: '48px', fontSize: '15px' }}
      >
        <span className="text-white font-bold">{submitLabel}</span>
      </button>
    </div>
  );
}
