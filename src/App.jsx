import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
import CharacterSetupScreen from './components/CharacterSetupScreen';
import AttendanceCheckScreen from './components/AttendanceCheckScreen';
import TodayMissionScreen from './components/TodayMissionScreen';
import BudgetSetupScreen from './components/BudgetSetupScreen';
import BudgetGoalScreen from './components/BudgetGoalScreen';
import IncomeSetupScreen from './components/IncomeSetupScreen';
import MascotStatusScreen from './components/MascotStatusScreen';
import AttendanceScreen from './components/AttendanceScreen';
import BudgetScreen from './components/BudgetScreen';
import ReportScreen from './components/ReportScreen';
import AIReportScreen from './components/AIReportScreen';
import DirectInputScreen from './components/DirectInputScreen';
import AIAnalyzingScreen from './components/AIAnalyzingScreen';
import CharacterComingSoon from './components/CharacterComingSoon';

import { tempLogin } from './api/auth';
import {
  getExpenses,
  transformExpense,
  todayString,
  currentYearMonth,
} from './api/expenses';
// TODO: 백엔드 연동 후 아래 import 및 사용 제거
import { MOCK_YEARLY_EXPENSES } from './data/mockData';

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [tab, setTab] = useState('home');

  // 수입 리스트 화면 진입 출처 — 'budget'이면 예산 탭에서 수정하러 온 것 (완료/뒤로 시 예산 탭 복귀)
  const [incomeFrom, setIncomeFrom] = useState(null);

  // 목표 예산 (한 달 소비 계획 화면 입력값) — 예산 탭 저축 목표 계산에 사용
  const [budgetGoal, setBudgetGoal] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('delta_budget_goal')) || 0;
    } catch { return 0; }
  });

  useEffect(() => {
    localStorage.setItem('delta_budget_goal', JSON.stringify(budgetGoal));
  }, [budgetGoal]);

  const [budgetTotal, setBudgetTotal] = useState(() => {
    try {
      const saved = localStorage.getItem('delta_budget_total');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // 이번 달 전체 소비 내역 (API에서 로드)
  const [expenses, setExpenses] = useState([]);

  // 이번 달 총 지출액
  const spent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  // TODO: 백엔드 연동 후 제거 — 리포트용 더미 데이터 병합 (API expense_id와 겹치지 않는 9000번대)
  const reportExpenses = useMemo(() => {
    const apiIds = new Set(expenses.map(e => e.expense_id));
    const mockFiltered = MOCK_YEARLY_EXPENSES.filter(e => !apiIds.has(e.expense_id));
    return [...expenses, ...mockFiltered];
  }, [expenses]);

  // 오늘 소비 내역만 필터링 — 최신 저장 순(saved_at) 정렬
  const todayExpenses = useMemo(() => {
    const today = todayString();
    return expenses
      .filter(e => e.expense_date === today)
      .sort((a, b) => {
        if (a.saved_at && b.saved_at) return new Date(b.saved_at) - new Date(a.saved_at);
        if (a.saved_at) return -1;
        if (b.saved_at) return 1;
        return b.expense_id - a.expense_id;
      });
  }, [expenses]);

  // 캘린더용 날짜 → 금액 맵
  const calendarData = useMemo(() => {
    return expenses.reduce((map, e) => {
      map[e.expense_date] = (map[e.expense_date] || 0) + e.amount;
      return map;
    }, {});
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('delta_budget_total', JSON.stringify(budgetTotal));
  }, [budgetTotal]);

  // ─── API: 소비 내역 로드 (saved_at 보존 + 로컬 전용 항목 유지) ──────
  const loadExpenses = useCallback(async () => {
    if (!localStorage.getItem('delta_uuid')) return;
    try {
      const raw = await getExpenses(currentYearMonth());
      setExpenses(prev => {
        // 기존 항목의 saved_at을 expense_id 기준으로 보존
        const savedAtMap = {};
        prev.forEach(e => { if (e.saved_at) savedAtMap[e.expense_id] = e.saved_at; });

        const apiItems = raw.map(e => {
          const item = transformExpense(e);
          if (savedAtMap[item.expense_id]) item.saved_at = savedAtMap[item.expense_id];
          return item;
        });

        // API에 없는 로컬 전용 항목(스캔 결과 등) 보존
        const apiIds = new Set(apiItems.map(i => i.expense_id));
        const localOnly = prev.filter(e => e.saved_at && !apiIds.has(e.expense_id));

        return [...apiItems, ...localOnly];
      });
    } catch (err) {
      console.error('[loadExpenses]', err);
    }
  }, []);

  // home 화면 진입 시마다 새로고침
  useEffect(() => {
    if (screen === 'home') loadExpenses();
  }, [screen, loadExpenses]);

  // ─── API: 임시 로그인 ───────────────────────────────────────────
  // TODO: 백엔드 연동 시 로컬 fallback 제거 (현재 서버 미가동으로 임시 처리)
  async function handleTempLogin() {
    try {
      const data = await tempLogin();
      localStorage.setItem('delta_uuid', data.uuid);
    } catch (err) {
      console.warn('[tempLogin] API 실패 — 로컬 임시 UUID로 진행:', err.message);
      localStorage.setItem('delta_uuid', `local-${crypto.randomUUID()}`);
    }
    setScreen('characterSetup'); // 첫 로그인: 캐릭터 꾸미기부터
  }

  // 스플래시 완료: UUID 있으면 home, 없으면 login
  function handleSplashDone() {
    if (localStorage.getItem('delta_uuid')) {
      setScreen('home');
    } else {
      setScreen('login');
    }
  }

  // DirectInputScreen에서 저장 완료 후 호출 (옵티미스틱 업데이트 + 리프레시)
  function addExpenses(newExpenses) {
    setExpenses(prev => [...prev, ...newExpenses]);
    loadExpenses(); // 백그라운드에서 API 동기화
  }

  // ─── 토스트 ─────────────────────────────────────────────────────
  const [scanToast, setScanToast] = useState(false);
  const [scanToastFading, setScanToastFading] = useState(false);

  function showScanToast() {
    setScanToast(true);
    setScanToastFading(false);
    setTimeout(() => {
      setScanToastFading(true);
      setTimeout(() => setScanToast(false), 300);
    }, 1700);
  }

  const scrollable = ['home', 'login', 'characterSetup', 'attendanceCheck', 'todayMission', 'incomeSetup', 'budgetGoal', 'budgetSetup', 'aiGuide', 'result', 'directInput'].includes(screen);
  const fullscreen = screen === 'aiAnalyzing'; // 패딩 없이 꽉 채우는 화면
  const scrollRef = useRef(null);

  useEffect(() => {
    // 새 콘텐츠가 레이아웃된 뒤 스크롤 리셋 (requestAnimationFrame으로 타이밍 보장)
    const id = requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    });
    return () => cancelAnimationFrame(id);
  }, [screen, tab]);

  return (
    <div className="bg-white min-h-screen">
    <div className="bg-[#FFFFFF] relative mx-auto overflow-hidden" style={{ width: '100%', maxWidth: '390px', minHeight: '100svh' }}>
      {/* 배경 그라데이션 장식 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#FFFFFF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* 헤더 고정 */}
      {screen === 'home' && tab === 'home' && (
        <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: 'min(100vw, 390px)', zIndex: 20, paddingTop: 'env(safe-area-inset-top, 44px)' }}>
          <TopBar />
        </div>
      )}

      {/* 스캔 완료 토스트 */}
      {scanToast && (
        <div
          className={`fixed z-30 flex items-center justify-center gap-2 ${scanToastFading ? 'toast-exit' : 'toast-enter'}`}
          style={{
            bottom: 90,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 196,
            height: 38,
            backgroundColor: 'rgba(28,209,161,0.1)',
            border: '1px solid rgba(28,209,161,0.3)',
            borderRadius: 20,
            whiteSpace: 'nowrap',
          }}
        >
          <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <path d="M12.375 20L8.825 16.45L10.225 15.05L12.35 17.175L16.6 12.925L18 14.35L12.375 20ZM6.3 16.75L8.525 18.975C8.44167 18.975 8.35433 18.9793 8.263 18.988C8.17167 18.9967 8.084 19.0007 8 19C5.76667 19 3.875 18.225 2.325 16.675C0.775 15.125 0 13.2333 0 11C0 8.85 0.721 6.80833 2.163 4.875C3.605 2.94167 5.55067 1.31667 8 0V3.3C8 3.86667 8.196 4.34167 8.588 4.725C8.98 5.10833 9.459 5.3 10.025 5.3C10.325 5.3 10.6043 5.23767 10.863 5.113C11.1217 4.98833 11.3507 4.80067 11.55 4.55L12 4C13.2333 4.7 14.2083 5.675 14.925 6.925C15.6417 8.175 16 9.53333 16 11H14C14 10.5833 13.9583 10.179 13.875 9.787C13.7917 9.395 13.675 9.01167 13.525 8.637C13.375 8.26233 13.1877 7.90833 12.963 7.575C12.7383 7.24167 12.484 6.93333 12.2 6.65C11.8667 6.86667 11.5167 7.029 11.15 7.137C10.7833 7.245 10.4083 7.29933 10.025 7.3C8.99167 7.3 8.09567 6.95833 7.337 6.275C6.57833 5.59167 6.14133 4.75 6.026 3.75C4.72533 4.85 3.729 6.021 3.037 7.263C2.345 8.505 1.99933 9.75067 2 11C2 12.3667 2.40433 13.575 3.213 14.625C4.02167 15.675 5.05067 16.3833 6.3 16.75Z" fill="#555555"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 400, fontFamily: 'Pretendard, sans-serif', color: '#000000' }}>
            오늘의 소비기록 작성 완료!
          </span>
        </div>
      )}

      {/* 네비바 뒤 흰 배경 */}
      {screen === 'home' && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 36, backgroundColor: 'white', zIndex: 10 }} />
      )}

      {/* 하단 네비게이션 */}
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
          paddingTop: (screen === 'home' && tab === 'home')
            ? 'calc(env(safe-area-inset-top, 54px) + 74px)'
            : fullscreen
            ? '0px'
            : 'calc(env(safe-area-inset-top, 0px) + 20px)',
          paddingBottom: screen === 'home' ? '72px' : '0px',
        }}
      >
        {screen === 'splash' && (
          <SplashScreen onDone={handleSplashDone} />
        )}
        {screen === 'onboarding' && (
          <OnboardingScreen onNext={() => setScreen('login')} />
        )}
        {screen === 'login' && (
          <LoginScreen
            onLogin={handleTempLogin}
            onTempLogin={handleTempLogin}
          />
        )}
        {screen === 'characterSetup' && (
          <CharacterSetupScreen onNext={() => setScreen('attendanceCheck')} />
        )}
        {screen === 'attendanceCheck' && (
          <AttendanceCheckScreen onNext={() => setScreen('todayMission')} />
        )}
        {screen === 'todayMission' && (
          <TodayMissionScreen onNext={() => setScreen('incomeSetup')} />
        )}
        {screen === 'incomeSetup' && (
          <IncomeSetupScreen
            onNext={() => {
              if (incomeFrom === 'budget') {
                setIncomeFrom(null);
                setTab('budget');
                setScreen('home');
              } else {
                setScreen('budgetGoal'); // 온보딩 플로우
              }
            }}
            onBack={() => {
              if (incomeFrom === 'budget') {
                setIncomeFrom(null);
                setTab('budget');
                setScreen('home');
              } else {
                setScreen('todayMission');
              }
            }}
          />
        )}
        {screen === 'budgetGoal' && (
          <BudgetGoalScreen
            onNext={(amount) => { setBudgetGoal(amount); setScreen('budgetSetup'); }}
            onBack={() => setScreen('incomeSetup')}
            initialBudget={budgetGoal}
          />
        )}
        {screen === 'budgetSetup' && (
          <BudgetSetupScreen
            onComplete={(total) => { setBudgetTotal(total); setScreen('home'); }}
            onBack={() => setScreen('budgetGoal')}
            initialBudget={budgetGoal}
          />
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
            onUpload={() => setScreen('aiAnalyzing')}
          />
        )}
        {screen === 'aiAnalyzing' && (
          <AIAnalyzingScreen
            onComplete={() => setScreen('result')}
            // progress={externalProgress} ← 백엔드 연동 시 여기에 진행률 전달
          />
        )}
        {screen === 'result' && (
          <ScanResultScreen
            onBack={() => setScreen('aiScan')}
            onHome={(scanned) => {
              setExpenses(prev => [...prev, ...scanned]);
              setScreen('home');
              showScanToast();
            }}
          />
        )}
        {screen === 'directInput' && (
          <DirectInputScreen
            onBack={() => setScreen('home')}
            onSave={(exps) => addExpenses(exps)}
            onHome={() => setScreen('home')}
            allExpenses={expenses}
          />
        )}
        {screen === 'home' && tab === 'home' && (
          <div className="flex flex-col items-center gap-[25px]">
            <BudgetCard totalAmount={budgetTotal} spent={spent} />
            <CalendarView calendarData={calendarData} />
            <QuickActions onScan={() => setScreen('aiScan')} onDirectInput={() => setScreen('directInput')} />
            <TodayExpenses expenses={todayExpenses} />
            <WeeklyGoal />
          </div>
        )}
        {screen === 'home' && tab === 'report' && (
          <ReportScreen expenses={reportExpenses} budgetTotal={budgetTotal} spent={spent} onGuidePress={() => setScreen('aiGuide')} />
        )}
        {screen === 'home' && tab === 'budget' && (
          <BudgetScreen onEditIncome={() => { setIncomeFrom('budget'); setScreen('incomeSetup'); }} />
        )}
        {screen === 'home' && tab === 'character' && (
          <CharacterComingSoon />
        )}
      </div>
    </div>
    </div>
  );
}
