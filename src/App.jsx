import { useState, useMemo, useEffect, useRef } from 'react';
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
import BudgetScreen from './components/BudgetScreen';

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [tab, setTab] = useState('home');
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
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [screen, tab]);

  return (
    <div className="bg-white min-h-screen">
    <div className="bg-[#FFFFFF] relative mx-auto overflow-hidden" style={{ width: '390px', height: '844px', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
      {/* 배경 그라데이션 장식 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#FFFFFF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* 헤더 고정 */}
      {screen === 'home' && tab === 'home' && (
        <div style={{ position: 'fixed', top: 0, width: '390px', left: '50%', transform: 'translateX(-50%)', zIndex: 20, paddingTop: 'env(safe-area-inset-top, 54px)' }}>
          <TopBar />
        </div>
      )}

      {/* 네비바 뒤 흰 배경 (절반 높이) */}
      {screen === 'home' && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 36, backgroundColor: 'white', zIndex: 10 }} />
      )}

      {/* 하단 고정 네비게이션 */}
      {screen === 'home' && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20 }}>
          <BottomNav activeTab={tab} onTabChange={setTab} />
        </div>
      )}

      {/* 콘텐츠 영역 */}
      <div
        ref={scrollRef}
        className={`absolute inset-0 ${scrollable ? 'overflow-y-auto' : 'overflow-hidden'}`}
        style={{
          paddingTop: screen === 'home' && tab === 'home' ? 'calc(env(safe-area-inset-top, 54px) + 74px)' : 'calc(env(safe-area-inset-top, 0px) + 20px)',
          paddingBottom: screen === 'home' ? '90px' : '0px',
        }}
      >
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
        {screen === 'home' && tab === 'home' && (
          <div className="flex flex-col items-center gap-[25px] pb-4">
            <BudgetCard totalAmount={budgetTotal} spent={spent} />
            <CalendarView />
            <QuickActions onScan={() => setScreen('aiScan')} />
            <TodayExpenses expenses={expenses} />
            <WeeklyGoal onAIGuide={() => setScreen('aiGuide')} />
          </div>
        )}
        {screen === 'home' && tab === 'budget' && (
          <BudgetScreen />
        )}
      </div>
    </div>
    </div>
  );
}
