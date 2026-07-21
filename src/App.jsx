import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import HomeScreen from './components/HomeScreen';
import BottomNav from './components/BottomNav';
import AIScanScreen from './components/AIScanScreen';
import ScanResultScreen from './components/ScanResultScreen';
import AIGuideScreen from './components/AIGuideScreen';
import SplashScreen from './components/SplashScreen';
import OnboardingScreen from './components/OnboardingScreen';
import LoginScreen from './components/LoginScreen';
import CharacterSetupScreen from './components/CharacterSetupScreen';
import AttendanceCheckScreen, { hasAttendedToday } from './components/AttendanceCheckScreen';
import TodayMissionScreen, { DICE_ROLLED_KEY } from './components/TodayMissionScreen';
import AdScreen from './components/AdScreen';
import CategoryExpenseScreen from './components/CategoryExpenseScreen';
import SettingsScreen from './components/SettingsScreen';
import GroupComposeScreen from './components/GroupComposeScreen';
import DiceRollScreen from './components/DiceRollScreen';
import BudgetSetupScreen from './components/BudgetSetupScreen';
import BudgetGoalScreen from './components/BudgetGoalScreen';
import IncomeSetupScreen from './components/IncomeSetupScreen';
import BudgetScreen from './components/BudgetScreen';
import ReportScreen from './components/ReportScreen';
import AIReportScreen from './components/AIReportScreen';
import DirectInputScreen from './components/DirectInputScreen';
import AIAnalyzingScreen from './components/AIAnalyzingScreen';
import CharacterMapScreen from './components/CharacterMapScreen';
import StoreScreen from './components/StoreScreen';
import CoinShopScreen from './components/CoinShopScreen';

