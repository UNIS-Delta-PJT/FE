import { useState, useRef } from 'react';
import trophyImg from '../assets/trophy.png';

const CARD_W = 280;
const GAP = 12;

const CARDS = [
  { bg: '#1CD1A1', dotFilled: '#14A67E' }, // dot은 bg 대비를 위한 브랜드 그린 다크 셰이드
  { bg: '#FED023', dotFilled: 'rgba(115,92,0,0.5)' },
];

const LABEL = '주간 목표';
const TITLE = '알뜰 소비 챌린지';
const BODY = '벌써 4일째 예산을 잘 지키고 있어요!\n3일만 더 유지하면 보너스 코인을 받아요';

export default function WeeklyGoal() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  function handleScroll() {
    if (!scrollRef.current) return;
    const { scrollLeft } = scrollRef.current;
    const idx = Math.min(
      Math.max(Math.round(scrollLeft / (CARD_W + GAP)), 0),
      CARDS.length - 1
    );
    setActiveIndex(idx);
  }

  return (
    <div style={{ width: '100%' }}>
      {/* 헤딩 */}
      <p style={{
        fontFamily: 'Pretendard, sans-serif',
        fontSize: 24,
        fontWeight: 700,
        color: '#1A1A1A',
        margin: '0 0 12px 18.5px',
      }}>
        도전할 수 있는 미션
      </p>

      {/* 슬라이더 */}
      <div
        ref={scrollRef}
        className="no-scrollbar"
        style={{
          display: 'flex',
          gap: GAP,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          paddingLeft: 18.5,
          paddingRight: 18.5,
        }}
        onScroll={handleScroll}
      >
        {CARDS.map((card, idx) => (
          <div
            key={idx}
            style={{
              width: CARD_W,
              height: 160,
              flexShrink: 0,
              scrollSnapAlign: 'start',
              backgroundColor: card.bg,
              borderRadius: 20,
              padding: 19,
              position: 'relative',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            {/* 텍스트 블록 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              height: '100%',
              paddingBottom: 20,
            }}>
              <p style={{
                fontFamily: 'Pretendard, sans-serif',
                fontSize: 10,
                fontWeight: 500,
                color: '#FFFFFF',
                margin: 0,
                lineHeight: 1.3,
              }}>
                {LABEL}
              </p>
              <p style={{
                fontFamily: 'Pretendard, sans-serif',
                fontSize: 16,
                fontWeight: 600,
                color: '#FFFFFF',
                margin: '4px 0 0',
                lineHeight: 1.3,
              }}>
                {TITLE}
              </p>
              <p style={{
                fontFamily: 'Pretendard, sans-serif',
                fontSize: 12,
                fontWeight: 500,
                color: '#FFFFFF',
                margin: '6px 0 0',
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
              }}>
                {BODY}
              </p>
            </div>

            {/* 도트 인디케이터 */}
            <div style={{ display: 'flex', gap: 5, position: 'absolute', bottom: 19, left: 19 }}>
              {CARDS.map((_, dotIdx) => (
                <div
                  key={dotIdx}
                  style={{
                    width: 6.5,
                    height: 6.5,
                    borderRadius: '50%',
                    backgroundColor: dotIdx <= activeIndex
                      ? card.dotFilled
                      : 'rgba(255,255,255,0.2)',
                    transition: 'background-color 0.3s ease',
                  }}
                />
              ))}
            </div>

            {/* 트로피 이미지 */}
            <img
              src={trophyImg}
              alt="trophy"
              draggable={false}
              style={{
                position: 'absolute',
                left: 210,
                top: 90,
                width: 75,
                height: 75,
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
