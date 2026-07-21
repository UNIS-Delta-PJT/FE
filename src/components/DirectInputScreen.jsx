import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import CategoryIcon from './CategoryIcons';
import coinIconImg from '../assets/icon_coin.png';
import fireIcon from '../assets/fire_succession.png';
import { createExpenses, CATEGORY_ID_MAP, toDateString, toDateTimeString, currentYearMonth, todayString } from '../api/expenses';
import { getExpenseCategories, loadCategoriesCache } from '../api/finance';
import { claimMissionReward } from '../api/missions';
import { loadAttendanceDays } from './AttendanceCheckScreen';
import { hasRolledDiceToday } from './TodayMissionScreen';

const MONTH_NAMES = ['1','2','3','4','5','6','7','8','9','10','11','12'];

// 코인 지급 결과를 로컬 캐시에 즉시 반영 (다음 getMe() 동기화 전까지 화면에 바로 보이도록)
function applyCoinBalance(coinBalance) {
  if (typeof coinBalance === 'number') {
    localStorage.setItem('delta_coins', JSON.stringify(coinBalance));
  }
}

function emptyEntry() {
  return { id: Date.now() + Math.random(), amount: '', place: '', category: null, date: new Date(), memo: '' };
}

function formatDate(date) {
  const today    = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const tomorrow  = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const same = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const m = date.getMonth() + 1, d = date.getDate();
  if (same(date, today))     return `오늘, ${m}월 ${d}일`;
  if (same(date, yesterday)) return `어제, ${m}월 ${d}일`;
  if (same(date, tomorrow))  return `내일, ${m}월 ${d}일`;
  return `${date.getFullYear()}년 ${m}월 ${d}일`;
}

