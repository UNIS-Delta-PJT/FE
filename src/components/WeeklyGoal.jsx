import { useState } from 'react';
import { mockWeeklyGoals } from '../data/mockData';

export default function WeeklyGoal() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="mx-4" style={{ marginBottom: '50px' }}>
      <div className="rounded-2xl" style={{ backgroundColor: '#2ECC71', height: '160px' }} />
      <div className="flex justify-center gap-2" style={{ marginTop: '8px', marginBottom: '5px' }}>
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
    </div>
  );
}
