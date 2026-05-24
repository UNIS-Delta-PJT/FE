import { useState, useEffect } from 'react';
import { Settings, X, Trash2, PlusCircle, Check, Pencil } from 'lucide-react';
import CategoryIcon from './CategoryIcons';

function EditIcon({ color = '#2ECC71', width = 20, height = 25 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 20 25" fill="none">
      <path d="M14 3L17 6L8 15H5V12L14 3Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 20H18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AmountBox({ amount }) {
  return (
    <div className="flex items-center justify-center" style={{ width: 289, height: 64, borderRadius: 48, backgroundColor: '#F3F4F5' }}>
      <span className="font-bold text-gray-800" style={{ fontSize: 18 }}>
        {amount.toLocaleString('ko-KR')}원
      </span>
    </div>
  );
}

function Toggle({ active, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{ width: 48, height: 24, borderRadius: 12, backgroundColor: active ? '#2ECC71' : '#E2E8F0', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s', flexShrink: 0 }}
    >
      <div
        style={{ position: 'absolute', top: 4, left: active ? 28 : 4, width: 16, height: 16, borderRadius: 8, backgroundColor: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   수입 수정 팝업 — 추가 / 수정 / 삭제 모두 지원
───────────────────────────────────────────────────────── */
function IncomeEditPopup({ onClose, onSaved }) {
  const [incomes, setIncomes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('delta_incomes') || '[]'); }
    catch { return []; }
  });

  // 인라인 편집 상태
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');

  // 새 항목 추가 상태
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');

  function handleStartEdit(income) {
    setEditingId(income.income_id);
    setEditName(income.name);
    setEditAmount(String(income.amount));
  }

  function handleSaveEdit(income_id) {
    if (!editName.trim() || !editAmount) return;
    setIncomes(prev => prev.map(i =>
      i.income_id === income_id
        ? { ...i, name: editName.trim(), amount: parseInt(editAmount) }
        : i
    ));
    setEditingId(null);
  }

  function handleCancelEdit() {
    setEditingId(null);
  }

  function handleDelete(income_id) {
    setIncomes(prev => prev.filter(i => i.income_id !== income_id));
    if (editingId === income_id) setEditingId(null);
  }

  function handleAdd() {
    if (!newName.trim() || !newAmount) return;
    setIncomes(prev => [...prev, { income_id: Date.now(), name: newName.trim(), amount: parseInt(newAmount) }]);
    setNewName('');
    setNewAmount('');
  }

  function handleSave() {
    localStorage.setItem('delta_incomes', JSON.stringify(incomes));
    onSaved?.();
    onClose();
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: '0 20px' }} onClick={onClose}>
      <div className="w-full bg-white" style={{ borderRadius: 20, maxHeight: '75%', overflowY: 'auto', padding: 32 }} onClick={e => e.stopPropagation()}>
        <p className="font-bold text-gray-900" style={{ fontSize: 16, marginBottom: 20 }}>수입 리스트</p>

        {/* 기존 수입 목록 */}
        <div className="flex flex-col" style={{ gap: 10 }}>
          {incomes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center" style={{ paddingTop: 16, paddingBottom: 16 }}>등록된 수입이 없어요</p>
          ) : incomes.map(item => (
            <div key={item.income_id} className="flex flex-col bg-gray-50 rounded-2xl" style={{ padding: '14px 16px' }}>
              {editingId === item.income_id ? (
                /* 편집 모드 */
                <div className="flex flex-col" style={{ gap: 8 }}>
                  <input
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="text-sm outline-none bg-transparent text-gray-800"
                    style={{ fontWeight: 600 }}
                  />
                  <div style={{ height: 1, backgroundColor: '#E5E7EB' }} />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center" style={{ gap: 4 }}>
                      <input
                        type="number"
                        value={editAmount}
                        onChange={e => setEditAmount(e.target.value.replace(/[^0-9]/g, ''))}
                        className="text-sm outline-none bg-transparent"
                        style={{ color: '#2ECC71', fontWeight: 600, width: 120 }}
                      />
                      <span className="text-sm text-gray-400">원</span>
                    </div>
                    <div className="flex items-center" style={{ gap: 8 }}>
                      <button
                        onClick={handleCancelEdit}
                        className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                        style={{ backgroundColor: '#F3F4F5' }}
                      >
                        <X size={13} className="text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleSaveEdit(item.income_id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                        style={{ backgroundColor: '#2ECC71' }}
                      >
                        <Check size={13} className="text-white" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* 표시 모드 */
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-400" style={{ marginTop: 2 }}>{item.amount.toLocaleString('ko-KR')}원</p>
                  </div>
                  <div className="flex items-center" style={{ gap: 10 }}>
                    <button onClick={() => handleStartEdit(item)} className="active:scale-90 transition-transform">
                      <Pencil size={14} className="text-gray-400" />
                    </button>
                    <button onClick={() => handleDelete(item.income_id)} className="active:scale-90 transition-transform">
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 새 수입 추가 */}
        <div className="flex flex-col" style={{ gap: 8, marginTop: 20 }}>
          <p className="text-sm font-semibold text-gray-700">새 수입 추가</p>
          <div className="flex flex-col bg-gray-50 rounded-2xl" style={{ padding: '14px 20px', gap: 10 }}>
            <input
              type="text"
              placeholder="수입 이름"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="text-sm outline-none bg-transparent text-gray-800 placeholder-gray-300"
              style={{ width: '100%' }}
            />
            <div style={{ height: 1, backgroundColor: '#E5E7EB' }} />
            <div className="flex items-center justify-between">
              <input
                type="number"
                placeholder="금액 입력"
                value={newAmount}
                onChange={e => setNewAmount(e.target.value.replace(/[^0-9]/g, ''))}
                className="text-sm outline-none bg-transparent placeholder-gray-300"
                style={{ color: '#2ECC71', fontWeight: 600, width: '80%' }}
              />
              <span className="text-sm text-gray-400">원</span>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="active:scale-95 transition-transform"
            style={{ height: 44, borderRadius: 9999, backgroundColor: '#F3F4F5', fontSize: 14, fontWeight: 600, color: '#2ECC71', border: 'none' }}
          >
            + 추가
          </button>
        </div>

        <div className="flex gap-3" style={{ marginTop: 24 }}>
          <button
            onClick={onClose}
            className="flex-1 active:scale-95 transition-transform"
            style={{ height: 48, borderRadius: 9999, backgroundColor: '#F3F4F5', fontSize: 15, fontWeight: 600, color: '#6B7280' }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-1 active:scale-95 transition-transform"
            style={{ height: 48, borderRadius: 9999, backgroundColor: '#2ECC71', fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   카테고리 예산 수정 팝업 — 수정 / 추가 / 삭제 모두 지원
───────────────────────────────────────────────────────── */
function BudgetEditPopup({ onClose, onSaved }) {
  const [cats, setCats] = useState(() => {
    try { return JSON.parse(localStorage.getItem('delta_budget_categories') || '[]'); }
    catch { return []; }
  });

  // 새 카테고리 추가 상태
  const [newCatName, setNewCatName] = useState('');
  const [newCatAmount, setNewCatAmount] = useState('');

  function handleChange(id, val) {
    setCats(prev => prev.map(c => c.category_id === id ? { ...c, amount: parseInt(val) || 0 } : c));
  }

  function handleDelete(id) {
    setCats(prev => prev.filter(c => c.category_id !== id));
  }

  function handleAdd() {
    if (!newCatName.trim()) return;
    setCats(prev => [...prev, {
      category_id: Date.now(),
      name: newCatName.trim(),
      amount: parseInt(newCatAmount) || 0,
    }]);
    setNewCatName('');
    setNewCatAmount('');
  }

  function handleSave() {
    // 카테고리 저장
    localStorage.setItem('delta_budget_categories', JSON.stringify(cats));
    // 총 예산도 카테고리 합계로 동기화
    const newTotal = cats.reduce((sum, c) => sum + (c.amount || 0), 0);
    localStorage.setItem('delta_budget_total', JSON.stringify(newTotal));
    onSaved?.();
    onClose();
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: '0 20px' }} onClick={onClose}>
      <div className="w-full bg-white" style={{ borderRadius: 20, maxHeight: '75%', overflowY: 'auto', padding: 32 }} onClick={e => e.stopPropagation()}>
        <p className="font-bold text-gray-900" style={{ fontSize: 16, marginBottom: 20 }}>카테고리별 예산 수정</p>

        {/* 기존 카테고리 목록 */}
        <div className="flex flex-col" style={{ gap: 14 }}>
          {cats.length === 0 ? (
            <p className="text-sm text-gray-400 text-center" style={{ paddingTop: 16, paddingBottom: 16 }}>등록된 카테고리가 없어요</p>
          ) : cats.map(cat => (
            <div key={cat.category_id} className="flex flex-col" style={{ gap: 6 }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">{cat.name}</span>
                <button onClick={() => handleDelete(cat.category_id)} className="active:scale-90 transition-transform">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-2xl" style={{ padding: '12px 16px' }}>
                <span className="text-sm text-gray-400">예산</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={cat.amount}
                    onChange={e => handleChange(cat.category_id, e.target.value.replace(/[^0-9]/g, ''))}
                    className="text-sm outline-none text-right bg-transparent"
                    style={{ width: 120, color: '#2ECC71', fontWeight: 600 }}
                  />
                  <span className="text-sm text-gray-400">원</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 새 카테고리 추가 */}
        <div className="flex flex-col" style={{ gap: 8, marginTop: 20 }}>
          <p className="text-sm font-semibold text-gray-700">새 카테고리 추가</p>
          <div className="flex flex-col bg-gray-50 rounded-2xl" style={{ padding: '14px 20px', gap: 10 }}>
            <input
              type="text"
              placeholder="카테고리 이름"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              className="text-sm outline-none bg-transparent text-gray-800 placeholder-gray-300"
              style={{ width: '100%' }}
            />
            <div style={{ height: 1, backgroundColor: '#E5E7EB' }} />
            <div className="flex items-center justify-between">
              <input
                type="number"
                placeholder="예산 금액"
                value={newCatAmount}
                onChange={e => setNewCatAmount(e.target.value.replace(/[^0-9]/g, ''))}
                className="text-sm outline-none bg-transparent placeholder-gray-300"
                style={{ color: '#2ECC71', fontWeight: 600, width: '80%' }}
              />
              <span className="text-sm text-gray-400">원</span>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="active:scale-95 transition-transform"
            style={{ height: 44, borderRadius: 9999, backgroundColor: '#F3F4F5', fontSize: 14, fontWeight: 600, color: '#2ECC71', border: 'none' }}
          >
            + 추가
          </button>
        </div>

        <div className="flex gap-3" style={{ marginTop: 24 }}>
          <button
            onClick={onClose}
            className="flex-1 active:scale-95 transition-transform"
            style={{ height: 48, borderRadius: 9999, backgroundColor: '#F3F4F5', fontSize: 15, fontWeight: 600, color: '#6B7280' }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-1 active:scale-95 transition-transform"
            style={{ height: 48, borderRadius: 9999, backgroundColor: '#2ECC71', fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   localStorage에서 최신 데이터 읽기
───────────────────────────────────────────────────────── */
function readFromStorage() {
  try {
    const incomes = JSON.parse(localStorage.getItem('delta_incomes') || '[]');
    const totalIncome = incomes.reduce((sum, i) => sum + (parseInt(i.amount) || 0), 0);
    const budgetTotal = JSON.parse(localStorage.getItem('delta_budget_total') || '0') || 0;
    const budgetCats = JSON.parse(localStorage.getItem('delta_budget_categories') || '[]');
    return { totalIncome, budgetTotal, budgetCats };
  } catch {
    return { totalIncome: 0, budgetTotal: 0, budgetCats: [] };
  }
}

/* ─────────────────────────────────────────────────────────
   메인 예산 화면
───────────────────────────────────────────────────────── */
export default function BudgetScreen() {
  const [showIncomePopup, setShowIncomePopup] = useState(false);
  const [showBudgetEditPopup, setShowBudgetEditPopup] = useState(false);

  const [{ totalIncome, budgetTotal, budgetCats }, setData] = useState(readFromStorage);

  // 토글 상태 — category_id 를 키로 사용 (기본값 true)
  const [toggles, setToggles] = useState({});

  // budgetCats가 바뀔 때마다 새 카테고리는 toggle=true 로 초기화
  useEffect(() => {
    setToggles(prev => {
      const next = { ...prev };
      budgetCats.forEach(c => {
        if (!(c.category_id in next)) next[c.category_id] = true;
      });
      return next;
    });
  }, [budgetCats]);

  function refresh() {
    setData(readFromStorage());
  }

  const savings = Math.max(0, totalIncome - budgetTotal);
  const savingsPct = totalIncome > 0 ? Math.min(100, (savings / totalIncome) * 100) : 0;

  return (
    <div className="relative flex flex-col bg-white" style={{ minHeight: '100%', paddingBottom: 20 }}>

      {/* 섹션 제목 */}
      <div className="flex items-center justify-between" style={{ marginLeft: 16, marginRight: 16, marginBottom: 12 }}>
        <h1 className="font-bold text-gray-900" style={{ fontSize: 20 }}>예산 설정</h1>
        <button className="active:scale-90 transition-transform">
          <Settings size={22} color="#555555" strokeWidth={1.8} />
        </button>
      </div>

      {/* 메인 카드 */}
      <div
        className="flex flex-col"
        style={{ backgroundColor: 'white', borderRadius: 20, padding: 32, gap: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 24, marginLeft: 16, marginRight: 16, width: 353, boxSizing: 'border-box' }}
      >
        {/* 한 달 총 수입 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700" style={{ fontSize: 14 }}>한 달 총 수입</span>
            <button onClick={() => setShowIncomePopup(true)} className="active:scale-90 transition-transform">
              <EditIcon />
            </button>
          </div>
          <AmountBox amount={totalIncome} />
        </div>

        <div style={{ height: 1, backgroundColor: '#F3F4F5' }} />

        {/* 저축 목표 금액 */}
        <div className="flex flex-col gap-3">
          <span className="font-semibold text-gray-700" style={{ fontSize: 14 }}>저축 목표 금액</span>
          <AmountBox amount={savings} />
        </div>

        <div style={{ height: 1, backgroundColor: '#F3F4F5' }} />

        {/* 저축 유형 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700" style={{ fontSize: 14 }}>저축 유형</span>
            <span style={{ fontSize: 12, color: '#006D37', fontWeight: 600 }}>
              현재 저축액: {savings.toLocaleString('ko-KR')}원
            </span>
          </div>
          <div className="relative" style={{ height: 12, backgroundColor: '#F3F4F5', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${savingsPct}%`, backgroundColor: '#2ECC71', borderRadius: 6, transition: 'width 0.4s ease' }} />
          </div>
          <div className="flex justify-between px-1">
            {['절약형', '표준형', '도전형'].map(label => (
              <span key={label} className="text-gray-400" style={{ fontSize: 11, fontWeight: 500 }}>{label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 카테고리별 예산 설정 섹션 */}
      <div style={{ marginLeft: 16, marginRight: 16, width: 353 }}>
        {/* 섹션 헤더 */}
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#000' }}>카테고리별 예산 설정</span>
          <button
            onClick={() => setShowBudgetEditPopup(true)}
            className="active:opacity-60 transition-opacity"
            style={{ fontSize: 13, color: '#2ECC71', fontWeight: 500 }}
          >
            수정하기
          </button>
        </div>

        {/* 카테고리 아이템들 — delta_budget_categories 에서 동적으로 표시 */}
        <div className="flex flex-col gap-3">
          {budgetCats.length === 0 ? (
            <p className="text-sm text-gray-400 text-center" style={{ padding: '20px 0' }}>
              등록된 카테고리가 없어요
            </p>
          ) : budgetCats.map(cat => {
            const active = toggles[cat.category_id] !== false;
            const iconColor = active ? '#006D37' : '#3D4A3E';
            return (
              <div
                key={cat.category_id}
                className="flex items-center"
                style={{ width: 353, height: 72, borderRadius: 48, backgroundColor: '#F3F4F5', paddingLeft: 20, paddingRight: 20, boxSizing: 'border-box', gap: 12 }}
              >
                {/* 아이콘 */}
                <div className="flex items-center justify-center flex-shrink-0 rounded-full bg-white" style={{ width: 36, height: 36 }}>
                  <CategoryIcon name={cat.name} width={18} height={16} color={iconColor} />
                </div>

                {/* 텍스트 */}
                <div className="flex flex-col flex-1">
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#000' }}>{cat.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 400, color: '#000', marginTop: 2 }}>
                    {(cat.amount || 0).toLocaleString('ko-KR')}원
                  </span>
                </div>

                {/* 토글 */}
                <Toggle
                  active={active}
                  onToggle={() => setToggles(prev => ({ ...prev, [cat.category_id]: !prev[cat.category_id] }))}
                />
              </div>
            );
          })}

          {/* 카테고리 추가하기 → BudgetEditPopup 열기 */}
          <button
            onClick={() => setShowBudgetEditPopup(true)}
            className="flex items-center justify-center gap-2 active:scale-95 transition-transform"
            style={{ width: 353, height: 36, borderRadius: 48, backgroundColor: '#2ECC71', boxSizing: 'border-box' }}
          >
            <PlusCircle size={16} color="white" />
            <span style={{ fontSize: 14, fontWeight: 500, color: 'white' }}>카테고리 추가하기</span>
          </button>
        </div>
      </div>

      {/* 지난 기록 보기 섹션 */}
      <div style={{ marginLeft: 16, marginRight: 16, width: 353, marginTop: 28 }}>
        <p style={{ fontSize: 20, fontWeight: 700, color: '#000', marginBottom: 14 }}>지난 기록 보기</p>

        {/* 예산 로드맵 버튼 */}
        <button
          className="flex items-center active:scale-[0.98] transition-transform"
          style={{ width: 353, height: 88, borderRadius: 48, backgroundColor: '#006D37', padding: '0 20px', gap: 16, boxSizing: 'border-box' }}
        >
          {/* 아이콘 배경 */}
          <div
            className="flex items-center justify-center flex-shrink-0 rounded-xl"
            style={{ width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="6" cy="5" r="2.5" stroke="white" strokeWidth="1.5"/>
              <circle cx="18" cy="19" r="2.5" stroke="white" strokeWidth="1.5"/>
              <path
                d="M6 7.5C6 7.5 6 13 12 13C18 13 18 16.5 18 16.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* 텍스트 */}
          <div className="flex flex-col items-start gap-1">
            <span style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>예산 로드맵</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#FFFFFF' }}>한 해의 수입 지출, 저축 요약</span>
          </div>
        </button>
      </div>

      {/* 팝업들 */}
      {showIncomePopup && <IncomeEditPopup onClose={() => setShowIncomePopup(false)} onSaved={refresh} />}
      {showBudgetEditPopup && <BudgetEditPopup onClose={() => setShowBudgetEditPopup(false)} onSaved={refresh} />}
    </div>
  );
}
