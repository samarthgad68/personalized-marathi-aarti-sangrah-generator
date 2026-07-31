import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const NoteSection: React.FC = () => {
  return (
    <section id="note-section" className="px-4 max-w-4xl mx-auto mb-6">
      <div className="bg-gradient-to-r from-[#FFF8E7] via-[#FFFDF8] to-[#FFF8E7] border-2 border-[#FF9933] rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 text-[#FF9933]/10 pointer-events-none">
          <AlertTriangle className="w-32 h-32" />
        </div>

        <div className="flex items-start gap-3 relative z-10">
          <div className="p-2 rounded-lg bg-[#FF9933] text-[#6B1212] shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <h4 className="font-['Tiro_Devanagari_Marathi','Rozha_One',serif] text-[#6B1212] text-base md:text-lg flex items-center gap-2 font-bold">
              महत्त्वाची सूचना (Important Note)
            </h4>
            <ul className="text-xs md:text-sm text-[#3E2723] space-y-1 font-['Anek_Devanagari','Noto_Sans_Devanagari',sans-serif] font-medium list-disc list-inside">
              <li className="text-[#800000] font-bold">
                कृपया सर्व माहिती स्पेलिंग तपासून अचूक भरा.
              </li>
              <li className="text-[#3E2723] font-semibold">
                PDF तयार झाल्यानंतर माहिती किंवा फोटो बदलता येणार नाही.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
