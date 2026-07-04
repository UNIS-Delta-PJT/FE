import { useState } from 'react';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

// 목업 데이터 — 추후 백엔드 연동
const mockBudget = { total_amount: 500000, used: 325000 };
const mockCategories = [
  { name: '식비',     icon: '🍽️', amount: 150000, used: 98000 },
  { name: '교통',     icon: '🚇', amount: 50000,  used: 42000 },
  { name: '문화/여가', icon: '🎭', amount: 100000, used: 35000 },
  { name: '기타',     icon: '📦', amount: 50000,  used: 28000 },
];
const mockPatterns = [
  '최근 3일 연속 식비가 일일 평균을 초과했어요',
  '교통비가 이번 달 예산의 84%에 달했어요',
];
const CHALLENGES = [
  {
    id: 1,
    icon: '👑',
    name: '저축왕 챌린지',
    tag: '절약',
    desc: '한 달 동안 목표 금액을 저축할 수 있도록 소비 가이드를 제공해요. 예산 사용률 기반으로 상태를 반영하며, 목표 소비 패턴에서 벗어날 경우 경고 메시지를 드려요.',
  },
  {
    id: 2,
    icon: '🥗',
    name: '식비 절약 챌린지',
    tag: '식비',
    desc: '식비 지출을 10% 줄여보세요. 외식을 줄이고 집밥 비율을 높이는 것부터 시작해봐요.',
  },
  {
    id: 3,
    icon: '🎯',
    name: '무지출 데이 챌린지',
    tag: '습관',
    desc: '일주일에 2번 이상 지출이 없는 날을 만들어보세요. 작은 습관이 큰 차이를 만들어요.',
  },
];

function UsageBar({ ratio, warn }) {
  const pct = Math.min(ratio * 100, 100).toFixed(0);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: warn ? '#F97316' : '#1CD1A1',
          }}
        />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color: warn ? '#F97316' : '#555555' }}>
        {pct}%
      </span>
    </div>
  );
}

export default function AIGuideScreen({ onBack }) {
  const [selectedId, setSelectedId] = useState(null);

  const totalRatio = mockBudget.used / mockBudget.total_amount;

  return (
    <div className="flex flex-col px-5 pt-4 pb-32 gap-6 bg-white">

      {/* 헤더 */}
      <div className="w-[90%] self-center relative text-center" style={{ marginTop: '20px' }}>
        <button
          onClick={onBack}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-1 active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} className="text-gray-800" />
        </button>
        <h1 className="font-bold text-gray-900" style={{ fontSize: '20px' }}>AI 가이드</h1>
      </div>

      {/* ── 소비 분석 ── */}
      <div className="flex flex-col gap-4">
        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">소비 분석</p>

        {/* 전체 예산 사용률 */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-2">
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-bold text-gray-900">전체 예산 사용률</p>
            <p className="text-xs text-gray-400">
              ₩{mockBudget.used.toLocaleString('ko-KR')} / ₩{mockBudget.total_amount.toLocaleString('ko-KR')}
            </p>
          </div>
          <UsageBar ratio={totalRatio} warn={totalRatio >= 0.8} />
        </div>

        {/* 카테고리별 소비 비율 */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-3">
          <p className="text-sm font-bold text-gray-900 mb-1">카테고리별 소비 비율</p>
          {mockCategories.map(({ name, icon, amount, used }) => {
            const ratio = used / amount;
            const warn = ratio >= 0.8;
            return (
              <div key={name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span style={{ fontSize: '14px' }}>{icon}</span>
                    <span className="text-xs font-semibold text-gray-700">{name}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    ₩{used.toLocaleString('ko-KR')} / ₩{amount.toLocaleString('ko-KR')}
                  </span>
                </div>
                <UsageBar ratio={ratio} warn={warn} />
              </div>
            );
          })}
        </div>

        {/* 최근 소비 패턴 */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-2">
          <p className="text-sm font-bold text-gray-900 mb-1">최근 소비 패턴</p>
          {mockPatterns.map((pattern, i) => (
            <div key={i} className="flex items-start gap-2">
              <AlertCircle size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 leading-relaxed">{pattern}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 추천 챌린지 ── */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">AI 추천 챌린지</p>
        {CHALLENGES.map(({ id, icon, name, tag, desc }) => {
          const selected = selectedId === id;
          return (
            <button
              key={id}
              onClick={() => setSelectedId(id)}
              className="w-full text-left bg-white rounded-3xl border shadow-sm px-5 py-4 flex gap-3 transition-all active:scale-[0.98]"
              style={{ borderColor: selected ? '#1CD1A1' : '#F4F4F4' }}
            >
              <span style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0 }}>{icon}</span>
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900">{name}</p>
                  <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{tag}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
              <div className="flex-shrink-0 mt-0.5">
                {selected
                  ? <CheckCircle2 size={20} className="text-[#1CD1A1]" />
                  : <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                }
              </div>
            </button>
          );
        })}
      </div>

      {/* 챌린지 시작 버튼 */}
      <button
        disabled={!selectedId}
        className="bg-[#1CD1A1] rounded-4xl flex items-center justify-center transition-transform shadow-lg"
        style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${390 * 0.85}px`,
          height: '48px',
          fontSize: '15px',
          opacity: selectedId ? 1 : 0.4,
        }}
      >
        <span className="text-white font-bold">챌린지 시작하기</span>
      </button>
    </div>
  );
}
