import { useRef, useState } from 'react';
import { ArrowLeft, ImagePlus, Smartphone, Images, Sparkles, X } from 'lucide-react';

const steps = [
  {
    num: 1,
    text: '은행 앱에서 소비내역 화면 스크린샷하기',
    icon: <Smartphone size={20} className="text-gray" />,
  },
  {
    num: 2,
    text: '갤러리에서 해당 이미지 선택',
    icon: <Images size={20} className="text-gray" />,
  },
  {
    num: 3,
    text: 'AI가 자동으로 지출 분석 및 작성',
    icon: <Sparkles size={20} className="text-gray" />,
  },
];

export default function AIScanScreen({ onBack, onUpload }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  function handleRemove() {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="flex flex-col gap-8 px-3 pt-4 pb-16">
      {/* 타이틀 + 뒤로 가기 */}
      <div className="w-[90%] self-center relative text-center" style={{ marginTop: '20px' }}>
        <button
          onClick={onBack}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-1 active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} className="text-gray-800" />
        </button>
        <h1 style={{ fontSize: '20px' }} className="font-bold text-gray-900">
          계좌 내역을 분석해드려요!
        </h1>
        <p style={{ fontSize: '12px' }} className="text-gray-400 mt-1">
          스크린샷을 업로드하고 간편하게 소비를 기록하세요
        </p>
      </div>

      {/* 숨김 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 업로드 박스 */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="bg-[#FFFFFF] rounded-[40px] flex flex-col items-center justify-center py-14 gap-2 w-80 h-70 self-center active:scale-[0.98] transition-transform overflow-hidden relative"
        style={{
          backgroundImage: preview
            ? 'none'
            : "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='40' ry='40' stroke='%232ECC71' stroke-width='8' stroke-dasharray='10%2c 12' stroke-linecap='auto'/%3e%3c/svg%3e\")",
        }}
      >
        {preview ? (
          <>
            <img src={preview} alt="선택된 이미지" className="w-full h-full object-cover" />
            <button
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              className="absolute top-3 right-3 bg-black/50 rounded-full p-1"
            >
              <X size={16} className="text-white" />
            </button>
          </>
        ) : (
          <>
            <ImagePlus size={64} className="text-[#2ECC71]" strokeWidth={1.5} />
            <p style={{ fontSize: '18px' }} className="font-semibold text-[#27AE60]">
              여기를 눌러 이미지 선택
            </p>
            <p style={{ fontSize: '12px' }} className="text-gray-400">
              또는 파일을 여기로 끌어다 놓으세요
            </p>
          </>
        )}
      </button>

      {/* 가이드라인 */}
      <div className="flex flex-col gap-2 w-[85%] self-center">
        {steps.map(({ num, text, icon }) => (
          <div
            key={num}
            className="flex items-center gap-3 rounded-4xl bg-gray-100 border border-gray-100"
            style={{ padding: 8 }}
          >
            <div className="w-8 h-8 rounded-4xl bg-gray-300 flex items-center justify-center font-bold text-white flex-shrink-0">
              {num}
            </div>
            <p className="flex-1 text-sm font-semibold text-gray-900">{text}</p>
            <div className="w-10 h-10 rounded-4xl flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
          </div>
        ))}
      </div>

      {/* 업로드 버튼 */}
      <button
        onClick={onUpload}
        className="bg-[#2ECC71] rounded-4xl py-4 w-[85%] h-12 self-center active:scale-95 transition-transform"
        style={{ fontSize: '15px', marginBottom: '20px' }}
      >
        <span className="text-[#FFFFFF] font-bold">업로드 하기</span>
      </button>
    </div>
  );
}
