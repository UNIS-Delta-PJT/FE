import { useState } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { mockWeeklyGoals } from '../data/mockData';

export default function WeeklyGoal({ onAIGuide }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="mx-4" style={{ marginBottom: '50px' }}>
      <div className="rounded-2xl" style={{ backgroundColor: '#2ECC71', height: '160px' }} />
      <div className="flex justify-center gap-2" style={{ marginTop: '8px', marginBottom: '12px' }}>
        {mockWeeklyGoals.map((_, i) => (
          <div
            key={i}
            onClick={() => setActiveIndex(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === activeIndex ? 16 : 6,
              height: 6,
              backgroundColor: i === activeIndex ? '#2ECC71' : '#e5e7eb',
            }}
          />
        ))}
      </div>

      {/* AI 가이드 진입 버튼 */}
      <button
        onClick={onAIGuide}
        className="w-full flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3 active:scale-[0.98] transition-transform"
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