import { tempLogin, completeKakaoLogin, logout as apiLogout } from './api/auth';
import { updateSavings, getFinanceSummary } from './api/finance';
import { getMe, ENUM_TO_BODY_COLOR, ENUM_TO_EYE_SHAPE } from './api/user';
import { joinGroupByInviteCode } from './api/group';
import { claimAdReward, AD_REWARD_TYPES } from './api/ads';
import {
  getDailyExpenses,
  transformExpense,
  todayString,
} from './api/expenses';

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [tab, setTab] = useState('home');

  // 수입 리스트 화면 진입 출처 — 'budget'이면 예산 탭에서 수정하러 온 것 (완료/뒤로 시 예산 탭 복귀)
  const [incomeFrom, setIncomeFrom] = useState(null);
  // 목표 예산/카테고리 설정 화면 진입 출처 — 'budget'이면 예산 탭에서 수정 모드 (버튼 '저장', 완료 시 탭 복귀)
  const [budgetFrom, setBudgetFrom] = useState(null);
  // 광고 종료 후 복귀 위치 — 'home'(온보딩) | 'budget'(예산 수정 후) | 'dice'(주사위)
  const [adReturn, setAdReturn] = useState('home');
  // 설정/출석체크 진입 출처 — 홈 헤더 아이콘에서 진입 시 홈으로 복귀
  const [settingsFrom, setSettingsFrom] = useState('budget');
  const [attendFrom, setAttendFrom] = useState('onboarding');
  // 오늘의 미션 진입 출처 — 홈 헤더 아이콘에서 진입 시 홈으로 복귀
  const [missionFrom, setMissionFrom] = useState('onboarding');

  // 예산 탭으로 복귀
  function backToBudgetTab() {
    setBudgetFrom(null);
    setTab('budget');
    setScreen('home');
  }

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

  // 소비 내역 — 명세에 일별 조회만 있어 오늘 항목 위주로 채워짐 (리포트/캘린더용, 제한적)
  const [expenses, setExpenses] = useState([]);

  // 이번 달 총 지출액 (리포트 화면용 — 로컬에 쌓인 항목 기준이라 부정확할 수 있음)
  const spent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  // 홈 화면 예산 요약 — 명세 GET /finances/summary (서버가 계산한 정확한 이번 달 총 지출/잔여예산)
  const [financeSummary, setFinanceSummary] = useState(null);
  const loadSummary = useCallback(async () => {
    if (!localStorage.getItem('delta_uuid') && !localStorage.getItem('delta_access_token')) return;
    try {
      setFinanceSummary(await getFinanceSummary());
    } catch (err) {
      console.warn('[loadSummary] API 실패 — 로컬 계산값 유지:', err.message);
    }
  }, []);

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

  useEffect(() => {
    localStorage.setItem('delta_budget_total', JSON.stringify(budgetTotal));
  }, [budgetTotal]);

  // ─── 초대 코드 보관 및 그룹 참여 API 전송 ───────────────────────
  useEffect(() => {
    // 1. 링크 접속 시 ?invite=HM2JXX 코드가 있으면 localStorage에 보관
    const inviteCode = new URLSearchParams(window.location.search).get('invite');
    if (inviteCode) {
      localStorage.setItem('delta_pending_invite', inviteCode);
      window.history.replaceState({}, '', window.location.pathname); // URL 깔끔하게 정리
    }
  }, []);

  // 2. 보관된 초대 코드를 백엔드로 보내는 함수 (POST /api/v1/groups/join, 로그인 필요)
  const processPendingInvite = useCallback(async () => {
    const pendingInvite = localStorage.getItem('delta_pending_invite');
    if (!pendingInvite) return; // 보관된 코드가 없으면 실행 안 함
    // 로그인 전이면 대기 — 로그인 완료 후 home 진입 시 다시 시도됨
    if (!localStorage.getItem('delta_access_token') && !localStorage.getItem('delta_uuid')) return;

    try {
      await joinGroupByInviteCode(pendingInvite);
      alert('그룹 참여에 성공했습니다!');
      localStorage.removeItem('delta_pending_invite');
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === 'ALREADY_JOINED') {
        // 이미 가입된 그룹 — 정상 흐름으로 간주하고 재시도하지 않음
        localStorage.removeItem('delta_pending_invite');
      } else if (code === 'GROUP_NOT_FOUND' || code === 'GROUP_LIMIT_EXCEEDED') {
        alert(err.response?.data?.message || '그룹 참여에 실패했습니다.');
        localStorage.removeItem('delta_pending_invite');
      } else {
        // 네트워크 오류 등은 코드를 보관해 다음 home 진입 시 재시도
        console.warn('[invite] 그룹 참여 실패 — 다음 진입 시 재시도:', err.message);
      }
    }
  }, []);

  // ─── API: 소비 내역 로드 (saved_at 보존 + 로컬 전용 항목 유지) ──────
  // 명세에는 일별 조회만 있어 오늘 내역만 서버와 동기화, 과거 내역은 로컬 유지
  const loadExpenses = useCallback(async () => {
    if (!localStorage.getItem('delta_uuid') && !localStorage.getItem('delta_access_token')) return;
    try {
      const today = todayString();
      const data = await getDailyExpenses(today);
      setExpenses(prev => {
        // 기존 항목의 saved_at을 expense_id 기준으로 보존
        const savedAtMap = {};
        prev.forEach(e => { if (e.saved_at) savedAtMap[e.expense_id] = e.saved_at; });

        const apiItems = (data?.expenses ?? []).map(e => {
          const item = transformExpense(e);
          if (savedAtMap[item.expense_id]) item.saved_at = savedAtMap[item.expense_id];
          return item;
        });

        // 오늘이 아닌 항목과, API에 없는 오늘의 로컬 전용 항목(스캔 결과 등)은 보존
        const apiIds = new Set(apiItems.map(i => i.expense_id));
        const keep = prev.filter(e =>
          e.expense_date !== today || (e.saved_at && !apiIds.has(e.expense_id))
        );

        return [...keep, ...apiItems];
      });
    } catch (err) {
      // 서버 라우트 미배포(404) 등 — 로컬 데이터로 계속 동작
      console.warn('[loadExpenses] API 실패 — 로컬 데이터 유지:', err.message);
    }
  }, []);

  // ─── API: 내 정보 로드 (GET /users/me) — 다른 화면들이 참조하는 localStorage 캐시에 동기화 ──
  // coins/character/mapPosition/streak는 여러 화면이 localStorage로 직접 읽으므로,
  // 여기서 서버 값을 그 키들에 그대로 써주는 방식으로 화면 코드 변경 없이 전체 반영시킴
  const loadMe = useCallback(async () => {
    if (!localStorage.getItem('delta_uuid') && !localStorage.getItem('delta_access_token')) return;
    try {
      const data = await getMe();
      if (typeof data.userId === 'number') {
        // 그룹 화면에서 구성원 목록 중 '나'를 가려내는 데 사용 (명세: GET /groups)
        localStorage.setItem('delta_user_id', JSON.stringify(data.userId));
      }
      if (typeof data.coinBalance === 'number') {
        localStorage.setItem('delta_coins', JSON.stringify(data.coinBalance));
      }
      if (typeof data.mapPosition === 'number') {
        localStorage.setItem('delta_map_position', JSON.stringify(data.mapPosition));
      }
      if (data.character) {
        if (data.character.nickname) localStorage.setItem('delta_nickname', data.character.nickname);
        if (data.character.bodyColor) {
          localStorage.setItem('delta_character_color', ENUM_TO_BODY_COLOR[data.character.bodyColor] || '#FFFFFF');
        }
        if (data.character.eyeShape) {
          localStorage.setItem('delta_character_eyes', ENUM_TO_EYE_SHAPE[data.character.eyeShape] || 'round');
        }
      }
      if (data.notification && typeof data.notification.isNightPushDisabled === 'boolean') {
        localStorage.setItem('delta_dnd_night', JSON.stringify(data.notification.isNightPushDisabled));
      }
    } catch (err) {
      // 서버 라우트 미배포(404) 등 — 로컬 데이터로 계속 동작
      console.warn('[loadMe] API 실패 — 로컬 데이터 유지:', err.message);
    }
  }, []);

  // home 화면 진입 시마다 새로고침
  useEffect(() => {
    if (screen === 'home') {
      loadExpenses();
      loadMe();
      loadSummary();
      processPendingInvite(); // 로그인 완료 후 보관된 초대 코드가 있으면 그룹 참여 시도
    }
  }, [screen, loadExpenses, loadMe, loadSummary, processPendingInvite]);

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
    loadMe();
    setScreen('characterSetup'); // 첫 로그인: 캐릭터 꾸미기부터
  }

  // ─── 카카오 로그인 리다이렉트 처리 (?code=인가코드) ────────────────
  // 진행 중이면 스플래시 완료 시 화면 전환을 이 플로우가 담당
  const kakaoLoginRef = useRef(new URLSearchParams(window.location.search).has('code'));
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) return;
    (async () => {
      try {
        const data = await completeKakaoLogin(code);
        loadMe();
        // 신규 유저는 캐릭터 꾸미기부터, 기존 유저는 홈으로
        setScreen(data?.isNewUser ? 'characterSetup' : 'home');
      } catch (err) {
        console.warn('[kakaoLogin] 실패 — 로그인 화면으로 이동:', err.message);
        setScreen('login');
      } finally {
        kakaoLoginRef.current = false;
        window.history.replaceState({}, '', '/'); // 인가코드 URL 정리
      }
    })();
  }, []);

  // 스플래시 완료: 로그인돼 있으면 home, 없으면 login
  // 오늘 첫 접속이면 출석체크 화면을 하루 1회 먼저 노출
  function handleSplashDone() {
    if (kakaoLoginRef.current) return; // 카카오 로그인 처리 중 — 완료 시 해당 플로우가 화면 전환
    if (localStorage.getItem('delta_uuid') || localStorage.getItem('delta_access_token')) {
      if (!hasAttendedToday()) {
        setAttendFrom('home');
        setScreen('attendanceCheck');
      } else {
        setScreen('home');
      }
    } else {
      setScreen('login');
    }
  }

  // DirectInputScreen에서 저장 완료 후 호출 (옵티미스틱 업데이트 + 리프레시)
  function addExpenses(newExpenses) {
    setExpenses(prev => [...prev, ...newExpenses]);
    loadExpenses(); // 백그라운드에서 API 동기화
    loadSummary(); // 남은 예산 카드도 최신화
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

  const scrollable = ['home', 'login', 'characterSetup', 'attendanceCheck', 'todayMission', 'incomeSetup', 'budgetGoal', 'budgetSetup', 'savingsGoal', 'aiGuide', 'result', 'directInput', 'categoryExpense', 'store'].includes(screen);
  // 하단 네비게이션이 유지되는 화면 (home + 리포트 상세)
  const showNav = screen === 'home' || screen === 'categoryExpense';
  const fullscreen = ['aiAnalyzing', 'categoryExpense', 'settings', 'attendanceCheck', 'todayMission', 'groupCompose', 'ad', 'store', 'coinShop'].includes(screen); // 패딩 없이 꽉 채우는 화면 (상단이 화면 끝에 밀착)
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
      {showNav && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 36, backgroundColor: 'white', zIndex: 10 }} />
      )}

      {/* 하단 네비게이션 */}
      {showNav && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20 }}>
          <BottomNav
            activeTab={screen === 'categoryExpense' ? 'report' : tab}
            onTabChange={(t) => { setTab(t); setScreen('home'); }}
          />
        </div>
      )}

      {/* 콘텐츠 영역 */}
      <div
        ref={scrollRef}
        className={`absolute inset-0 ${scrollable ? 'overflow-y-auto' : 'overflow-hidden'}`}
        style={{
          paddingTop: fullscreen
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
          <AttendanceCheckScreen
            onNext={() => {
              if (attendFrom === 'home') { setAttendFrom('onboarding'); setScreen('home'); }
              else setScreen('todayMission');
            }}
          />
        )}
        {screen === 'todayMission' && (
          <TodayMissionScreen
            onNext={() => {
              if (missionFrom === 'home') { setMissionFrom('onboarding'); setScreen('home'); }
              else setScreen('incomeSetup');
            }}
            todayExpenseCount={todayExpenses.length}
          />
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
            onNext={(amount) => {
              setBudgetGoal(amount);
              // 총액과 카테고리 배분 합계가 항상 일치해야 하므로 수정 시에도 배분 단계까지 한 플로우로 진행
              setScreen('budgetSetup');
            }}
            onBack={() => (budgetFrom === 'budget' ? backToBudgetTab() : setScreen('incomeSetup'))}
            initialBudget={budgetGoal}
            submitLabel="다음"
          />
        )}
        {screen === 'savingsGoal' && (() => {
          let totalIncome = 0;
          let savedGoal = 0;
          try {
            totalIncome = JSON.parse(localStorage.getItem('delta_incomes') || '[]')
              .reduce((sum, i) => sum + (parseInt(i.amount) || 0), 0);
            savedGoal = JSON.parse(localStorage.getItem('delta_savings_goal') || '0') || 0;
          } catch { /* noop */ }
          return (
            <BudgetGoalScreen
              title="저축 목표 금액"
              subtitle="수입의 일부를 먼저 떼어두는 똑똑한 저축 습관을 만들어봐요"
              label="목표 저축액"
              warningMessage="목표 저축액이 입력되지 않았어요!"
              submitLabel="저장"
              initialBudget={savedGoal}
              belowInput={
                <p
                  style={{
                    fontFamily: 'Pretendard, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#999999',
                    marginTop: '12px',
                    paddingLeft: '4px',
                  }}
                >
                  나의 한 달 총수입: {totalIncome.toLocaleString('ko-KR')}원
                </p>
              }
              onNext={(amount) => {
                localStorage.setItem('delta_savings_goal', JSON.stringify(amount));
                updateSavings(amount).catch(() => {}); // 서버 동기화 — 실패 시 로컬만 유지
                backToBudgetTab();
              }}
              onBack={backToBudgetTab}
            />
          );
        })()}
        {screen === 'budgetSetup' && (
          <BudgetSetupScreen
            onComplete={(total) => {
              setBudgetTotal(total);
              setBudgetGoal(total); // 배분 화면에서 총액을 바꿔도 목표 예산과 항상 일치 (예산 탭 반영)
              // 온보딩/수정 모두 완료 후 광고 시청 → 각자 위치로 복귀
              if (budgetFrom === 'budget') {
                setBudgetFrom(null);
                setAdReturn('budget');
              } else {
                setAdReturn('home');
              }
              setScreen('ad');
            }}
            onBack={() => setScreen('budgetGoal')}
            initialBudget={budgetGoal}
            submitLabel={budgetFrom === 'budget' ? '저장' : '설정 완료'}
          />
        )}
        {screen === 'ad' && (
          <AdScreen
            onDone={() => {
              if (adReturn === 'dice') {
                // 소비 입력 → 광고 → 코인 2배 보상(명세: POST /ads/reward) → 주사위 플로우
                // TODO: 실제 광고 SDK 연동 시 adId를 SDK가 주는 실제 광고 단위 식별자로 교체
                claimAdReward(AD_REWARD_TYPES.EXPENSE_RECORD, 'house_ad_expense_record')
                  .then(r => { if (typeof r?.coinBalance === 'number') localStorage.setItem('delta_coins', JSON.stringify(r.coinBalance)); })
                  .catch(() => {}); // 실패해도(중복 수령 등) 주사위 플로우는 그대로 진행
                setAdReturn('home');
                setScreen('diceRoll');
                return;
              }
              if (adReturn === 'budget') setTab('budget');
              setScreen('home');
              setAdReturn('home');
            }}
          />
        )}
        {screen === 'diceRoll' && (
          <DiceRollScreen
            onDone={(data) => {
              // 명세(POST /map/dice): 서버가 위치/이벤트까지 결정한 경우 그대로 전달,
              // 서버 미가동으로 눈금만 받은 경우엔 캐릭터 탭의 기존 로컬 규칙으로 폴백
              if (data.event) {
                localStorage.setItem('delta_pending_dice_result', JSON.stringify(data));
              } else {
                localStorage.setItem('delta_pending_dice', JSON.stringify(data.diceResult));
              }
              localStorage.setItem(DICE_ROLLED_KEY, todayString()); // 오늘의 미션: 주사위 완료 기록
              setTab('character');
              setScreen('home');
            }}
            onError={(message) => {
              alert(message);
              setTab('character');
              setScreen('home');
            }}
          />
        )}
        {screen === 'categoryExpense' && (
          <CategoryExpenseScreen
            expenses={expenses}
            onBack={() => { setTab('report'); setScreen('home'); }}
          />
        )}
        {screen === 'settings' && (
          <SettingsScreen
            onBack={() => {
              if (settingsFrom === 'home') { setTab('home'); setScreen('home'); }
              else backToBudgetTab();
              setSettingsFrom('budget');
            }}
            onLogout={() => {
              apiLogout().catch(() => {}); // 서버 Refresh Token 폐기 + delta_access_token 삭제
              localStorage.removeItem('delta_uuid'); // 세션 종료 (예산/수입 데이터는 유지)
              setScreen('login');
            }}
          />
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
            // 다음 → 바로 주사위 / 광고 보고 코인 2배 → 30초 광고 → 주사위
            onNext={() => setScreen('diceRoll')}
            onDoubleAd={() => { setAdReturn('dice'); setScreen('ad'); }}
            allExpenses={expenses}
          />
        )}
        {screen === 'home' && tab === 'home' && (
          <HomeScreen
            expenses={todayExpenses}
            budgetTotal={financeSummary?.totalExpenseBudget ?? budgetTotal}
            spent={financeSummary?.totalSpent ?? spent}
            onDirectInput={() => setScreen('directInput')}
            onMission={() => { setMissionFrom('home'); setScreen('todayMission'); }}
            onAttendance={() => { setAttendFrom('home'); setScreen('attendanceCheck'); }}
            onMapClick={() => setTab('character')}
          />
        )}
        {screen === 'home' && tab === 'report' && (
          <ReportScreen expenses={expenses} budgetTotal={budgetTotal} spent={spent} onCategoryDetail={() => setScreen('categoryExpense')} />
        )}
        {screen === 'home' && tab === 'budget' && (
          <BudgetScreen
            onEditIncome={() => { setIncomeFrom('budget'); setScreen('incomeSetup'); }}
            onEditGoal={() => {
              setBudgetFrom('budget');
              // 카테고리 팝업에서 합계 동기화된 최신 목표 예산으로 시작
              try { setBudgetGoal(JSON.parse(localStorage.getItem('delta_budget_goal')) || 0); } catch { /* noop */ }
              setScreen('budgetGoal');
            }}
            onEditSavings={() => setScreen('savingsGoal')}
            onSettings={() => { setSettingsFrom('budget'); setScreen('settings'); }}
          />
        )}
        {screen === 'home' && tab === 'character' && (
          <CharacterMapScreen
            onGroupCompose={() => setScreen('groupCompose')}
            onStore={() => setScreen('store')}
            // 퀴즈 정답 → 주사위 굴리기 화면으로 바로 이동
            onRollDice={() => setScreen('diceRoll')}
          />
        )}
        {screen === 'groupCompose' && (
          <GroupComposeScreen onBack={() => { setTab('character'); setScreen('home'); }} />
        )}
        {screen === 'store' && (
          <StoreScreen
            onBack={() => { setTab('character'); setScreen('home'); }}
            onCoinShop={() => setScreen('coinShop')}
          />
        )}
        {screen === 'coinShop' && (
          <CoinShopScreen onBack={() => setScreen('store')} />
        )}
      </div>
    </div>
    </div>
  );
}
