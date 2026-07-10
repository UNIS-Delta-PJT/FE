import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import WarningToast from './WarningToast';

// 연필 아이콘 (이미지 #1 기반 인라인 SVG)
function EditIcon({ size = 20, color = '#1CD1A1' }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.25)}
      viewBox="0 0 20 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 22.5H6.25L17.5 11.25L13.75 7.5L2.5 18.75V22.5Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.75 7.5L16.25 5L19 7.75L16.5 10.25L13.75 7.5Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function BudgetGoalScreen({ onNext, onBack, initialBudget = '', submitLabel = '다음' }) {
  const [amount, setAmount] = useState(initialBudget ? String(initialBudget) : '');
  const [toast, setToast] = useState(false);
  const [toastFading, setToastFading] = useState(false);

  function handleChange(e) {
    setAmount(e.target.value.replace(/[^0-9]/g, ''));
  }

  function showToast() {
    setToast(true);
    setToastFading(false);
    setTimeout(() => {
      setToastFading(true);
      setTimeout(() => setToast(false), 300);
    }, 1700);
  }

  function handleNext() {
    if (!amount || parseInt(amount) === 0) {
      showToast();
      return;
    }
    onNext(parseInt(amount));
  }

  return (
    <div
      className="flex flex-col bg-white"
      style={{ minHeight: '100%', paddingBottom: '100px', paddingLeft: '20px', paddingRight: '20px' }}
    >
      {/* 토스트 */}
      <WarningToast visible={toast} fading={toastFading} message="목표 예산이 입력되지 않았어요!" bottom={100} />

      {/* 헤더 spacer */}
      <div style={{ height: '39px', flexShrink: 0 }} />

      {/* 헤더 고정 — IncomeSetupScreen과 동일한 구조 */}
      <div
        className="flex items-center gap-3 bg-white z-10"
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '390px',
          paddingTop: '20px',
          paddingBottom: '12px',
          paddingLeft: '20px',
          paddingRight: '17px',
        }}
      >
        <button onClick={onBack} className="active:scale-90 transition-transform p-1">
          <ArrowLeft size={20} className="text-gray-800" />
        </button>
        <h1 className="font-black text-gray-900" style={{ fontSize: '18px' }}>
          한 달 소비 계획
        </h1>
      </div>

      {/* 부제목 */}
      <p
        style={{
          fontFamily: 'Pretendard, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          color: '#999999',
          marginBottom: '32px',
          paddingLeft: '4px',
        }}
      >
        멋진 계획은 부자가 되는 첫 걸음이에요!
      </p>

      {/* 목표 예산 라벨 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '10px', paddingLeft: '4px' }}>
        <span
          style={{
            fontFamily: 'Pretendard, sans-serif',
            fontSize: '16px',
            fontWeight: 500,
            color: '#1A1A1A',
          }}
        >
          목표 예산
        </span>
        <span
          style={{
            fontFamily: 'Pretendard, sans-serif',
            fontSize: '16px',
            fontWeight: 500,
            color: '#FF3B30',
          }}
        >
          *
        </span>
      </div>

      {/* 목표 예산 input container */}
      <div
        style={{
          width: '353px',
          height: '52px',
          backgroundColor: '#F4F4F4',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '24px',
          paddingRight: '24px',
          boxSizing: 'border-box',
        }}
      >
        <input
          type="number"
          inputMode="numeric"
          placeholder="금액을 입력하세요"
          value={amount}
          onChange={handleChange}
          style={{
            flex: 1,
            fontFamily: 'Pretendard, sans-serif',
            fontSize: '18px',
            fontWeight: 500,
            color: '#1A1A1A',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            minWidth: 0,
          }}
        />
        {amount && (
          <span
            style={{
              fontFamily: 'Pretendard, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              color: '#1A1A1A',
              marginRight: '10px',
              flexShrink: 0,
            }}
          >
            원
          </span>
        )}
        <EditIcon size={18} color="#1CD1A1" />
      </div>

      {/* 다음 버튼 */}
      <button
        onClick={handleNext}
        style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '353px',
          height: '56px',
          backgroundColor: '#1CD1A1',
          borderRadius: '100px',
          paddingLeft: '10px',
          paddingRight: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(28, 209, 161, 0.40)',
        }}
      >
        <span
          style={{
            fontFamily: 'Pretendard, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            color: '#FFFFFF',
          }}
        >
          {submitLabel}
        </span>
      </button>
    </div>
  );
}
