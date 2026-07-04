import { useEffect } from 'react';
import logoImg from '../assets/onboarding_logo.png';

export default function SplashScreen({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="flex flex-col items-center justify-center bg-white" style={{ minHeight: '844px' }}>
      {/* 로고 */}
      <img src={logoImg} alt="DELTA" style={{ width: '85px', height: '77px', objectFit: 'contain' }} />
    </div>
  );
}
