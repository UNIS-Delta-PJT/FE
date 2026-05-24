import { useEffect } from 'react';
import logoImg from '../assets/logo.png';

export default function SplashScreen({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="flex flex-col items-center justify-center bg-white" style={{ minHeight: '844px' }}>
      {/* 로고 */}
      <img src={logoImg} alt="DELTA" style={{ width: '85px', height: '76.4px', objectFit: 'contain' }} />
    </div>
  );
}
