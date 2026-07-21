import { useState, useEffect } from 'react';
import { ArrowLeft, Copy } from 'lucide-react';
import CharacterAvatar from './CharacterAvatar';
import { createGroup, getMyGroups, leaveGroup } from '../api/group';
import { ENUM_TO_BODY_COLOR, ENUM_TO_EYE_SHAPE } from '../api/user';

const GROUP_LABELS = ['그룹 1', '그룹 2', '그룹 3', '그룹 4'];
const MAX_MEMBERS = 4; // 나를 포함한 화면 표시용 카드 수 (서버에 그룹 인원 상한 명세는 없음 — 순수 UI 연출)

function loadMyUserId() {
  try { return JSON.parse(localStorage.getItem('delta_user_id') || 'null'); } catch { return null; }
}

// 명세: GET /api/v1/users/me — App.jsx의 loadMe()가 character 정보를 여기 캐시해둠.
// 그룹 목록 API가 내 캐릭터 정보를 못 채워줄 때(온보딩 저장이 아직 서버에 반영 안 됐거나 하는 경우)를
// 대비해 '나' 카드는 이 값을 우선 사용
function loadMyNickname() {
  try { return localStorage.getItem('delta_nickname') || ''; } catch { return ''; }
}
function loadMyColor() {
  try { return localStorage.getItem('delta_character_color') || ''; } catch { return ''; }
}
function loadMyEyes() {
  try { return localStorage.getItem('delta_character_eyes') || ''; } catch { return ''; }
}

export default function GroupComposeScreen({ onBack }) {
  // 명세: GET /api/v1/groups — 내가 속한 그룹(최대 4개) + 구성원 현황
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [toast, setToast] = useState(null);
  const myUserId = loadMyUserId();
  const myNickname = loadMyNickname();

  useEffect(() => {
    const refresh = () => getMyGroups().then(setGroups).catch(() => {}); // 서버 미가동 시 빈 목록 유지
    refresh();
    // 초대 링크로 친구가 참여한 직후처럼, 이 화면을 이미 띄워둔 채로 그룹 구성이 바뀌었을 수 있어
    // 탭/창이 다시 포커스될 때마다 최신 멤버 목록으로 갱신
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  }

  // 빈 슬롯에 그룹 만들기 (명세: POST /api/v1/groups)
  async function handleCreateGroup() {
    if (groups[selectedGroup]) return;
    try {
      await createGroup();
      showToast(`${GROUP_LABELS[selectedGroup]}이 만들어졌어요!`);
      const data = await getMyGroups();
      setGroups(data);
      setSelectedGroup(data.length - 1); // 방금 만든 그룹으로 탭 이동
    } catch (err) {
      showToast(err.response?.data?.message || '그룹을 만들지 못했어요');
    }
  }

  // 그룹 탈퇴 (명세: DELETE /api/v1/groups/{groupId}/leave)
  async function handleLeaveGroup() {
    const target = groups[selectedGroup];
    if (!target) return;
    try {
      await leaveGroup(target.groupId);
      showToast(`${GROUP_LABELS[selectedGroup]}에서 탈퇴했어요`);
      const data = await getMyGroups();
      setGroups(data);
      setSelectedGroup(0);
    } catch (err) {
      showToast(err.response?.data?.message || '탈퇴하지 못했어요');
    }
  }

  const current = groups[selectedGroup] ?? null;
  const inviteCode = current?.inviteCode;
  // 나를 포함한 전체 구성원 — 내가 맨 앞에 오도록 정렬
  const members = [...(current?.members ?? [])].sort((a, b) => {
    if (a.userId === myUserId) return -1;
    if (b.userId === myUserId) return 1;
    return 0;
  });

  // 아이폰 기본 공유 시트 (카카오톡/인스타그램/메시지 등) — 선택된 그룹의 실제 초대 코드 사용
  async function handleNativeShare() {
    if (!inviteCode) return;
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
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      showToast('초대 코드가 복사되었어요!');
    } catch { /* noop */ }
  }

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
        {GROUP_LABELS.map((label, i) => {
          const active = selectedGroup === i;
          const created = Boolean(groups[i]);
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
            {/* 구성원들 — 나 포함, 실제 캐릭터 색상/눈모양 + 닉네임 배지 (나는 초록 배지로 구분) */}
            {members.map(({ userId, nickname, bodyColor, eyeShape }) => {
              const isMe = userId === myUserId;
              return (
                <div
                  key={userId}
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
                  <CharacterAvatar
                    size={140}
                    style={{ marginTop: -8 }}
                    color={isMe ? (loadMyColor() || ENUM_TO_BODY_COLOR[bodyColor] || '#FFFFFF') : (ENUM_TO_BODY_COLOR[bodyColor] || '#FFFFFF')}
                    eyes={isMe ? (loadMyEyes() || ENUM_TO_EYE_SHAPE[eyeShape] || 'round') : (ENUM_TO_EYE_SHAPE[eyeShape] || 'round')}
                  />
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
                      backgroundColor: isMe ? '#1CD1A1' : '#2EE2B0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>
                      {isMe ? `나 (${myNickname || nickname || '닉네임 없음'})` : (nickname || '친구')}
                    </span>
                  </div>
                </div>
              );
            })}

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
