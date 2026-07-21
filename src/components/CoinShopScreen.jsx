import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { hexToFilter } from './CategoryIcons';
import { getCoinPackages } from '../api/shop';
import coinIcon from '../assets/icon_coin.png';

// 코인 상품 — 서버 미가동 시 폴백 (명세: GET /shop/coins)
// TODO: 실제 앱스토어 인앱결제(IAP) 연동 시 결제 승인 콜백으로 handlePurchase 교체 — 명세에 구매 확정 API가 아직 없음
const FALLBACK_PRODUCTS = [
  { id: 'coin-10',  coins: 10,  bonus: 0,  price: '1,000원' },
  { id: 'coin-30',  coins: 30,  bonus: 0,  price: '3,000원' },
  { id: 'coin-50',  coins: 50,  bonus: 0,  price: '5,000원' },
  { id: 'coin-100', coins: 100, bonus: 10, price: '10,000원' },
  { id: 'coin-300', coins: 300, bonus: 50, price: '30,000원' },
];

function loadCoins() {
  try { return JSON.parse(localStorage.getItem('delta_coins') || '0'); } catch { return 0; }
}

export default function CoinShopScreen({ onBack }) {
  const [coins, setCoins] = useState(loadCoins);
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [pending, setPending] = useState(null); // 결제 시트에 표시할 상품
  const [toast, setToast] = useState(null);

  useEffect(() => {
    getCoinPackages()
      .then(data => {
        if (Array.isArray(data.packages) && data.packages.length) {
          setProducts(data.packages.map(p => ({
            id: p.packageId,
            coins: p.coinAmount,
            bonus: p.bonusCoin,
            price: `${p.price.toLocaleString('ko-KR')}원`,
          })));
        }
        if (typeof data.coinBalance === 'number') {
          setCoins(data.coinBalance);
          localStorage.setItem('delta_coins', JSON.stringify(data.coinBalance));
        }
      })
      .catch(() => {}); // 서버 미가동 — 폴백 상품 목록 유지
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  }

  // 모의 결제 승인 — TODO: 앱스토어 결제 승인 콜백으로 대체 (명세에 구매 확정 API 없음)
  function handlePurchase() {
    if (!pending) return;
    const total = pending.coins + pending.bonus;
    const next = coins + total;
    setCoins(next);
    localStorage.setItem('delta_coins', JSON.stringify(next));
    setPending(null);
    showToast(`코인 ${total}개가 지급되었어요!`);
  }

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

      {/* 헤딩 — 상점 화면과 동일 레이아웃 */}
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
        코인 상점
      </p>

      {/* 현재 보유 코인 (160x30, radius 100) */}
      <div
        style={{
          position: 'absolute',
          top: '66px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '160px',
          height: '30px',
          padding: '10px',
          borderRadius: '100px',
          backgroundColor: '#E8F8EF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          boxSizing: 'border-box',
        }}
      >
        <img
          src={coinIcon}
          alt="코인"
          draggable={false}
          style={{ width: 13, height: 13, objectFit: 'contain', filter: hexToFilter('#1CD1A1'), flexShrink: 0 }}
        />
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 600, color: '#1CD1A1', whiteSpace: 'nowrap' }}>
          현재 보유 코인: {coins}
        </span>
      </div>

      {/* 코인 구매 섹션 (350x343, radius 20) */}
      <div
        style={{
          position: 'absolute',
          top: '120px',
          left: '20px',
          width: '350px',
          height: '343px',
          borderRadius: '20px',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: '20px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {products.map(({ id, coins: amount, bonus, price }) => (
          <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            {/* 코인 수량 (좌) */}
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '16px', fontWeight: 500, color: '#1A1A1A' }}>
              {amount}
              {bonus > 0 && (
                <span style={{ color: '#1CD1A1' }}> +{bonus} 보너스</span>
              )}
              {' '}코인
            </span>

            {/* 결제 버튼 (우, 94x35) — 누르면 앱스토어 결제 화면 */}
            <button
              onClick={() => setPending({ id, coins: amount, bonus, price })}
              style={{
                width: '94px',
                height: '35px',
                padding: '10px',
                background: 'linear-gradient(90deg, #4ADDB8 0%, #34E8B6 100%)',
                borderRadius: '100px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                flexShrink: 0,
              }}
            >
              <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
                {price}
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* 하단 안내 */}
      <p
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
          left: '20px',
          right: '20px',
          fontFamily: 'Pretendard, sans-serif',
          fontSize: '12px',
          fontWeight: 500,
          color: '#999999',
          textAlign: 'center',
        }}
      >
        결제 시 앱스토어 계정으로 청구되며, 사용된 코인은 환불이 불가합니다.
      </p>

      {/* 앱스토어 결제 시트 (모의) — TODO: 실제 IAP 연동 시 교체 */}
      {pending && (
        <div
          onClick={() => setPending(null)}
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
            <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 500, color: '#999999', margin: 0, textAlign: 'center' }}>
              App Store
            </p>
            <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 16, fontWeight: 600, color: '#1A1A1A', margin: 0, textAlign: 'center' }}>
              델타 코인 {pending.coins}개
              {pending.bonus > 0 && <span style={{ color: '#1CD1A1' }}> +{pending.bonus} 보너스</span>}
            </p>
            <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 500, color: '#555555', margin: 0, textAlign: 'center' }}>
              {pending.price}
            </p>
            <button
              onClick={handlePurchase}
              style={{
                width: '100%',
                height: '52px',
                background: 'linear-gradient(90deg, #4ADDB8 0%, #34E8B6 100%)',
                borderRadius: '100px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Pretendard, sans-serif',
                fontSize: '15px',
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              결제하기
            </button>
            <button
              onClick={() => setPending(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Pretendard, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: '#999999',
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
