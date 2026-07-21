import { useEffect, useState } from 'react';
import tickIcon from '../assets/clipboard_tick.png';
import { todayString } from '../api/expenses';
import { checkAttendance, getAttendance, claimMissionReward } from '../api/missions';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const STORAGE_KEY = 'delta_attendance_days';

/** 지금까지 출석한 날짜 목록 (YYYY-MM-DD 배열) */
export function loadAttendanceDays() {
  try {
    const days = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(days) ? days : [];
  } catch {
    return [];
  }
}

/** 오늘 이미 출석체크를 했는지 — App에서 하루 1회 노출 판단용 */
export function hasAttendedToday() {
  return loadAttendanceDays().includes(todayString());
}

export default function AttendanceCheckScreen({ onNext }) {
  const today = new Date();
  const todayStr = todayString();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-based

  // 출석 기록 읽기 — 오늘이 처음이면 애니메이션 대상으로 표시 (오프라인에서도 즉시 렌더)
  const [{ attendedSet, newlyChecked }, setAttendState] = useState(() => {
    const days = loadAttendanceDays();
    const newly = !days.includes(todayStr);
    return {
      attendedSet: new Set(newly ? [...days, todayStr] : days),
      newlyChecked: newly,
    };
  });
  // 서버 기준 연속 출석 일수 — 로드되면 로컬 계산값 대신 이 값을 표시
  const [serverStreak, setServerStreak] = useState(null);
  const totalCount = serverStreak ?? attendedSet.size;

  // 오늘 출석 저장 (이미 기록돼 있으면 그대로 유지) + 서버 동기화
  useEffect(() => {
    const days = loadAttendanceDays();
    const isFirstToday = !days.includes(todayStr);
    if (isFirstToday) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...days, todayStr]));
    }

    (async () => {
      // 서버에 출석 기록 — 이미 출석(409)이면 무시하고 로컬 기준으로 표시
      try {
        const { continuousAttendance } = await checkAttendance();
        if (typeof continuousAttendance === 'number') setServerStreak(continuousAttendance);
      } catch { /* noop */ }

      // 출석 리워드(1코인) 수령 — 오늘 처음 출석한 경우에만 시도 (서버가 중복 수령도 막아줌)
      if (isFirstToday) {
        claimMissionReward('ATTENDANCE')
          .then(r => {
            if (typeof r?.coinBalance === 'number') {
              localStorage.setItem('delta_coins', JSON.stringify(r.coinBalance));
            }
          })
          .catch(() => {});
      }

      // 이번 달 실제 출석 현황으로 달력 보정 (서버가 최종 소스)
      try {
        const mm = String(month + 1).padStart(2, '0');
        const { attendances } = await getAttendance(`${year}-${mm}-01`, todayStr);
        if (Array.isArray(attendances)) {
          setAttendState(prev => {
            const merged = new Set(prev.attendedSet);
            attendances.forEach(a => { if (a.isAttended) merged.add(a.date); });
            return { ...prev, attendedSet: merged };
          });
        }
      } catch { /* noop */ }
    })();
  }, [todayStr]);

  // 오늘 칸이 회색 → 초록으로 넘어가는 타이밍 (처음 출석한 날만 연출)
  const [flipped, setFlipped] = useState(!newlyChecked);
  useEffect(() => {
    if (!newlyChecked) return;
    const t = setTimeout(() => setFlipped(true), 900);
    return () => clearTimeout(t);
  }, [newlyChecked]);

  // 연속 출석 숫자 — 오늘 칸이 초록으로 바뀌는 순간 함께 롤업
  const displayCount = flipped ? totalCount : totalCount - (newlyChecked ? 1 : 0);

  // 이번 달 달력 데이터
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = new Date(year, month, 1).getDay(); // 0=일
  const mm = String(month + 1).padStart(2, '0');
  const cells = [
    ...Array.from({ length: firstDayOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const date = i + 1;
      const dateStr = `${year}-${mm}-${String(date).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      return {
        date,
        isToday,
        isFuture: date > today.getDate(),
        // 오늘 칸은 flip 연출 후에만 초록으로
        checked: attendedSet.has(dateStr) && (!isToday || flipped),
      };
    }),
  ];

  return (
    <div
      className="bg-white overflow-hidden"
      style={{ width: '390px', minHeight: '844px', position: 'relative' }}
    >
      {/* 연속 출석 일수 — 숫자가 넘어가는 롤업 */}
      <div
        style={{
          position: 'absolute',
          top: '150px',
          left: 0,
          right: 0,
          height: '74px',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        <p
          key={displayCount}
          className={flipped && newlyChecked ? 'attend-num-roll' : undefined}
          style={{
            fontFamily: 'Pretendard, sans-serif',
            fontSize: '100px',
            fontWeight: 700,
            color: '#34E8B6',
            lineHeight: '74px',
          }}
        >
          {displayCount}
        </p>
      </div>

      {/* 일 연속 출석 */}
      <p
        style={{
          position: 'absolute',
          top: '236px',
          left: 0,
          right: 0,
          fontFamily: 'Pretendard, sans-serif',
          fontSize: '30px',
          fontWeight: 600,
          color: '#000000',
          textAlign: 'center',
        }}
      >
        일 연속 출석
      </p>

      {/* 이번 달 달력 */}
      <div
        style={{
          position: 'absolute',
          top: '308px',
          left: '25.5px',
          width: '339px',
        }}
      >
        <p
          style={{
            fontFamily: 'Pretendard, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            color: '#1A1A1A',
            textAlign: 'center',
            marginBottom: '14px',
          }}
        >
          {year}년 {month + 1}월
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 45px)',
            columnGap: '4px',
            rowGap: '8px',
            justifyItems: 'center',
          }}
        >
          {DAY_LABELS.map((label) => (
            <span
              key={label}
              style={{
                fontFamily: 'Pretendard, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#5D5D5D',
                height: '16px',
                lineHeight: '16px',
              }}
            >
              {label}
            </span>
          ))}
          {cells.map((cell, i) =>
            cell === null ? (
              <div key={`blank-${i}`} style={{ width: '40px', height: '40px' }} />
            ) : (
              <div
                key={cell.date}
                className={`attend-cell-in${cell.isToday && flipped && newlyChecked ? ' attend-pop-in' : ''}`}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: cell.checked ? '#34E8B6' : '#F0F0F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animationDelay: cell.isToday && flipped && newlyChecked ? '0ms' : `${i * 18}ms`,
                }}
              >
                {cell.checked ? (
                  <img
                    src={tickIcon}
                    alt="출석 완료"
                    style={{
                      width: '22px',
                      height: '22px',
                      objectFit: 'contain',
                      filter: 'brightness(0) invert(1)', // #FFFFFF
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontFamily: 'Pretendard, sans-serif',
                      fontSize: '16px',
                      fontWeight: 500,
                      color: cell.isFuture ? '#B9B9B9' : '#575757',
                    }}
                  >
                    {cell.date}
                  </span>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* 응원 멘트 */}
      <p
        style={{
          position: 'absolute',
          top: '664px',
          left: 0,
          right: 0,
          fontFamily: 'Pretendard, sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          color: '#000000',
          textAlign: 'center',
        }}
      >
        오늘도 델타와 함께 출석 성공!
      </p>

      {/* 계속하기 버튼 (floating) */}
      <button
        onClick={onNext}
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          width: '353px',
          height: '56px',
          background: 'linear-gradient(90deg, #1CD1A1 0%, #34E8B6 100%)',
          borderRadius: '100px',
          border: 'none',
          cursor: 'pointer',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          boxShadow: '0 4px 20px rgba(28, 209, 161, 0.40)',
        }}
      >
        <span
          style={{
            fontFamily: 'Pretendard, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            color: '#FFFFFF',
          }}
        >
          계속하기
        </span>
      </button>
    </div>
  );
}
