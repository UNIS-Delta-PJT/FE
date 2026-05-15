import { useState } from 'react';
import { Plus, Trash2, AlertCircle, Pencil } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  { id: 1, name: '식비', icon: '🍽️', amount: '' },
  { id: 2, name: '교통', icon: '🚇', amount: '' },
  { id: 3, name: '문화/여가', icon: '🎭', amount: '' },
  { id: 4, name: '기타', icon: '📦', amount: '' },
];

export default function BudgetSetupScreen({ onComplete }) {
  const [totalBudget, setTotalBudget] = useState('');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const totalCategorySum = categories.reduce((sum, cat) => sum + (parseInt(cat.amount) || 0), 0);
  const parsedTotal = parseInt(totalBudget) || 0;
  const isOverBudget = parsedTotal > 0 && totalCategorySum > parsedTotal;
  const canComplete = parsedTotal > 0 && !isOverBudget;

  function handleAmountChange(id, value) {
    const numeric = value.replace(/[^0-9]/g, '');
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, amount: numeric } : cat));
  }

  function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    setCategories(prev => [...prev, {
      id: Date.now(),
      name: newCategoryName.trim(),
      icon: '📌',
      amount: '',
    }]);
    setNewCategoryName('');
    setShowAddInput(false);
  }

  function handleDeleteCategory(id) {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  }

  function handleRenameCategory(id, name) {
    if (!name.trim()) return;
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, name: name.trim() } : cat));
    setEditingId(null);
  }

  return (
    <div className="flex flex-col px-6 pt-14 overflow-y-auto" style={{ minHeight: '100vh', paddingBottom: '100px' }}>

      {/* 제목 */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">예산 설정</h1>
        <p className="text-gray-400 text-sm mt-1">카테고리별 목표 소비 금액을 입력해주세요</p>
      </div>

      {/* 전체 예산 입력 */}
      <div className="bg-gray-50 rounded-3xl px-5 py-4 mb-6">
        <p className="text-gray-400 text-xs font-medium mb-2">전체 예산</p>
        <div className="flex items-center gap-1">
          <span className="text-gray-400 font-bold text-xl">₩</span>
          <input
            type="number"
            placeholder="0"
            value={totalBudget}
            onChange={e => setTotalBudget(e.target.value.replace(/[^0-9]/g, ''))}
            className="flex-1 bg-transparent text-2xl font-black text-gray-900 outline-none"
          />
        </div>
        {totalCategorySum > 0 && (
          <p className="text-xs text-gray-400 mt-2">
            카테고리 합계 ₩{totalCategorySum.toLocaleString('ko-KR')}
          </p>
        )}
      </div>

      {/* 카테고리 목록 */}
      <div className="flex flex-col gap-3 mb-3">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
            <span style={{ fontSize: '20px' }}>{cat.icon}</span>
            {cat.id > 4 && editingId === cat.id ? (
              <input
                autoFocus
                type="text"
                defaultValue={cat.name}
                onBlur={e => handleRenameCategory(cat.id, e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleRenameCategory(cat.id, e.target.value);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                className="flex-1 text-gray-900 font-semibold text-sm outline-none border-b border-[#2ECC71] bg-transparent"
              />
            ) : (
              <span className="text-gray-900 font-semibold text-sm flex-1">{cat.name}</span>
            )}
            <div className="flex items-center gap-1">
              <span className="text-gray-400 text-sm">₩</span>
              <input
                type="number"
                placeholder="0"
                value={cat.amount}
                onChange={e => handleAmountChange(cat.id, e.target.value)}
                className="w-24 text-right text-gray-900 font-bold text-sm outline-none bg-transparent"
              />
            </div>
            {cat.id > 4 && (
              <div className="flex items-center gap-2 ml-1">
                <button onClick={() => setEditingId(cat.id)}>
                  <Pencil size={13} className="text-gray-300" />
                </button>
                <button onClick={() => handleDeleteCategory(cat.id)}>
                  <Trash2 size={13} className="text-gray-300" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 카테고리 추가 */}
      {showAddInput ? (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="카테고리 이름"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            autoFocus
            className="flex-1 bg-gray-50 rounded-2xl px-4 py-2 text-sm outline-none border border-gray-200"
          />
          <button
            onClick={handleAddCategory}
            className="bg-[#2ECC71] text-white rounded-2xl px-4 py-2 text-sm font-bold"
          >
            추가
          </button>
          <button
            onClick={() => { setShowAddInput(false); setNewCategoryName(''); }}
            className="text-gray-400 text-sm px-1"
          >
            취소
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddInput(true)}
          className="flex items-center gap-1.5 text-[#2ECC71] font-semibold text-sm mb-4 active:opacity-60"
        >
          <Plus size={15} />
          카테고리 추가
        </button>
      )}

      {/* AI 가이드 경고 */}
      {isOverBudget && (
        <div className="bg-red-50 rounded-2xl px-4 py-3 flex items-start gap-3 mt-1">
          <AlertCircle size={17} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-500 font-bold text-sm">예산 초과!</p>
            <p className="text-red-400 text-xs mt-0.5 leading-relaxed">
              카테고리 합계(₩{totalCategorySum.toLocaleString('ko-KR')})가 전체 예산(₩{parsedTotal.toLocaleString('ko-KR')})을 초과했어요. 카테고리별 금액을 조정해주세요.
            </p>
          </div>
        </div>
      )}

      {/* 완료 버튼 */}
      <button
        onClick={onComplete}
        disabled={!canComplete}
        className="bg-[#2ECC71] rounded-4xl flex items-center justify-center transition-transform shadow-lg"
        style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${390 * 0.85}px`,
          height: '48px',
          fontSize: '15px',
          opacity: canComplete ? 1 : 0.4,
        }}
      >
        <span className="text-white font-bold">완료</span>
      </button>
    </div>
  );
}
