import TopBar from './components/TopBar';
import BudgetCard from './components/BudgetCard';
import CalendarView from './components/CalendarView';
import QuickActions from './components/QuickActions';
import TodayExpenses from './components/TodayExpenses';
import WeeklyGoal from './components/WeeklyGoal';
import BottomNav from './components/BottomNav';

export default function App() {
  return (
    <div className="flex flex-col min-h-svh w-full sm:max-w-sm sm:mx-auto bg-[#FFFFFF] relative">
      {/* 배경 그라데이션 장식 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#2ECC71]/10 rounded-full blur-3xl pointer-events-none" />

      {/* 스크롤 가능한 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto pb-4">
        <TopBar />
        <div className="flex flex-col gap-[25px]">
          <BudgetCard />
          <CalendarView />
          <QuickActions />
          <TodayExpenses />
          <WeeklyGoal />
        </div>
      </div>

      {/* 하단 고정 네비게이션 */}
      <BottomNav />
    </div>
  );
}