function CheckIcon() {
  return (
    <svg width="62" height="62" viewBox="0 0 62 62" fill="none">
      <circle cx="31" cy="31" r="31" fill="#1CD1A1"/>
      <path d="M19 32L27 41L44 21" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── 미니 캘린더 ─── */
function MiniCalendar({ selected, onSelect }) {
  const [viewYear, setViewYear]   = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  const today = new Date();
  const prev = () => { if (viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); };
  const next = () => { if (viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); };

  return (
    <div style={{ width: 353, backgroundColor: '#FFFFFF', borderRadius: 20, boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)', padding: '16px 12px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={prev} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999999', fontSize: 20 }}>‹</button>
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 14 }}>{viewYear}년 {MONTH_NAMES[viewMonth]}월</span>
        <button onClick={next} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999999', fontSize: 20 }}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
        {['일','월','화','수','목','금','토'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontFamily: 'Pretendard, sans-serif', fontSize: 11, fontWeight: 600, color: '#999999', paddingBottom: 4 }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px 0' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const isSel   = selected.getFullYear()===viewYear && selected.getMonth()===viewMonth && selected.getDate()===day;
          const isTod   = today.getFullYear()===viewYear && today.getMonth()===viewMonth && today.getDate()===day;
          return (
            <button key={i} onClick={() => onSelect(new Date(viewYear, viewMonth, day))} style={{
              height: 32, borderRadius: 9999, border: 'none', cursor: 'pointer',
              backgroundColor: isSel ? '#1CD1A1' : 'transparent',
              color: isSel ? '#FFFFFF' : isTod ? '#1CD1A1' : '#000000',
              fontFamily: 'Pretendard, sans-serif', fontSize: 13,
              fontWeight: (isSel || isTod) ? 700 : 400,
            }}>{day}</button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── 단일 입력 폼 ─── */
function EntryForm({ entry, onUpdate, calOpen, onToggleCal, categoryNames }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

      {/* 지출 금액 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 16, color: '#000000' }}>지출 금액</span>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#EF4444', marginBottom: 8 }} />
        </div>
        <div style={{ width: 353, height: 52, borderRadius: 48, backgroundColor: '#F4F4F4', display: 'flex', alignItems: 'center', paddingLeft: 24, paddingRight: 24, boxSizing: 'border-box', gap: 4 }}>
          <input
            type="number" inputMode="numeric" placeholder="-"
            value={entry.amount}
            onChange={e => onUpdate('amount', e.target.value.replace(/[^0-9]/g, ''))}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 22, color: '#000000', textAlign: 'right' }}
          />
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 22, color: '#000000', flexShrink: 0 }}>원</span>
        </div>
      </div>

      {/* 사용처 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 16, color: '#000000' }}>사용처</span>
        <div style={{ width: 353, height: 52, borderRadius: 48, backgroundColor: '#F4F4F4', display: 'flex', alignItems: 'center', paddingLeft: 24, paddingRight: 24, boxSizing: 'border-box' }}>
          <input
            type="text" placeholder="예: 스타벅스"
            value={entry.place}
            onChange={e => onUpdate('place', e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 16, color: '#000000' }}
          />
        </div>
      </div>

      {/* 카테고리 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 16, color: '#000000' }}>카테고리</span>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#EF4444', marginBottom: 8 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
          {categoryNames.map(cat => {
            const active = entry.category === cat;
            return (
              <button key={cat} onClick={() => onUpdate('category', cat)} style={{
                height: 44, borderRadius: 32,
                backgroundColor: active ? '#1CD1A1' : '#FFFFFF',
                border: 'none',
                boxShadow: active ? '0 4px 14px rgba(28, 209, 161, 0.35)' : '0 4px 14px rgba(0, 0, 0, 0.08)',
                fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 14,
                color: active ? '#FFFFFF' : '#000000', cursor: 'pointer', transition: 'all 0.15s',
              }}>{cat}</button>
            );
          })}
        </div>
      </div>

      {/* 날짜 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ width: 353, height: 52, borderRadius: 32, backgroundColor: '#FFFFFF', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)', display: 'flex', alignItems: 'center', paddingLeft: 20, paddingRight: 16, boxSizing: 'border-box', gap: 10 }}>
          <Calendar size={18} color="#999999" strokeWidth={1.8} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 14, color: '#000000' }}>{formatDate(entry.date)}</span>
          <button onClick={onToggleCal} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
            {calOpen ? <ChevronUp size={18} color="#999999" /> : <ChevronDown size={18} color="#999999" />}
          </button>
        </div>
        {calOpen && <MiniCalendar selected={entry.date} onSelect={d => { onUpdate('date', d); onToggleCal(); }} />}
      </div>

      {/* 메모 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 16, color: '#555555' }}>메모(선택)</span>
        <textarea
          placeholder="메모 추가..."
          value={entry.memo}
          onChange={e => onUpdate('memo', e.target.value)}
          style={{ width: 353, height: 96, borderRadius: 20, backgroundColor: '#F4F4F4', border: '2px solid #F4F4F4', paddingTop: 8, paddingBottom: 8, paddingLeft: 16, paddingRight: 16, boxSizing: 'border-box', resize: 'none', outline: 'none', fontFamily: 'Pretendard, sans-serif', fontSize: 14, color: '#000000' }}
        />
      </div>
    </div>
  );
}

/* ─── 카테고리 비율 바 ─── */
function CategoryBar({ name, budget, spent }) {
  const pct       = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0;
  const remaining = Math.max(0, budget - spent);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CategoryIcon name={name} width={16} height={14} color="#000000" />
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 14, color: '#000000' }}>{name} 지출 비율</span>
        </div>
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 14, color: '#1CD1A1' }}>{pct}%</span>
      </div>
      <div style={{ height: 14, borderRadius: 9999, backgroundColor: '#F4F4F4', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 9999, background: 'linear-gradient(90deg, #D4F8E9 0%, #33E7B5 100%)' }} />
      </div>
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 12, color: '#3D4A3E' }}>
        목표 지출까지 {remaining.toLocaleString('ko-KR')}원 남았습니다
      </span>
    </div>
  );
}

