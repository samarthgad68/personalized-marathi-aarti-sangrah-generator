import React from 'react';
import { Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header id="header-section" className="relative overflow-hidden bg-gradient-to-b from-[#800000] via-[#6B1212] to-[#540D0D] text-[#FAF6EE] pt-8 pb-12 px-4 shadow-xl border-b-4 border-[#D4AF37]">
      {/* Subtle Background Sacred Patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
        {/* Server Load Notice Banner */}
        <div className="mb-4 bg-[#6B1212] text-[#F3E5AB] px-3.5 py-1.5 rounded-full border border-[#D4AF37] text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 max-w-2xl mx-auto">
          <span className="w-2 h-2 rounded-full bg-[#FF9933] animate-ping shrink-0" />
          <span>सध्या सर्व्हरवर जास्त वापर असल्यामुळे PDF तयार होण्यासाठी थोडा वेळ लागू शकतो. कृपया Back जाऊ नका, Page Refresh करू नका आणि इंटरनेट कनेक्शन सुरू असल्याची खात्री करा.</span>
        </div>

        {/* Beautiful Ganpati Image Emblem */}
        <div className="mb-5 relative">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-[#FF9933] via-[#D4AF37] to-[#FFFDF8] p-2 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#6B1212] flex items-center justify-center border-2 border-[#D4AF37] overflow-hidden p-2">
              <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-28 md:h-28 fill-[#F3E5AB]">
                {/* Spiritual Detailed Ganesh Outline Vector */}
                <path d="M50,12 C36,12 26,24 26,38 C26,48 31,54 36,63 C39,70 41,78 41,85 C41,89 45,92 49,92 C53,92 56,88 56,84 C56,73 49,66 46,58 C43,50 41,43 46,33 C49,26 56,23 61,28 C64,31 66,36 66,43 C66,53 59,58 56,58 C53,58 51,56 51,53 C51,50 53,48 56,48 C59,48 61,50 61,53 C61,48 56,40 51,40 C46,40 43,46 43,53 C43,63 49,70 51,78 C53,86 51,90 49,90" fill="none" stroke="#F3E5AB" strokeWidth="4" strokeLinecap="round"/>
                <circle cx="38" cy="28" r="3.5" fill="#FF9933" />
                <circle cx="62" cy="28" r="3.5" fill="#FF9933" />
                <path d="M 45,18 L 55,18 M 50,12 L 50,25" stroke="#D4AF37" strokeWidth="2.5"/>
                <circle cx="50" cy="9" r="3" fill="#E65100"/>
                {/* Tilak Ornament */}
                <path d="M46,32 Q50,26 54,32 Q50,38 46,32 Z" fill="#FF9933"/>
              </svg>
            </div>
          </div>
          <span className="absolute -top-1 -right-1 bg-[#FF9933] text-[#6B1212] p-2 rounded-full shadow-lg">
            <Sparkles className="w-5 h-5 animate-spin" />
          </span>
        </div>

        {/* Top Calligraphy chant */}
        <h2 className="font-['Tiro_Devanagari_Marathi','Rozha_One',serif] text-2xl sm:text-3xl md:text-4xl text-[#F3E5AB] tracking-wider mb-2 drop-shadow-[0_2px_8px_rgba(255,153,51,0.5)] flex items-center justify-center gap-2">
          <span className="bg-gradient-to-r from-[#FFE899] via-[#F3E5AB] to-[#FF9933] bg-clip-text text-transparent font-extrabold">
            ॥ गणपती बाप्पा मोरया ॥
          </span>
        </h2>

        {/* Larger Prominent Heading */}
        <h1 className="font-['Tiro_Devanagari_Marathi','Rozha_One',serif] text-3xl sm:text-5xl md:text-6xl text-[#FF9933] font-extrabold tracking-wide my-3 drop-shadow-lg">
          गणेशोत्सवानिमित्त खास
        </h1>

        {/* Subheading */}
        <p className="font-['Anek_Devanagari','Noto_Sans_Devanagari',sans-serif] text-xl sm:text-2xl md:text-3xl text-[#FAF6EE] max-w-3xl leading-relaxed font-semibold mt-3">
          आपल्या नाव, फोटो व माहितीसह <span className="text-2xl sm:text-3xl md:text-4xl text-[#FF9933] font-extrabold underline decoration-[#D4AF37] decoration-2">वैयक्तिकृत ५२ पानांचा आरती संग्रह</span> मिळवा.
        </p>
      </div>
    </header>
  );
};
