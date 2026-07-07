import { useState, useRef } from 'react';
import { ArrowLeft, CheckCircle, Pencil, ChevronDown } from 'lucide-react';
import { todayString } from '../api/expenses';
import CategoryIcon from './CategoryIcons';

// ── 상수 ────────────────────────────────────────────────────────────────────
const CATEGORIES = ['식비', '카페', '교통', '쇼핑', '문화비', '생활비'];

const mockResults = [
  { expense_id: 1, merchant: '바나프레소 커피', icon: '☕', amount: 8500,  category: '카페' },
  { expense_id: 2, merchant: '올리브영',        icon: '🛍️', amount: 23000, category: '쇼핑' },
  { expense_id: 3, merchant: '지하철',          icon: '🚇', amount: 1400,  category: '교통' },
];

// ── 영수증 아이콘 ─────────────────────────────────────────────────────────
function ReceiptIcon({ color = '#1CD1A1', size = 20 }) {
  return (
    <svg width={size} height={size * (20 / 18)} viewBox="0 0 18 20" fill="none">
      <path
        d="M1 2C1 1.45 1.45 1 2 1H16C16.55 1 17 1.45 17 2V15L14.5 19L12 15L9.5 19L7 15L4.5 19L2 15L1 15V2Z"
        stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"
      />
      <path
        d="M4.5 6H13.5M4.5 9H13.5M4.5 12H9.5"
        stroke={color} strokeWidth="1.5" strokeLinecap="round"
      />
    </svg>
  );
}

