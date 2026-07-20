import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import CharacterAvatar from './CharacterAvatar';
import { hexToFilter } from './CategoryIcons';
import { updateCharacter } from '../api/user';
import coinIcon from '../assets/icon_coin.png';
import storeMenuIcon from '../assets/store_menu.png';
import storePaletteIcon from '../assets/store_palette.png';
import storeShirtsIcon from '../assets/store_shirts.png';
import storePantsIcon from '../assets/store_pants.png';
import storeEyewearsIcon from '../assets/store_eyewears.png';
import storeHeadwearsIcon from '../assets/store_headwears.png';
import itemGlasses from '../assets/store_glasses.png';
import itemRibbons from '../assets/store_ribbons.png';
import itemBowtie from '../assets/store_bowtie.png';
import itemLuckybag from '../assets/store_luckybag.png';
import itemFlowers from '../assets/store_flowers.png';
import itemMuffler from '../assets/store_muffler.png';
import itemCash from '../assets/store_cash.png';
import itemStars from '../assets/store_stars.png';
import itemCoins from '../assets/store_coins.png';
import eyesRound from '../assets/eyes_01_round.png';
import eyesWink from '../assets/eyes_02_wink.png';
import eyesMixed from '../assets/eyes_03_mixed.png';
import eyesClosed from '../assets/eyes_04_closed.png';
import eyesCross from '../assets/eyes_05_cross.png';
import eyesHeart from '../assets/eyes_06_heart.png';

// 기본 몸통 색상 — 온보딩 팔레트와 동일, 무료 보유
const BASIC_COLORS = ['#FFFFFF', '#FFD1DC', '#E0C3FC', '#CAF0F8', '#FFECD2', '#AAF0D1', '#FBC4AB', '#98F5E1'];

const EYE_OPTIONS = [
  { id: 'round',  src: eyesRound },
  { id: 'wink',   src: eyesWink },
  { id: 'mixed',  src: eyesMixed },
  { id: 'closed', src: eyesClosed },
  { id: 'cross',  src: eyesCross },
  { id: 'heart',  src: eyesHeart },
];

// 상품 카테고리 (메뉴 / 팔레트 / 상의 / 하의 / 안경 / 모자) — 벡터 기준 18x18, 메뉴만 48x48
// 메뉴 아이콘은 내부 벡터가 #FFFFFF로 유지돼야 하므로 착색 필터를 적용하지 않음
const CATEGORIES = [
  { id: 'menu',      icon: storeMenuIcon, size: 48, keepColor: true },
  { id: 'palette',   icon: storePaletteIcon, size: 18 },
  { id: 'shirts',    icon: storeShirtsIcon, size: 18 },
  { id: 'pants',     icon: storePantsIcon, size: 18 },
  { id: 'eyewears',  icon: storeEyewearsIcon, size: 18 },
  { id: 'headwears', icon: storeHeadwearsIcon, size: 18 },
];

// 판매 상품 — 최저 10코인 ~ 최고 30코인 (TODO: 백엔드 연동 시 API로 대체)
// wear: 착용 미리보기 오버레이 — 위치/크기(캐릭터 크기 대비 비율) + 착용감을 위한 변형 (카탈로그 이미지는 원본 유지)
const STORE_ITEMS = [
  { id: 'glasses',  src: itemGlasses,  price: 10, category: 'eyewears',  wear: { left: 0.31, top: 0.40, w: 0.38 } },
  { id: 'ribbons',  src: itemRibbons,  price: 12, category: 'headwears', wear: { left: 0.55, top: 0.27, w: 0.22, transform: 'rotate(18deg)' } },
  { id: 'bowtie',   src: itemBowtie,   price: 15, category: 'shirts',    wear: { left: 0.385, top: 0.66, w: 0.23 } },
  { id: 'luckybag', src: itemLuckybag, price: 15, category: 'pants',     wear: { left: 0.67, top: 0.56, w: 0.26, transform: 'rotate(-12deg)' } },
  { id: 'flowers',  src: itemFlowers,  price: 18, category: 'headwears', wear: { left: 0.28, top: 0.28, w: 0.44, transform: 'rotate(-3deg) scaleY(0.85)' } },
  { id: 'muffler',  src: itemMuffler,  price: 20, category: 'shirts',    wear: { left: 0.26, top: 0.60, w: 0.48, transform: 'rotate(-4deg)' } },
  { id: 'cash',     src: itemCash,     price: 22, category: 'pants',     wear: { left: 0.07, top: 0.60, w: 0.28, transform: 'rotate(-18deg)' } },
  { id: 'stars',    src: itemStars,    price: 25, category: 'headwears', wear: { left: 0.62, top: 0.30, w: 0.28 } },
  { id: 'coins',    src: itemCoins,    price: 30, category: 'pants',     wear: { left: 0.63, top: 0.66, w: 0.20, transform: 'rotate(10deg)' } },
];

