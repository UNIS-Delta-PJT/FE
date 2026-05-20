import { useState, useMemo, useEffect } from 'react';
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
import IncomeSetupScreen from './components/IncomeSetupScreen';
import MascotStatusScreen from './components/MascotStatusScreen';
import AttendanceScreen from './components/AttendanceScreen';

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [budgetTotal, setBudgetTotal] = useState(() => {
    try {
      const saved = localStorage.getItem('delta_budget_total');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem('delta_expenses');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const spent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  useEffect(() => {
    localStorage.setItem('delta_budget_total', JSON.stringify(budgetTotal));
  }, [budgetTotal]);

  useEffect(() => {
    localStorage.setItem('delta_expenses', JSON.stringify(expenses));
  }, [expenses]);

  function addExpenses(newExpenses) {
    setExpenses(prev => [...prev, ...newExpenses]);
  }

  const scrollable = ['home', 'budgetSetup', 'aiGuide', 'result'].includes(screen);

  return (
    <div className="flex flex-col bg-[#FFFFFF] relative mx-auto overflow-hidden" style={{ width: '390px', height: '844px', paddingTop: 'env(safe-area-inset-top, 54px)' }}>
      {/* 배경 그라데이션 장식 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#2ECC71]/10 rounded-full blur-3xl pointer-events-none" />

      {/* 헤더 고정 */}
      {screen === 'home' && <TopBar />}

      {/* 콘텐츠 영역 */}
      <div className={`flex-1 ${scrollable ? 'overflow-y-auto' : 'overflow-hidden'} pb-4`}>
        {screen === 'splash' && (
          <SplashScreen onDone={() => setScreen('onboarding')} />
        )}
        {screen === 'onboarding' && (
          <OnboardingScreen onNext={() => setScreen('login')} />
        )}
        {screen === 'login' && (
          <LoginScreen onLogin={() => setScreen('incomeSetup')} />
        )}
        {screen === 'incomeSetup' && (
          <IncomeSetupScreen onNext={() => setScreen('budgetSetup')} onBack={() => setScreen('login')} />
        )}
        {screen === 'budgetSetup' && (
          <BudgetSetupScreen onComplete={(total) => { setBudgetTotal(total); setScreen('home'); }} onBack={() => setScreen('incomeSetup')} />
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
            onHome={(scanned) => { addExpenses(scanned); setScreen('home'); }}
          />
        )}
        {screen === 'home' && (
          <div className="flex flex-col gap-[25px]">
            <BudgetCard totalAmount={budgetTotal} spent={spent} />
            <CalendarView />
            <QuickActions onScan={() => setScreen('aiScan')} />
            <TodayExpenses expenses={expenses} />
            <WeeklyGoal onAIGuide={() => setScreen('aiGuide')} />
          </div>
        )}
      </div>

      {/* 하단 고정 네비게이션 */}
      {screen === 'home' && <BottomNav />}
    </div>
  );
}
