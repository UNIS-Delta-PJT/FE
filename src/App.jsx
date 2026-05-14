import { useState } from 'react';
import TopBar from './components/TopBar';
import BudgetCard from './components/BudgetCard';
import CalendarView from './components/CalendarView';
import QuickActions from './components/QuickActions';
import TodayExpenses from './components/TodayExpenses';
import WeeklyGoal from './components/WeeklyGoal';
import BottomNav from './components/BottomNav';
import AIScanScreen from './components/AIScanScreen';

export default function App() {
  const [showAIScan, setShowAIScan] = useState(false);

  return (
    <div className="flex flex-col bg-[#FFFFFF] relative mx-auto" style={{ width: '390px', minHeight: '844px', paddingTop: 'env(safe-area-inset-top, 54px)' }}>
      {/* 배경 그라데이션 장식 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#2ECC71]/10 rounded-full blur-3xl pointer-events-none" />

      {/* 스크롤 가능한 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto pb-4">
        {showAIScan ? (
          <AIScanScreen onBack={() => setShowAIScan(false)} />
        ) : (
          <>
            <TopBar />
            <div className="flex flex-col gap-[25px]">
              <BudgetCard />
              <CalendarView />
              <QuickActions onScan={() => setShowAIScan(true)} />
              <TodayExpenses />
              <WeeklyGoal />
            </div>
          </>
        )}
      </div>

      {/* 하단 고정 네비게이션 */}
      {!showAIScan && <BottomNav />}
    </div>
  );
}
