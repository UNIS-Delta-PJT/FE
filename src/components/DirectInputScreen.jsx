import { useState } from 'react';
import { ArrowLeft, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import CategoryIcon from './CategoryIcons';

const CATEGORIES = ['식비', '교통', '문화', '기타'];
const MONTH_NAMES = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const CAT_BUDGET_KEY = { '식비': '식비', '교통': '교통', '문화': '문화/여가', '기타': '기타' };

function emptyEntry() {
  return { id: Date.now() + Math.random(), amount: '', category: null, date: new Date(), memo: '' };
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

/* ─── 아이콘 ─── */
function FlameIcon() {
  return (
    <svg width="16" height="20" viewBox="0 0 16 22" fill="none">
      <path d="M8 0C8 0 13 6 13 11.5C13 11.5 11 10 9.5 11.5C9.5 11.5 12 13.5 12 17C12 19.8 10.2 22 8 22C5.8 22 4 19.8 4 17C4 13.5 6.5 11.5 6.5 11.5C5 10 3 11.5 3 11.5C3 6 8 0 8 0Z" fill="#735C00"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="62" height="62" viewBox="0 0 62 62" fill="none">
      <circle cx="31" cy="31" r="31" fill="#2ECC71"/>
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
    <div style={{ width: 353, backgroundColor: '#FFFFFF', borderRadius: 20, border: '2px solid #F1F5F9', padding: '16px 12px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={prev} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 20 }}>‹</button>
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 14 }}>{viewYear}년 {MONTH_NAMES[viewMonth]}월</span>
        <button onClick={next} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 20 }}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
        {['일','월','화','수','목','금','토'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontFamily: 'Pretendard, sans-serif', fontSize: 11, fontWeight: 600, color: '#94A3B8', paddingBottom: 4 }}>{d}</div>
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
              backgroundColor: isSel ? '#2ECC71' : 'transparent',
              color: isSel ? '#FFFFFF' : isTod ? '#2ECC71' : '#000000',
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
function EntryForm({ entry, onUpdate, calOpen, onToggleCal }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* 지출 금액 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 16, color: '#000000' }}>지출 금액</span>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#EF4444', marginBottom: 8 }} />
        </div>
        <div style={{ width: 353, height: 64, borderRadius: 48, backgroundColor: '#F3F4F5', display: 'flex', alignItems: 'center', paddingLeft: 24, paddingRight: 24, boxSizing: 'border-box', gap: 4 }}>
          <input
            type="number" inputMode="numeric" placeholder="-"
            value={entry.amount}
            onChange={e => onUpdate('amount', e.target.value.replace(/[^0-9]/g, ''))}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 24, color: '#000000', textAlign: 'right' }}
          />
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 24, color: '#000000', flexShrink: 0 }}>원</span>
        </div>
      </div>

      {/* 카테고리 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 16, color: '#000000' }}>카테고리</span>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#EF4444', marginBottom: 8 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
          {CATEGORIES.map(cat => {
            const active = entry.category === cat;
            return (
              <button key={cat} onClick={() => onUpdate('category', cat)} style={{
                height: 44, borderRadius: 32,
                backgroundColor: active ? '#2ECC71' : '#FFFFFF',
                border: `2px solid ${active ? 'transparent' : '#E2E8F0'}`,
                fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 14,
                color: active ? '#FFFFFF' : '#000000', cursor: 'pointer', transition: 'all 0.15s',
              }}>{cat}</button>
            );
          })}
        </div>
      </div>

      {/* 날짜 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ width: 353, height: 60, borderRadius: 32, backgroundColor: '#FFFFFF', border: '2px solid #F1F5F9', display: 'flex', alignItems: 'center', paddingLeft: 20, paddingRight: 16, boxSizing: 'border-box', gap: 10 }}>
          <Calendar size={18} color="#94A3B8" strokeWidth={1.8} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 14, color: '#000000' }}>{formatDate(entry.date)}</span>
          <button onClick={onToggleCal} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
            {calOpen ? <ChevronUp size={18} color="#94A3B8" /> : <ChevronDown size={18} color="#94A3B8" />}
          </button>
        </div>
        {calOpen && <MiniCalendar selected={entry.date} onSelect={d => { onUpdate('date', d); onToggleCal(); }} />}
      </div>

      {/* 메모 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 16, color: '#64748B' }}>메모(선택)</span>
        <textarea
          placeholder="메모 추가..."
          value={entry.memo}
          onChange={e => onUpdate('memo', e.target.value)}
          style={{ width: 353, height: 96, borderRadius: 20, backgroundColor: '#F3F4F5', border: '2px solid #F1F5F9', paddingTop: 8, paddingBottom: 8, paddingLeft: 16, paddingRight: 16, boxSizing: 'border-box', resize: 'none', outline: 'none', fontFamily: 'Pretendard, sans-serif', fontSize: 14, color: '#000000' }}
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
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 14, color: '#006D37' }}>{pct}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 9999, backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
        <div style={{ height: 8, width: `${pct}%`, borderRadius: 9999, backgroundColor: '#2ECC71' }} />
      </div>
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 12, color: '#3D4A3E' }}>
        목표 지출까지 {remaining.toLocaleString('ko-KR')}원 남았습니다
      </span>
    </div>
  );
}

/* ─── 저장 완료 화면 ─── */
function SavedScreen({ savedEntries, allExpenses, streak, onHome }) {
  const budgetTotal = (() => { try { return JSON.parse(localStorage.getItem('delta_budget_total') || '0') || 0; } catch { return 0; } })();
  const budgetCats  = (() => { try { return JSON.parse(localStorage.getItem('delta_budget_categories') || '[]'); } catch { return []; } })();

  const sessionTotal = savedEntries.reduce((sum, e) => sum + e.amount, 0);
  const allTotal     = allExpenses.reduce((sum, e) => sum + e.amount, 0) + sessionTotal;
  const remaining    = budgetTotal - allTotal;

  const catSpending = {};
  savedEntries.forEach(e => { catSpending[e.category] = (catSpending[e.category] || 0) + e.amount; });

  const getCatBudget = name => budgetCats.find(c => c.name === CAT_BUDGET_KEY[name])?.amount || 0;
  const usedCats = Object.keys(catSpending);

  return (
    <div style={{ minHeight: '100%', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 60 }}>

      {/* 체크 아이콘 */}
      <div style={{ marginTop: 148 }}><CheckIcon /></div>

      <div style={{ height: 20 }} />
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 24, color: '#000000' }}>기록 완료!</span>
      <div style={{ height: 8 }} />
      <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 16, color: '#000000' }}>오늘의 금융 성장을 응원해요!</span>
      <div style={{ height: 32 }} />

      {/* 요약 카드 */}
      <div style={{ width: 353, minHeight: 245, borderRadius: 32, backgroundColor: '#FFFFFF', border: '1px solid #BBCBBB', padding: 24, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 16, color: '#000000' }}>오늘의 총 지출</span>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 24, color: '#2ECC71' }}>{sessionTotal.toLocaleString('ko-KR')}원</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 16, color: '#000000' }}>남은 예산</span>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 24, color: remaining >= 0 ? '#000000' : '#EF4444' }}>{remaining.toLocaleString('ko-KR')}원</span>
        </div>

        {usedCats.length > 0 && (
          <>
            <div style={{ height: 1, backgroundColor: '#F3F4F5' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {usedCats.map(cat => (
                <CategoryBar key={cat} name={cat} budget={getCatBudget(cat)} spent={catSpending[cat]} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 홈으로 버튼 */}
      <div style={{ marginTop: 32 }}>
        <button
          onClick={onHome}
          className="active:scale-95 transition-transform"
          style={{ width: 168, height: 56, borderRadius: 100, backgroundColor: '#2ECC71', border: 'none', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 16, color: '#FFFFFF' }}
        >
          홈으로
        </button>
      </div>
    </div>
  );
}

/* ─── 메인 컴포넌트 ─── */
export default function DirectInputScreen({ onBack, onSave, onHome, allExpenses = [] }) {
  const [entries, setEntries]       = useState([emptyEntry()]);
  const [openCalId, setOpenCalId]   = useState(null);
  const [savedEntries, setSavedEntries] = useState([]);
  const [view, setView]             = useState('input');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastFading, setToastFading]   = useState(false);

  const streak = (() => { try { return parseInt(localStorage.getItem('delta_streak') || '0'); } catch { return 0; } })();
  const newStreak = streak + 1;

  function updateEntry(id, field, val) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: val } : e));
  }

  function addEntry() {
    setEntries(prev => [...prev, emptyEntry()]);
    setOpenCalId(null);
  }

  function handleSave() {
    const valid = entries.filter(e => e.amount && e.category);
    if (!valid.length) return;
    const parsed = valid.map(e => {
      const hh = String(e.date.getHours()).padStart(2, '0');
      const mm = String(e.date.getMinutes()).padStart(2, '0');
      return {
        expense_id: Date.now() + Math.random(),
        place: e.memo || e.category,
        name: e.category,
        amount: parseInt(e.amount),
        expense_date: `${hh}:${mm}`,
        memo: e.memo,
      };
    });
    onSave(parsed);
    localStorage.setItem('delta_streak', String(newStreak));
    setSavedEntries(parsed);
    setView('saved');
    setToastVisible(true);
    setToastFading(false);
    setTimeout(() => {
      setToastFading(true);
      setTimeout(() => setToastVisible(false), 300);
    }, 2500);
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
              position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
              width: 157, height: 38, borderRadius: 9999,
              backgroundColor: 'rgba(254,208,35,0.2)', border: '1px solid #FED023',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              zIndex: 50, whiteSpace: 'nowrap',
            }}
          >
            <FlameIcon />
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 14, color: '#6F5900' }}>
              {newStreak}일 연속 기록 중!
            </span>
          </div>
        )}
        <SavedScreen savedEntries={savedEntries} allExpenses={allExpenses} streak={newStreak} onHome={onHome} />
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
        <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 14, color: '#8D8D8D', textAlign: 'center', margin: 0, marginBottom: 24 }}>
          오늘 얼마를 지출하셨나요?
        </p>

        {entries.map((entry, idx) => (
          <div key={entry.id}>
            {idx > 0 && <div style={{ height: 1, backgroundColor: '#E5E7EB', margin: '32px 0' }} />}
            <EntryForm
              entry={entry}
              onUpdate={(field, val) => updateEntry(entry.id, field, val)}
              calOpen={openCalId === entry.id}
              onToggleCal={() => setOpenCalId(prev => prev === entry.id ? null : entry.id)}
            />
          </div>
        ))}
      </div>

      {/* 하단 버튼 */}
      <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', width: 353, display: 'flex', gap: 13, zIndex: 20 }}>
        <button
          onClick={addEntry}
          className="active:scale-95 transition-transform"
          style={{ flex: 1, height: 56, borderRadius: 100, backgroundColor: '#F3F4F5', border: 'none', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 15, color: '#2ECC71' }}
        >
          지출 추가하기
        </button>
        <button
          onClick={handleSave}
          className="active:scale-95 transition-transform"
          style={{ flex: 1, height: 56, borderRadius: 100, backgroundColor: isValid ? '#2ECC71' : '#A7F3C8', border: 'none', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 15, color: '#FFFFFF' }}
        >
          저장하기
        </button>
      </div>
    </div>
  );
}