/* ─── 저장 완료 화면 ─── */
function SavedScreen({ savedEntries, allExpenses, streak, dailyTotalExpense, isFirstRecordOfDay, onNext, onDoubleAd, onFinish }) {
  // 주사위는 하루 1번, 오늘의 첫 지출 기록에만 제공 — 그 외엔 이미 오늘 몫을 썼거나(다른 경로 포함)
  // 두 번째 이후 기록이라 서버가 DICE_NOT_ENABLED로 거부할 것이 확실하므로 아예 제안하지 않음
  const canRollDice = isFirstRecordOfDay && !hasRolledDiceToday();
  // 토스트 시퀀스: 미션 완료(1초) → 사라진 뒤 코인 획득
  const [missionToast, setMissionToast] = useState(true);
  const [missionFading, setMissionFading] = useState(false);
  const [coinToast, setCoinToast] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    // 진입 시 화면 상단으로 스크롤
    let el = rootRef.current;
    while (el) {
      if (el.scrollTop > 0) { el.scrollTop = 0; break; }
      el = el.parentElement;
    }
    const t1 = setTimeout(() => setMissionFading(true), 1000);
    const t2 = setTimeout(() => setMissionToast(false), 1300);
    const t3 = setTimeout(() => setCoinToast(true), 1500);
    const t4 = setTimeout(() => setCoinToast(false), 4000);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);
  const budgetTotal = (() => { try { return JSON.parse(localStorage.getItem('delta_budget_total') || '0') || 0; } catch { return 0; } })();
  const budgetCats  = (() => { try { return JSON.parse(localStorage.getItem('delta_budget_categories') || '[]'); } catch { return []; } })();

  const sessionTotal = savedEntries.reduce((sum, e) => sum + e.amount, 0);
  // 예산은 월 단위인데 allExpenses는 전체 기간 내역이라 이번 달로 좁혀야 함.
  // 오늘 몫은 App이 백그라운드에서 서버 재조회(loadExpenses)를 이미 시작해둔 상태라
  // allExpenses에 방금 저장한 항목이 로컬 임시본/서버 확정본 중 어느 쪽으로 들어있을지
  // 시점마다 달라 id 비교로는 중복을 완전히 막을 수 없음 — 그래서 오늘 몫은 아예
  // allExpenses에서 빼고, 서버가 확정해준 dailyTotalExpense(명세: POST /finances/expenses
  // 응답)를 그대로 신뢰해 한 번만 더함
  const currentYM = currentYearMonth();
  const today = todayString();
  const savedIds = new Set(savedEntries.map(e => e.expense_id));
  const monthExcludingToday = allExpenses
    .filter(e => e.expense_date?.startsWith(currentYM) && e.expense_date !== today)
    .reduce((sum, e) => sum + e.amount, 0);
  const todayTotal = typeof dailyTotalExpense === 'number'
    ? dailyTotalExpense
    : allExpenses
        .filter(e => e.expense_date === today && !savedIds.has(e.expense_id))
        .reduce((sum, e) => sum + e.amount, 0) + sessionTotal;
  const remaining = budgetTotal - (monthExcludingToday + todayTotal);

  const catSpending = {};
  savedEntries.forEach(e => { catSpending[e.name] = (catSpending[e.name] || 0) + e.amount; });

  const getCatBudget = name => budgetCats.find(c => c.name === name)?.amount || 0;
  const usedCats = Object.keys(catSpending);

  return (
    <div ref={rootRef} style={{ minHeight: '100%', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 170 }}>

      {/* 미션 완료 토스트 — 먼저 1초 */}
      {missionToast && (
        <div
          className={missionFading ? 'toast-exit' : 'toast-enter'}
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top, 0px) + 20px)',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '5px 12px',
            borderRadius: 1000,
            backgroundColor: 'rgba(254, 208, 35, 0.25)',
            whiteSpace: 'nowrap',
            zIndex: 50,
          }}
        >
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 12, color: '#FFCF19' }}>
            "오늘의 지출 기록하기" 미션 완료!
          </span>
        </div>
      )}

      {/* 코인 획득 토스트 — 1초 뒤 화면 중앙 상단 */}
      {coinToast && (
        <div
          className="toast-enter"
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top, 0px) + 20px)',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '5px 12px',
            borderRadius: 1000,
            backgroundColor: 'rgba(254, 208, 35, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            zIndex: 50,
          }}
        >
          <img src={coinIconImg} alt="코인" draggable={false} style={{ width: 15, height: 15, objectFit: 'contain' }} />
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 13, fontWeight: 600, color: '#FFCF19', whiteSpace: 'nowrap' }}>
            1코인 획득!
          </span>
        </div>
      )}

      {/* 체크 아이콘 */}
      <div style={{ marginTop: 40 }}><CheckIcon /></div>

      <div style={{ height: 16 }} />
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 24, color: '#000000' }}>기록 완료!</span>
      <div style={{ height: 8 }} />
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 16, color: '#000000' }}>오늘의 금융 성장을 응원해요!</span>
      <div style={{ height: 24 }} />

      {/* 요약 카드 */}
      <div style={{ width: 353, minHeight: 245, borderRadius: 32, backgroundColor: '#FFFFFF', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', padding: 24, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 16, color: '#000000' }}>오늘의 총 지출</span>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 24, color: '#1CD1A1' }}>{sessionTotal.toLocaleString('ko-KR')}원</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 16, color: '#000000' }}>남은 예산</span>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 24, color: remaining >= 0 ? '#000000' : '#EF4444' }}>{remaining.toLocaleString('ko-KR')}원</span>
        </div>

        {usedCats.length > 0 && (
          <>
            <div style={{ height: 1, backgroundColor: '#F4F4F4' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {usedCats.map(cat => (
                <CategoryBar key={cat} name={cat} budget={getCatBudget(cat)} spent={catSpending[cat]} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 하단 고정 버튼 — 오늘 첫 기록일 때만 주사위 제공(하루 1번), 그 외엔 바로 홈으로 */}
      <div style={{ position: 'fixed', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', zIndex: 30 }}>
        {canRollDice ? (
          <>
            <button
              onClick={onNext}
              className="active:scale-95 transition-transform"
              style={{ width: 353, height: 56, padding: 20, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 100, background: 'linear-gradient(90deg, #1CD1A1 0%, #34E8B6 100%)', border: 'none', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 16, color: '#FFFFFF', boxShadow: '0 4px 20px rgba(28, 209, 161, 0.40)' }}
            >
              다음
            </button>
            <button
              onClick={onDoubleAd}
              className="active:scale-95 transition-transform"
              style={{ width: 353, height: 56, padding: 20, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 100, backgroundColor: '#FFFFFF', border: 'none', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 16, color: '#1CD1A1', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.10)', whiteSpace: 'nowrap' }}
            >
              광고 보고 코인 2배!
            </button>
          </>
        ) : (
          <button
            onClick={onFinish}
            className="active:scale-95 transition-transform"
            style={{ width: 353, height: 56, padding: 20, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 100, background: 'linear-gradient(90deg, #1CD1A1 0%, #34E8B6 100%)', border: 'none', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 16, color: '#FFFFFF', boxShadow: '0 4px 20px rgba(28, 209, 161, 0.40)' }}
          >
            확인
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── 메인 컴포넌트 ─── */
export default function DirectInputScreen({ onBack, onSave, onNext, onDoubleAd, onFinish, allExpenses = [] }) {
  const [entries, setEntries]       = useState([emptyEntry()]);
  const [openCalId, setOpenCalId]   = useState(null);
  const [savedEntries, setSavedEntries] = useState([]);
  const [isFirstRecordOfDay, setIsFirstRecordOfDay] = useState(false);
  const [dailyTotalExpense, setDailyTotalExpense] = useState(null);
  const [view, setView]             = useState('input');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastFading, setToastFading]   = useState(false);
  const [saving, setSaving]         = useState(false);
  // 명세: GET /finances/expense-categories — 커스텀 카테고리 포함 실제 목록 (캐시로 즉시 렌더 후 최신화)
  const [categories, setCategories] = useState(loadCategoriesCache);
  useEffect(() => { getExpenseCategories().then(setCategories).catch(() => {}); }, []);
  const categoryNames = categories.map(c => c.name);

  const streak = (() => { try { return parseInt(localStorage.getItem('delta_streak') || '0'); } catch { return 0; } })();
  const newStreak = streak + 1;

  function updateEntry(id, field, val) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: val } : e));
  }

  function addEntry() {
    setEntries(prev => [...prev, emptyEntry()]);
    setOpenCalId(null);
  }

  async function handleSave() {
    const valid = entries.filter(e => e.amount && e.category);
    if (!valid.length || saving) return;

    const savedAt = new Date(); // 저장 버튼 누른 시각

    setSaving(true);
    try {
      // API 일괄 저장 (명세: POST /api/v1/finances/expenses) — 실패해도 로컬 저장으로 진행
      let synced = false;
      try {
        const result = await createExpenses(valid.map(e => ({
          amount: parseInt(e.amount),
          placeName: e.place?.trim() || e.memo || e.category,
          categoryId: categories.find(c => c.name === e.category)?.categoryId
            ?? CATEGORY_ID_MAP[e.category]
            ?? categories[0]?.categoryId
            ?? 1,
          expenseDate: toDateTimeString(e.date),
          memo: e.memo || null,
        })));
        synced = true;
        setIsFirstRecordOfDay(Boolean(result?.isFirstRecordOfDay));
        if (typeof result?.dailyTotalExpense === 'number') setDailyTotalExpense(result.dailyTotalExpense);
        // 오늘의 첫 기록이면 '지출 기록' 미션 리워드(1코인) 수령
        if (result?.isFirstRecordOfDay) {
          claimMissionReward('EXPENSE_RECORD')
            .then(r => applyCoinBalance(r?.coinBalance))
            .catch(() => {});
        }
      } catch (err) {
        console.warn('[handleSave] API 실패 — 로컬 저장으로 진행:', err.message);
      }

      // 옵티미스틱 업데이트용 로컬 형식 생성 — synced=true면 다음 loadExpenses() 동기화 때
      // 진짜 서버 데이터로 교체되므로(App.jsx) 여기선 화면에 즉시 보여주는 용도로만 사용
      const parsed = valid.map((e) => ({
        expense_id: Date.now() + Math.random(),
        place: e.place?.trim() || e.memo || e.category,
        name: e.category,
        amount: parseInt(e.amount),
        expense_date: toDateString(e.date), // 'YYYY-MM-DD' (필터링용)
        memo: e.memo,
        saved_at: savedAt.toISOString(),    // 저장 시각 (표시·정렬용)
        localOnly: !synced,                 // 서버 저장 실패 시에만 true — loadExpenses 병합 시 유지 기준
      }));

      onSave(parsed);
      localStorage.setItem('delta_streak', String(newStreak));
      setSavedEntries(parsed);
      setView('saved');
      // 코인 토스트(1.5초 시점)와 함께 그 아래에 표시
      setToastFading(false);
      setTimeout(() => setToastVisible(true), 1500);
      setTimeout(() => {
        setToastFading(true);
        setTimeout(() => setToastVisible(false), 300);
      }, 4000);
    } finally {
      setSaving(false);
    }
  }

  const isValid = entries.some(e => e.amount && e.category);

  /* ─── Saved view ─── */
  if (view === 'saved') {
    return (
      <div style={{ position: 'relative' }}>
        {toastVisible && (
          <div
            className={toastFading ? 'toast-exit' : 'toast-enter'}
            style={{
              position: 'fixed', top: 'calc(env(safe-area-inset-top, 0px) + 56px)', left: '50%', transform: 'translateX(-50%)',
              padding: '4px 12px', borderRadius: 9999,
              backgroundColor: 'rgba(255, 118, 130, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              zIndex: 50, whiteSpace: 'nowrap',
            }}
          >
            <img
              src={fireIcon}
              alt="연속 기록"
              draggable={false}
              style={{ width: 16, height: 20, objectFit: 'contain' }}
            />
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 13, color: '#FF7682' }}>
              {loadAttendanceDays().length}일 연속 기록 중!
            </span>
          </div>
        )}
        <SavedScreen
          savedEntries={savedEntries}
          allExpenses={allExpenses}
          streak={newStreak}
          dailyTotalExpense={dailyTotalExpense}
          isFirstRecordOfDay={isFirstRecordOfDay}
          onNext={onNext}
          onDoubleAd={onDoubleAd}
          onFinish={onFinish}
        />
      </div>
    );
  }

  /* ─── Input view ─── */
  return (
    <div style={{ minHeight: '100%', backgroundColor: '#FFFFFF' }}>
      <div style={{ height: 64 }} />

      {/* 고정 헤더 */}
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: 390, zIndex: 20, backgroundColor: '#FFFFFF', paddingTop: 20, paddingBottom: 12, paddingLeft: 20, paddingRight: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ArrowLeft size={20} color="#000000" />
        </button>
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 24, color: '#000000', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>지출 기록</span>
        <div style={{ width: 28 }} />
      </div>

      {/* 스크롤 콘텐츠 */}
      <div style={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 140 }}>
        <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 14, color: '#999999', textAlign: 'center', margin: 0, marginBottom: 24 }}>
          오늘 얼마를 지출하셨나요?
        </p>

        {entries.map((entry, idx) => (
          <div key={entry.id}>
            {idx > 0 && <div style={{ height: 1, backgroundColor: '#EAEAEA', margin: '32px 0' }} />}
            <EntryForm
              entry={entry}
              onUpdate={(field, val) => updateEntry(entry.id, field, val)}
              calOpen={openCalId === entry.id}
              onToggleCal={() => setOpenCalId(prev => prev === entry.id ? null : entry.id)}
              categoryNames={categoryNames}
            />
          </div>
        ))}
      </div>

      {/* 하단 버튼 */}
      <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', width: 353, display: 'flex', gap: 13, zIndex: 20 }}>
        <button
          onClick={addEntry}
          className="active:scale-95 transition-transform"
          style={{ flex: 1, height: 56, borderRadius: 100, backgroundColor: '#FFFFFF', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.10)', border: 'none', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 15, color: '#1CD1A1' }}
        >
          지출 추가하기
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="active:scale-95 transition-transform disabled:opacity-60"
          style={{ flex: 1, height: 56, borderRadius: 100, backgroundColor: isValid && !saving ? '#1CD1A1' : '#A7EDDA', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 15, color: '#FFFFFF' }}
        >
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  );
}
