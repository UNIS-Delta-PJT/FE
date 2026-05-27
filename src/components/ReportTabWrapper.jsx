import { useState } from 'react';
import ReportScreen from './ReportScreen';
import AIReportScreen from './AIReportScreen';

export default function ReportTabWrapper({ expenses, budgetTotal, spent }) {
  const [activeTab, setActiveTab] = useState('stats');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

      {/* ── 소비 통계 | AI 피드백 탭 스위처 ─────────────────────────── */}
      <div
        style={{
          width: 353,
          height: 48,
          borderRadius: 9999,
          backgroundColor: 'rgb(241, 245, 249)',
          display: 'flex',
          alignItems: 'center',
          padding: 6,
          boxSizing: 'border-box',
          marginBottom: 24,
        }}
      >
        {[
          { key: 'stats', label: '소비 통계' },
          { key: 'ai',    label: 'AI 피드백' },
        ].map(({ key, label }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                width: 170,
                height: 36,
                borderRadius: 9999,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Pretendard, sans-serif',
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? 'rgb(0, 109, 55)' : 'rgb(0, 0, 0)',
                backgroundColor: active ? 'rgb(255, 255, 255)' : 'transparent',
                flexShrink: 0,
                transition: 'background-color 0.18s, color 0.18s',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── 콘텐츠 ────────────────────────────────────────────────────── */}
      {activeTab === 'stats'
        ? <ReportScreen expenses={expenses} budgetTotal={budgetTotal} spent={spent} />
        : <AIReportScreen expenses={expenses} />
      }
    </div>
  );
}