const TABS = [
  { id: 'shop',  label: '코인 상점' },
  { id: 'items', label: '내 아이템' },
];

function loadCoins() {
  try { return JSON.parse(localStorage.getItem('delta_coins') || '0'); } catch { return 0; }
}

export default function StoreScreen({ onBack, onCoinShop }) {
  const [tab, setTab] = useState('shop');
  const [category, setCategory] = useState('menu');
  // 착용 미리보기 — 카테고리당 1개 { category: itemId }
  const [worn, setWorn] = useState({});
  const [coins] = useState(loadCoins);
  const [color, setColor] = useState(() => {
    try { return localStorage.getItem('delta_character_color') || '#FFFFFF'; } catch { return '#FFFFFF'; }
  });
  const [eyes, setEyes] = useState(() => {
    try { return localStorage.getItem('delta_character_eyes') || 'round'; } catch { return 'round'; }
  });

  function equipColor(c) {
    setColor(c);
    localStorage.setItem('delta_character_color', c);
    // 서버 캐릭터 정보 동기화 — 실패 시 로컬만 유지
    updateCharacter({ color: c }).catch(() => {});
  }

  function equipEyes(id) {
    setEyes(id);
    localStorage.setItem('delta_character_eyes', id);
    updateCharacter({ eyes: id }).catch(() => {});
  }

  // 아이템 착용 토글 — 같은 카테고리는 1개만 (다시 누르면 벗기)
  function toggleWear(item) {
    setWorn(prev => ({
      ...prev,
      [item.category]: prev[item.category] === item.id ? null : item.id,
    }));
  }

  const wornItems = STORE_ITEMS.filter(item => worn[item.category] === item.id);
  const gridItems = category === 'menu' ? STORE_ITEMS : STORE_ITEMS.filter(item => item.category === category);

  return (
    <div
      className="bg-white"
      style={{ width: '390px', minHeight: '940px', position: 'relative' }}
    >
      {/* 뒤로가기 */}
      <button
        onClick={onBack}
        className="active:scale-90 transition-transform"
        style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', cursor: 'pointer', padding: 4, zIndex: 2 }}
      >
        <ArrowLeft size={22} color="#1A1A1A" />
      </button>

      {/* 헤딩 — 화면 최상단 중앙 */}
      <p
        style={{
          position: 'absolute',
          top: '20px',
          left: 0,
          right: 0,
          fontFamily: 'Pretendard, sans-serif',
          fontSize: '18px',
          fontWeight: 600,
          color: '#1A1A1A',
          lineHeight: '22px',
          textAlign: 'center',
        }}
      >
        상점
      </p>

      {/* 코인 잔액 — 헤딩과 같은 y축, 화면 우측 (누르면 코인 상점) */}
      <button
        onClick={onCoinShop}
        className="active:scale-90 transition-transform"
        style={{ position: 'absolute', top: '20px', right: '20px', height: '22px', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <img
          src={coinIcon}
          alt="코인"
          draggable={false}
          style={{ width: 15, height: 15, objectFit: 'contain', filter: hexToFilter('#555555') }}
        />
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', fontWeight: 600, color: '#555555' }}>
          {coins}
        </span>
      </button>

      {/* 내 캐릭터 (x60 y120, 272x272) — 온보딩 커스텀 + 착용 미리보기 오버레이 */}
      <div style={{ position: 'absolute', top: '120px', left: '60px', width: '272px', height: '272px' }}>
        <CharacterAvatar size={272} color={color} eyes={eyes} />
        {wornItems.map(({ id, src, wear }) => (
          <img
            key={id}
            src={src}
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              left: `${wear.left * 272}px`,
              top: `${wear.top * 272}px`,
              width: `${wear.w * 272}px`,
              objectFit: 'contain',
              pointerEvents: 'none',
              transform: wear.transform,
              transformOrigin: 'center',
            }}
          />
        ))}
      </div>

      {/* 코인 상점 / 내 아이템 탭 (x20 y393) */}
      <div style={{ position: 'absolute', top: '393px', left: '20px', display: 'flex', gap: '20px' }}>
        {TABS.map(({ id, label }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'Pretendard, sans-serif',
                fontSize: '18px',
                fontWeight: active ? 600 : 500,
                color: active ? '#1CD1A1' : 'rgba(61, 74, 62, 0.3)', // #3D4A3E 30%
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {tab === 'shop' ? (
        <>
          {/* 상품 카테고리 */}
          <div
            style={{
              position: 'absolute',
              top: '445px',
              left: '23.5px',
              width: '343px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {CATEGORIES.map(({ id, icon, size, keepColor }) => {
              const active = category === id;
              return (
                <button
                  key={id}
                  onClick={() => setCategory(id)}
                  className="active:scale-90 transition-transform"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <img
                    src={icon}
                    alt={id}
                    draggable={false}
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      objectFit: 'contain',
                      // 메뉴 아이콘: 흰 벡터 유지 — 비활성 시 회색조만 적용
                      filter: keepColor
                        ? (active ? 'none' : 'grayscale(1) brightness(1.15)')
                        : hexToFilter(active ? '#1CD1A1' : '#D1D1D1'),
                    }}
                  />
                </button>
              );
            })}
          </div>

          {category === 'palette' ? (
            /* 팔레트 — 온보딩과 같은 몸통 색상 선택 */
            <div
              style={{
                position: 'absolute',
                top: '518.88px',
                left: '23.5px',
                width: '343px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 66px)',
                justifyContent: 'space-between',
                rowGap: '18px',
              }}
            >
              {BASIC_COLORS.map((c) => {
                const selected = color === c;
                return (
                  <button
                    key={c}
                    onClick={() => equipColor(c)}
                    aria-label={`색상 ${c}`}
                    style={{
                      width: '66px',
                      height: '66px',
                      borderRadius: '50%',
                      border: selected ? '3px solid #1CD1A1' : '1px solid #EAEAEA',
                      background: c,
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    }}
                  />
                );
              })}
            </div>
          ) : (
            /* 아이템 그리드 (y518.88, 343x384, 3열 / 상하 gap 9, 좌우 gap 7) — 클릭 시 착용 미리보기 */
            <div
              style={{
                position: 'absolute',
                top: '518.88px',
                left: '23.5px',
                width: '343px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 109px)',
                columnGap: '7px',
                rowGap: '9px',
              }}
            >
              {gridItems.map((item) => {
                const isWorn = worn[item.category] === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleWear(item)}
                    style={{
                      width: '109px',
                      height: '122px',
                      borderRadius: '15px',
                      backgroundColor: '#FFFFFF',
                      border: isWorn ? '2px solid #1CD1A1' : 'none',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.10)',
                      position: 'relative',
                      cursor: 'pointer',
                      padding: 0,
                      boxSizing: 'border-box',
                    }}
                  >
                    <img
                      src={item.src}
                      alt={item.id}
                      draggable={false}
                      style={{
                        position: 'absolute',
                        top: '14px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        maxWidth: '72px',
                        maxHeight: '66px',
                        objectFit: 'contain',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: 0,
                        right: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px',
                      }}
                    >
                      <img
                        src={coinIcon}
                        alt="코인"
                        draggable={false}
                        style={{ width: 12, height: 12, objectFit: 'contain', filter: hexToFilter('#1CD1A1') }}
                      />
                      <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 600, color: '#1CD1A1' }}>
                        {item.price}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* ── 내 아이템 — 몸통 색상 / 눈 모양 변경 ────────────────────── */
        <div style={{ position: 'absolute', top: '445px', left: '23.5px', width: '343px' }}>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '16px', fontWeight: 600, color: '#1A1A1A', marginBottom: '12px' }}>
            몸통 색상
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {BASIC_COLORS.map((c) => {
              const selected = color === c;
              return (
                <button
                  key={c}
                  onClick={() => equipColor(c)}
                  aria-label={`색상 ${c}`}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    border: selected ? '3px solid #1CD1A1' : '1px solid #EAEAEA',
                    background: c,
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                  }}
                />
              );
            })}
          </div>

          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '16px', fontWeight: 600, color: '#1A1A1A', margin: '24px 0 12px' }}>
            눈 모양
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {EYE_OPTIONS.map(({ id, src }) => {
              const selected = eyes === id;
              return (
                <button
                  key={id}
                  onClick={() => equipEyes(id)}
                  aria-label={`눈 ${id}`}
                  style={{
                    width: '72px',
                    height: '52px',
                    borderRadius: '12px',
                    border: selected ? '2px solid #1CD1A1' : '1px solid #EAEAEA',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  <img src={src} alt="" draggable={false} style={{ width: '40px', height: '18px', objectFit: 'contain' }} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
