import { useState } from 'react';
import TopBar from './components/TopBar';
import BudgetCard from './components/BudgetCard';
import CalendarView from './components/CalendarView';
import QuickActions from './components/QuickActions';
import TodayExpenses from './components/TodayExpenses';
import WeeklyGoal from './components/WeeklyGoal';
import BottomNav from './components/BottomNav';
import AIScanScreen from './components/AIScanScreen';
import ScanResultScreen from './components/ScanResultScreen';
import AIGuideScreen from './components/AIGuideScreen';
import SplashScreen from './components/SplashScreen';
import OnboardingScreen from './components/OnboardingScreen';
import LoginScreen from './components/LoginScreen';
import BudgetSetupScreen from './components/BudgetSetupScreen';
import MascotStatusScreen from './components/MascotStatusScreen';
import AttendanceScreen from './components/AttendanceScreen';

export default function App() {
  const [screen, setScreen] = useState('splash');

  return (
    <div className="flex flex-col bg-[#FFFFFF] relative mx-auto" style={{ width: '390px', minHeight: '844px', paddingTop: 'env(safe-area-inset-top, 54px)' }}>
      {/* 배경 그라데이션 장식 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#2ECC71]/10 rounded-full blur-3xl pointer-events-none" />

      {/* 스크롤 가능한 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto pb-4">
        {screen === 'splash' && (
          <SplashScreen onDone={() => setScreen('onboarding')} />
        )}
        {screen === 'onboarding' && (
          <OnboardingScreen onNext={() => setScreen('login')} />
        )}
        {screen === 'login' && (
          <LoginScreen onLogin={() => setScreen('budgetSetup')} />
        )}
        {screen === 'budgetSetup' && (
          <BudgetSetupScreen onComplete={() => setScreen('home')} />
        )}
        {screen === 'mascotStatus' && (
          <MascotStatusScreen onNext={() => setScreen('attendance')} />
        )}
        {screen === 'attendance' && (
          <AttendanceScreen onNext={() => setScreen('home')} />
        )}
        {screen === 'aiGuide' && (
          <AIGuideScreen onBack={() => setScreen('home')} />
        )}
        {screen === 'aiScan' && (
          <AIScanScreen
            onBack={() => setScreen('home')}
            onUpload={() => setScreen('result')}
          />
        )}
        {screen === 'result' && (
          <ScanResultScreen
            onBack={() => setScreen('aiScan')}
            onHome={() => setScreen('home')}
          />
        )}
        {screen === 'home' && (
          <>
            <TopBar />
            <div className="flex flex-col gap-[25px]">
              <BudgetCard />
              <CalendarView />
              <QuickActions onScan={() => setScreen('aiScan')} />
              <TodayExpenses />
              <WeeklyGoal onAIGuide={() => setScreen('aiGuide')} />
            </div>
          </>
        )}
      </div>

      {/* 하단 고정 네비게이션 */}
      {screen === 'home' && <BottomNav />}
    </div>
  );
}
