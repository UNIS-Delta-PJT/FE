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
          display: 'flex',
          backgroundColor: '#F0F0F0',
          borderRadius: 999,
          padding: 3,
          marginBottom: 20,
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
                padding: '8px 22px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Pretendard, sans-serif',
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? '#1A1A1A' : '#888888',
                backgroundColor: active ? '#FFFFFF' : 'transparent',
                boxShadow: active ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                transition: 'all 0.15s ease',
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