// ── 편집 가능한 카드 ──────────────────────────────────────────────────────
function EditableCard({ item, onChange }) {
  const [editingField, setEditingField] = useState(null); // null | 'merchant' | 'amount' | 'category'
  const [draftMerchant, setDraftMerchant] = useState(item.merchant);
  const [draftAmount, setDraftAmount]   = useState(String(item.amount));
  const merchantRef = useRef(null);
  const amountRef   = useRef(null);

  function startEdit(field) {
    setEditingField(field);
    if (field === 'merchant') setTimeout(() => merchantRef.current?.focus(), 40);
    if (field === 'amount')   setTimeout(() => amountRef.current?.focus(), 40);
  }

  function commitMerchant() {
    const val = draftMerchant.trim() || item.merchant;
    setDraftMerchant(val);
    onChange({ ...item, merchant: val });
    setEditingField(null);
  }

  function commitAmount() {
    const parsed = parseInt(draftAmount.replace(/[^0-9]/g, ''), 10);
    const val = isNaN(parsed) || parsed <= 0 ? item.amount : parsed;
    setDraftAmount(String(val));
    onChange({ ...item, amount: val });
    setEditingField(null);
  }

  function selectCategory(cat) {
    onChange({ ...item, category: cat });
    setEditingField(null);
  }

  return (
    <div
      style={{
        borderRadius: 20,
        background: '#FFFFFF',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      {/* 가맹점 행 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* 아이콘 */}
        <div
          style={{
            width: 44, height: 44,
            borderRadius: 14,
            background: '#F4FDFA',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ReceiptIcon size={20} color="#1CD1A1" />
        </div>

        {/* 가맹점명 */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, color: '#999999', margin: '0 0 2px 0', fontFamily: 'Pretendard, sans-serif' }}>
            가맹점
          </p>
          {editingField === 'merchant' ? (
            <input
              ref={merchantRef}
              value={draftMerchant}
              onChange={e => setDraftMerchant(e.target.value)}
              onBlur={commitMerchant}
              onKeyDown={e => { if (e.key === 'Enter') commitMerchant(); }}
              style={{
                width: '100%',
                fontSize: 15, fontWeight: 700, color: '#1A1A1A',
                fontFamily: 'Pretendard, sans-serif',
                border: 'none', borderBottom: '1.5px solid #1CD1A1',
                outline: 'none', background: 'transparent',
                padding: '2px 0',
              }}
            />
          ) : (
            <button
              onClick={() => startEdit('merchant')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', fontFamily: 'Pretendard, sans-serif' }}>
                {item.merchant}
              </span>
              <Pencil size={12} color="#999999" />
            </button>
          )}
        </div>
      </div>

      {/* 구분선 */}
      <div style={{ height: 1, background: '#F4F4F4', margin: '12px 0' }} />

      {/* 금액 + 카테고리 행 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>

        {/* 금액 */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, color: '#999999', margin: '0 0 4px 0', fontFamily: 'Pretendard, sans-serif' }}>
            금액
          </p>
          {editingField === 'amount' ? (
            <input
              ref={amountRef}
              type="number"
              value={draftAmount}
              onChange={e => setDraftAmount(e.target.value)}
              onBlur={commitAmount}
              onKeyDown={e => { if (e.key === 'Enter') commitAmount(); }}
              style={{
                width: '100%',
                fontSize: 17, fontWeight: 700, color: '#1A1A1A',
                fontFamily: 'Pretendard, sans-serif',
                border: 'none', borderBottom: '1.5px solid #1CD1A1',
                outline: 'none', background: 'transparent',
                padding: '2px 0',
              }}
            />
          ) : (
            <button
              onClick={() => startEdit('amount')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A', fontFamily: 'Pretendard, sans-serif' }}>
                ₩{item.amount.toLocaleString('ko-KR')}
              </span>
              <Pencil size={12} color="#999999" />
            </button>
          )}
        </div>

        {/* 카테고리 */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, color: '#999999', margin: '0 0 4px 0', fontFamily: 'Pretendard, sans-serif' }}>
            카테고리
          </p>
          <button
            onClick={() => setEditingField(f => f === 'category' ? null : 'category')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#E8FAF6', borderRadius: 100,
              padding: '4px 10px',
              border: 'none', cursor: 'pointer',
            }}
          >
            <CategoryIcon name={item.category} width={13} height={13} color="#1CD1A1" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1CD1A1', fontFamily: 'Pretendard, sans-serif' }}>
              {item.category}
            </span>
            <ChevronDown
              size={13}
              color="#1CD1A1"
              style={{
                transform: editingField === 'category' ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </button>
        </div>
      </div>

      {/* 카테고리 선택 패널 */}
      {editingField === 'category' && (
        <div
          style={{
            display: 'flex', flexWrap: 'wrap', gap: 8,
            marginTop: 12, paddingTop: 12,
            borderTop: '1px solid #F4F4F4',
          }}
        >
          {CATEGORIES.map(cat => {
            const active = cat === item.category;
            return (
              <button
                key={cat}
                onClick={() => selectCategory(cat)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 12px', borderRadius: 100, border: 'none',
                  background: active ? '#1CD1A1' : '#F4F4F4',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                <CategoryIcon name={cat} width={12} height={12} color={active ? '#fff' : '#555'} />
                <span
                  style={{
                    fontSize: 12, fontWeight: 600,
                    color: active ? '#fff' : '#555',
                    fontFamily: 'Pretendard, sans-serif',
                  }}
                >
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── 메인 화면 ─────────────────────────────────────────────────────────────
export default function ScanResultScreen({ onBack, onHome }) {
  const [results, setResults] = useState(mockResults);

  function updateItem(updated) {
    setResults(prev => prev.map(r => r.expense_id === updated.expense_id ? updated : r));
  }

  function handleHome() {
    const now = new Date();
    const scannedExpenses = results.map(r => ({
      expense_id: Date.now() + r.expense_id,
      icon: r.icon,
      place: r.merchant,
      name: r.category,
      expense_date: todayString(),
      saved_at: now.toISOString(),
      amount: r.amount,
    }));
    onHome(scannedExpenses);
  }

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', gap: 12,
        padding: '0 20px 120px 20px',
        background: '#FFFFFF',
        minHeight: '100%',
      }}
    >
      {/* 타이틀 + 뒤로 가기 */}
      <div
        style={{
          position: 'relative', textAlign: 'center',
          marginTop: 20, marginBottom: 8,
        }}
      >
        <button
          onClick={onBack}
          style={{
            position: 'absolute', left: -4, top: '50%',
            transform: 'translateY(-50%)',
            background: 'none', border: 'none',
            padding: 4, cursor: 'pointer',
            display: 'flex', alignItems: 'center',
          }}
        >
          <ArrowLeft size={20} color="#1A1A1A" />
        </button>

        <h1
          style={{
            fontSize: 20, fontWeight: 700, color: '#1A1A1A',
            fontFamily: 'Pretendard, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            margin: 0,
          }}
        >
          <CheckCircle size={22} color="#1CD1A1" />
          스캔 완료!
        </h1>
        <p
          style={{
            fontSize: 13, color: '#999999',
            fontFamily: 'Pretendard, sans-serif',
            margin: '4px 0 0 0',
          }}
        >
          스크린샷을 성공적으로 읽었어요
        </p>
      </div>

      {/* 편집 가능한 카드 목록 */}
      {results.map(item => (
        <EditableCard key={item.expense_id} item={item} onChange={updateItem} />
      ))}

      {/* 홈으로 버튼 (floating) */}
      <button
        onClick={handleHome}
        style={{
          position: 'fixed',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${390 * 0.85}px`,
          height: 48,
          background: '#1CD1A1',
          borderRadius: 100,
          border: 'none',
          cursor: 'pointer',
          fontSize: 15, fontWeight: 700, color: '#FFFFFF',
          fontFamily: 'Pretendard, sans-serif',
          boxShadow: '0px 4px 16px rgba(28, 209, 161, 0.35)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'translateX(-50%) scale(0.97)'}
        onMouseUp={e => e.currentTarget.style.transform = 'translateX(-50%) scale(1)'}
      >
        홈으로
      </button>
    </div>
  );
}
