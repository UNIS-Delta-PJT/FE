import { useState } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { mockWeeklyGoals } from '../data/mockData';

function getCardContent(card) {
  const { label, total_amount, spent, daysLeft } = card;
  const isMonthly = label === '이번 달';
  const cardLabel = isMonthly ? '월간 목표' : '주간 목표';
  const totalDays = isMonthly ? 30 : 7;
  const daysElapsed = totalDays - daysLeft;
  const isOver = spent > total_amount;
  const remaining = total_amount - spent;

  if (isOver) {
    const over = (spent - total_amount).toLocaleString('ko-KR');
    return { cardLabel, title: label + ' 결과', body: `예산을 ${over}원 초과했어요.\n이번엔 더 잘 할 수 있어요!` };
  }
  if (daysLeft === 0) {
    return { cardLabel, title: label + ' 달성!', body: `예산을 잘 지켜냈어요!\n${remaining.toLocaleString('ko-KR')}원이 남았어요` };
  }
  return {
    cardLabel,
    title: '알뜰 소비 챌린지',
    body: `벌써 ${daysElapsed}일째 예산을 잘 지키고 있어요!\n${daysLeft}일만 더 유지하면 보너스 코인을 받아요`,
  };
}

export default function WeeklyGoal({ onAIGuide }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const cards = mockWeeklyGoals;
  const { cardLabel, title, body } = getCardContent(cards[activeIndex]);

  function handleTouchStart(e) {
    setTouchStartX(e.touches[0].clientX);
  }

  function handleTouchEnd(e) {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 50 && activeIndex < cards.length - 1) setActiveIndex(i => i + 1);
    else if (diff < -50 && activeIndex > 0) setActiveIndex(i => i - 1);
    setTouchStartX(null);
  }

  return (
    <div style={{ width: 353, marginBottom: '50px' }}>
      {/* 카드 */}
      <div
        className="rounded-2xl relative overflow-hidden select-none"
        style={{ backgroundColor: '#2ECC71', height: '160px', padding: '20px 20px 16px' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.4px' }}>
          {cardLabel}
        </p>
        <p style={{ color: '#fff', fontSize: '20px', fontWeight: 900, marginTop: '4px' }}>
          {title}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.92)', fontSize: '13px', marginTop: '12px', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
          {body}
        </p>

        {/* DELTA 워터마크 */}
        <div
          className="absolute flex items-center justify-center rounded-xl font-black"
          style={{ width: 64, height: 64, backgroundColor: 'rgba(255,255,255,0.18)', bottom: -10, right: -6, fontSize: '30px', color: 'rgba(255,255,255,0.7)', pointerEvents: 'none' }}
        >
          D
        </div>

        {/* Dots */}
        <div className="absolute flex gap-1.5" style={{ bottom: 16, left: 20 }}>
          {cards.map((_, i) => (
            <div
              key={i}
              onClick={() => setActiveIndex(i)}
              className="rounded-full cursor-pointer transition-all duration-300"
              style={{ width: i === activeIndex ? 16 : 6, height: 6, backgroundColor: 'white', opacity: i === activeIndex ? 1 : 0.4 }}
            />
          ))}
        </div>
      </div>

      {/* AI 가이드 버튼 */}
      <button
        onClick={onAIGuide}
        className="w-full flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3 active:scale-[0.98] transition-transform"
        style={{ marginTop: '12px' }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#2ECC71]" />
          <span className="text-sm font-bold text-gray-700">AI 가이드</span>
          <span className="text-xs text-gray-400">소비 분석 · 챌린지 선택</span>
        </div>
        <ChevronRight size={16} className="text-gray-300" />
      </button>
    </div>
  );
}
