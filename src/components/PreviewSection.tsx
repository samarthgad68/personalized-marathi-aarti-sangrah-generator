import React from 'react';
import { UserFormData } from '../types';
import { Eye, Image as ImageIcon, FileCheck } from 'lucide-react';

interface PreviewSectionProps {
  formData: UserFormData;
  onGeneratePdf: () => void;
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({ formData, onGeneratePdf }) => {
  return (
    <section id="preview-section" className="px-4 max-w-4xl mx-auto mb-12">
      <div className="bg-[#FFFDF8] border-2 border-[#D4AF37] rounded-2xl p-4 md:p-6 shadow-2xl">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b-2 border-[#FAF0D7] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#800000] text-[#F3E5AB] flex items-center justify-center font-bold text-sm">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Tiro_Devanagari_Marathi','Rozha_One',serif] text-lg md:text-xl text-[#800000] font-bold">
                आरती संग्रह पूर्वदृश्य (Page 1 Preview)
              </h3>
              <p className="font-['Anek_Devanagari','Noto_Sans_Devanagari',sans-serif] text-xs text-[#665544] font-semibold">
                तुम्ही भरलेली माहिती ५२ पानांच्या आरती संग्रहावर खालीलप्रमाणे दिसेल.
              </p>
            </div>
          </div>
          <span className="bg-[#800000] text-[#F3E5AB] text-xs font-bold px-3 py-1 rounded-full border border-[#D4AF37]">
            Page 1 / 52
          </span>
        </div>

        {/* PREVIEW CANVAS CONTAINER (Aspect Ratio 9:16 representing 1080x1920) */}
        <div className="@container w-full max-w-sm sm:max-w-md mx-auto bg-[#FAF6EE] border-2 border-[#800000] rounded-xl shadow-2xl overflow-hidden relative aspect-[9/16]">
          
          {/* Background Image: Page 1.jpg */}
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/pages/Page%201.jpg"
              alt="Page 1 Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.fallbackTried) {
                  target.dataset.fallbackTried = 'true';
                  target.src = '/assets/pages/Page%2001.jpg';
                }
              }}
              referrerPolicy="no-referrer"
            />
          </div>

          {/* BOTTOM PERSONALIZED SECTION (Bottom 450px of 1080x1920 = ~23.4% height) */}
          <div className="absolute bottom-0 left-0 right-0 h-[23.4%] flex items-center justify-between px-2 sm:px-3 py-1 sm:py-2 z-10">
            
            {/* LEFT SIDE: Center Aligned 4 Text Lines (65% width) - Vertically centered, larger text area */}
            <div className="w-[65%] h-full flex flex-col justify-center items-center text-center px-1 sm:px-1.5 min-w-0 py-0.5 gap-[0.45cqw] my-auto overflow-hidden">
              {/* Line 1: Red/Maroon (#d20202), Bold, Center Aligned */}
              <h4 
                className="font-['Noto_Sans_Devanagari',sans-serif] font-bold text-[#d20202] w-full leading-[1.22] break-words text-center"
                style={{ 
                  fontSize: (formData.businessName || '').length > 35 
                    ? '4.91cqw' 
                    : (formData.businessName || '').length > 22 
                    ? '6.02cqw' 
                    : '7.59cqw' 
                }}
              >
                {formData.businessName || 'नाव / व्यवसायाचे नाव'}
              </h4>

              {/* Line 2: Bold, Black, Center Aligned */}
              <p 
                className="font-['Noto_Sans_Devanagari',sans-serif] font-bold text-black w-full leading-[1.22] break-words text-center"
                style={{ 
                  fontSize: (formData.proprietorName || '').length > 35 
                    ? '4.24cqw' 
                    : (formData.proprietorName || '').length > 22 
                    ? '5.13cqw' 
                    : '6.25cqw' 
                }}
              >
                {formData.proprietorName || 'प्रोप्रायटर / हुद्दा'}
              </p>

              {/* Line 3: Semibold, Black, Center Aligned */}
              <p 
                className="font-['Noto_Sans_Devanagari',sans-serif] font-semibold text-black w-full leading-[1.22] break-words text-center"
                style={{ 
                  fontSize: (formData.address || '').length > 40 
                    ? '3.80cqw' 
                    : (formData.address || '').length > 25 
                    ? '4.46cqw' 
                    : '5.35cqw' 
                }}
              >
                {formData.address || 'पत्ता / इतर माहिती'}
              </p>

              {/* Line 4: Semibold, Black, Center Aligned */}
              <p 
                className="font-['Noto_Sans_Devanagari',sans-serif] font-semibold text-black w-full leading-[1.22] break-words text-center"
                style={{ 
                  fontSize: (formData.mobileNumber || '').length > 20 
                    ? '3.56cqw' 
                    : (formData.mobileNumber || '').length > 14 
                    ? '4.24cqw' 
                    : '5.13cqw' 
                }}
              >
                {formData.mobileNumber ? `मो. ${formData.mobileNumber}` : 'मोबाईल नंबर'}
              </p>
            </div>

            {/* RIGHT SIDE: Customer Photo Frame (35% width - increased 10px towards inside) */}
            <div className="w-[35%] h-full rounded-lg border-2 border-[#D4AF37] bg-[#FAF6EE] overflow-hidden flex items-center justify-center relative shadow-inner">
              {formData.photoUrl ? (
                <img
                  src={formData.photoUrl}
                  alt="Customer Photo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center p-1">
                  <ImageIcon className="w-5 h-5 text-[#D4AF37] mx-auto mb-0.5" />
                  <span className="text-[9px] font-bold text-[#B8860B] block leading-tight">
                    फोटो स्थान
                  </span>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Action Prompt */}
        <div className="mt-6 text-center">
          <p className="text-xs sm:text-sm text-[#3E2723] mb-3 font-medium">
            पूर्वदृश्य पसंत पडल्यास खालील बटणावर क्लिक करून संपूर्ण ५२ पानांची PDF मिळवा.
          </p>

          <button
            onClick={onGeneratePdf}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#FF6600] hover:bg-[#E65C00] text-white font-['Noto_Sans_Devanagari',sans-serif] font-bold text-base md:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <FileCheck className="w-5 h-5 text-white" />
            PDF तयार करा (Generate PDF - ₹99)
          </button>
        </div>
      </div>
    </section>
  );
};
