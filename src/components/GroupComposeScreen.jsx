import { useState, useEffect } from 'react';
import { ArrowLeft, Copy } from 'lucide-react';
import CharacterAvatar from './CharacterAvatar';

const GROUPS = ['그룹 1', '그룹 2', '그룹 3', '그룹 4'];
const GROUPS_KEY = 'delta_groups';
const MAX_MEMBERS = 3; // 나를 제외한 그룹당 최대 멤버 수

// 그룹 슬롯 4개 — null이면 아직 만들어지지 않은 빈 그룹
// TODO: 백엔드 연동 시 API로 대체
export function loadGroups() {
  try {
    const g = JSON.parse(localStorage.getItem(GROUPS_KEY));
    if (Array.isArray(g) && g.length === 4) return g;
  } catch { /* noop */ }
  return [null, null, null, null];
}

function saveGroups(groups) {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

// 초대 코드 — 최초 1회 생성 후 유지 (알파벳 + 숫자 6자리)
function getInviteCode() {
  try {
    let code = localStorage.getItem('delta_invite_code');
    if (!code) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      localStorage.setItem('delta_invite_code', code);
    }
    return code;
  } catch {
    return 'DELTA1';
  }
}

export default function GroupComposeScreen({ onBack }) {
  const [groups, setGroups] = useState(loadGroups);
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [toast, setToast] = useState(null);
  const inviteCode = getInviteCode();

  function updateGroups(next) {
    setGroups(next);
    saveGroups(next);
  }

  // 초대 링크(?invite=코드)로 진입한 경우 멤버 합류 처리
  // TODO: 백엔드 연동 시 실제 참여 플로우로 대체 — 참여자의 그룹 4개가 모두 차 있으면 참여를 거부해야 함
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (!invite || invite !== inviteCode) return;
    const nickname = params.get('nickname') || '친구';
    setGroups(prev => {
      // 친구는 내가 만든 첫 그룹에 합류 — 없으면 빈 슬롯에 그룹 생성
      let idx = prev.findIndex(g => g !== null);
      const next = [...prev];
      if (idx === -1) {
        idx = next.findIndex(g => g === null);
        if (idx === -1) return prev; // 4개 모두 가득 참 — 참여 불가
        next[idx] = { members: [] };
      }
      const grp = next[idx];
      if (grp.members.some(m => m.nickname === nickname) || grp.members.length >= MAX_MEMBERS) return prev;
      next[idx] = { ...grp, members: [...grp.members, { nickname }] };
      saveGroups(next);
      return next;
    });
  }, [inviteCode]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  }

  // 빈 슬롯에 그룹 만들기
  function handleCreateGroup() {
    if (groups[selectedGroup] !== null) return;
    const next = [...groups];
    next[selectedGroup] = { members: [] };
    updateGroups(next);
    showToast(`${GROUPS[selectedGroup]}이 만들어졌어요!`);
  }

  // 그룹 탈퇴 — 슬롯을 비워 다른 그룹에 참여할 수 있게 함
  function handleLeaveGroup() {
    if (groups[selectedGroup] === null) return;
    const next = [...groups];
    next[selectedGroup] = null;
    updateGroups(next);
    showToast(`${GROUPS[selectedGroup]}에서 탈퇴했어요`);
  }

  // 아이폰 기본 공유 시트 (카카오톡/인스타그램/메시지 등)
  async function handleNativeShare() {
    const text = `델타에서 함께 맵을 즐겨요! 내 초대 코드: ${inviteCode}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'DELTA 그룹 초대', text, url: `${window.location.origin}?invite=${inviteCode}` });
      } catch { /* 사용자가 취소한 경우 */ }
    } else {
      // 데스크탑 등 미지원 환경: 클립보드 복사로 대체
      try {
        await navigator.clipboard.writeText(text);
        showToast('초대 링크가 복사되었어요!');
      } catch { /* noop */ }
    }
  }

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(inviteCode);
      showToast('초대 코드가 복사되었어요!');
    } catch { /* noop */ }
  }

  const current = groups[selectedGroup];
  const members = current?.members ?? [];
  // 카드 수 = 멤버 + 대기중 1장 → 탈퇴 버튼 위치 계산
  const cardCount = members.length + (members.length < MAX_MEMBERS ? 1 : 0);
  const gridRows = Math.max(1, Math.ceil(cardCount / 2));
  const leaveTop = 192 + gridRows * 156 + (gridRows - 1) * 21 + 20;

  return (
    <div
      className="bg-white"
      style={{ width: '390px', minHeight: '100svh', position: 'relative' }}
    >
      {/* 토스트 */}
      {toast && (
        <div
          className="toast-enter"
          style={{
            position: 'fixed',
            bottom: 110,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '6px 16px',
            borderRadius: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 70,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 500, color: '#FFFFFF' }}>
            {toast}
          </span>
        </div>
      )}

      {/* 뒤로가기 */}
      <button
        onClick={onBack}
        className="active:scale-90 transition-transform"
        style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', cursor: 'pointer', padding: 4, zIndex: 2 }}
      >
        <ArrowLeft size={22} color="#1A1A1A" />
      </button>

      {/* 헤딩 */}
      <p style={{ position: 'absolute', top: '20px', left: 0, right: 0, fontFamily: 'Pretendard, sans-serif', fontSize: '24px', fontWeight: 600, color: '#000000', textAlign: 'center' }}>
        그룹 구성
      </p>

      {/* 서브 텍스트 */}
      <p style={{ position: 'absolute', top: '57px', left: 0, right: 0, fontFamily: 'Pretendard, sans-serif', fontSize: '14px', fontWeight: 400, color: '#999999', textAlign: 'center' }}>
        함께 맵을 즐길 멤버를 자유롭게 구성해 보세요!
      </p>

      {/* 그룹 선택 바 (353x54) — 만들어진 그룹에는 초록 점 표시 */}
      <div
        style={{
          position: 'absolute',
          top: '110px',
          left: '20px',
          width: '353px',
          height: '54px',
          borderRadius: '15px',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
        }}
      >
        {GROUPS.map((label, i) => {
          const active = selectedGroup === i;
          const created = groups[i] !== null;
          return (
            <button
              key={label}
              onClick={() => setSelectedGroup(i)}
              style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 0',
                fontFamily: 'Pretendard, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: active ? '#1CD1A1' : '#555555',
              }}
            >
              {label}
              {created && (
                <div style={{ position: 'absolute', top: '0px', right: '-7px', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#1CD1A1' }} />
              )}
              {active && (
                <div style={{ position: 'absolute', bottom: '-4px', left: 0, right: 0, height: '2px', backgroundColor: '#1CD1A1', borderRadius: '1px' }} />
              )}
            </button>
          );
        })}
      </div>

      {current === null ? (
        /* ── 빈 그룹 — 그룹 만들기 전 ─────────────────────────────── */
        <>
          <div
            style={{
              position: 'absolute',
              top: '280px',
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              padding: '0 40px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '18px', fontWeight: 600, color: '#1A1A1A' }}>
              아직 만들어진 그룹이 없어요
            </p>
            <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', fontWeight: 400, color: '#999999', lineHeight: '20px' }}>
              그룹을 만들거나 친구의 초대 링크로 참여해보세요!
              <br />
              그룹은 최대 4개까지 참여할 수 있어요.
            </p>
          </div>

          {/* 그룹 만들기 버튼 */}
          <button
            onClick={handleCreateGroup}
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(28, 209, 161, 0.40)',
            }}
          >
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>
              그룹 만들기
            </span>
          </button>
        </>
      ) : (
        /* ── 만들어진 그룹 — 멤버 그리드 ───────────────────────────── */
        <>
          <div
            style={{
              position: 'absolute',
              top: '192px',
              left: '20px',
              width: '353px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 166px)',
              justifyContent: 'space-between',
              rowGap: '21px',
            }}
          >
            {/* 합류한 멤버들 — 초록 배지 + 닉네임 */}
            {members.map(({ nickname }) => (
              <div
                key={nickname}
                style={{
                  width: '166px',
                  height: '156px',
                  borderRadius: '40px',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <CharacterAvatar size={140} style={{ marginTop: -8 }} color="#FFFFFF" eyes="round" />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    minWidth: '59px',
                    height: '21px',
                    padding: '0 10.5px',
                    borderRadius: '100px',
                    backgroundColor: '#2EE2B0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>
                    {nickname}
                  </span>
                </div>
              </div>
            ))}

            {/* 멤버 대기중 — 남은 자리가 있을 때 */}
            {members.length < MAX_MEMBERS && (
              <div
                style={{
                  width: '166px',
                  height: '156px',
                  borderRadius: '40px',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    height: '21px',
                    padding: '0 10.5px',
                    borderRadius: '100px',
                    backgroundColor: 'rgba(204, 204, 204, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>
                    멤버 대기중
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 그룹 탈퇴하기 — 탈퇴해야 다른 그룹에 참여 가능 */}
          <button
            onClick={handleLeaveGroup}
            style={{
              position: 'absolute',
              top: `${leaveTop}px`,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 10px',
              fontFamily: 'Pretendard, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              color: '#999999',
              textDecoration: 'underline',
              whiteSpace: 'nowrap',
            }}
          >
            그룹 탈퇴하기
          </button>

          {/* 말풍선 — 초대 버튼 오른쪽 위 */}
          <div
            style={{
              position: 'fixed',
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 92px)',
              left: '50%',
              transform: 'translateX(calc(-50% + 92px))',
              zIndex: 30,
            }}
          >
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '7px 12px', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)' }}>
              <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 500, color: '#555555' }}>
                <span style={{ color: '#1CD1A1' }}>친구를 초대</span>해 <span style={{ color: '#1CD1A1' }}>그룹</span>을 완성해보세요!
              </span>
            </div>
            {/* 꼬리 — 오른쪽 아래 (버튼 방향) */}
            <div style={{ position: 'absolute', bottom: '-8px', right: '36px', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '8px solid #FFFFFF' }} />
          </div>

          {/* 초대 링크 공유하기 버튼 */}
          <button
            onClick={() => setShowShare(true)}
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(28, 209, 161, 0.40)',
            }}
          >
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>
              초대 링크 공유하기
            </span>
          </button>
        </>
      )}

      {/* 공유 바텀시트 */}
      {showShare && (
        <div
          onClick={() => setShowShare(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 390,
              backgroundColor: '#FFFFFF',
              borderRadius: '20px 20px 0 0',
              padding: '24px 20px calc(env(safe-area-inset-bottom, 0px) + 24px)',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 16, fontWeight: 600, color: '#1A1A1A', margin: 0, textAlign: 'center' }}>
              초대 링크 공유하기
            </p>

            {/* 기본 공유 시트 열기 (카카오톡/인스타그램/메시지 등) */}
            <button
              onClick={handleNativeShare}
              style={{
                width: '100%',
                height: '52px',
                background: 'linear-gradient(90deg, #1CD1A1 0%, #34E8B6 100%)',
                borderRadius: '100px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Pretendard, sans-serif',
                fontSize: '15px',
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              공유하기
            </button>

            {/* 내 초대 코드 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#F4F4F4',
                borderRadius: '15px',
                padding: '14px 16px',
              }}
            >
              <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 500, color: '#555555' }}>
                내 초대 코드: <span style={{ fontWeight: 700, color: '#1A1A1A', letterSpacing: '1px' }}>{inviteCode}</span>
              </span>
              <button
                onClick={handleCopyCode}
                className="active:scale-90 transition-transform"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  fontFamily: 'Pretendard, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#1CD1A1',
                }}
              >
                <Copy size={14} color="#1CD1A1" />
                복사하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
