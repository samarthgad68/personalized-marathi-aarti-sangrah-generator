import React from 'react';
import { Flame, FileText, Image, Type, Printer, Download } from 'lucide-react';

export const FeatureSection: React.FC = () => {
  const features = [
    {
      icon: <Flame className="w-6 h-6 text-[#800000]" />,
      title: '21 आरत्या',
    },
    {
      icon: <FileText className="w-6 h-6 text-[#E65100]" />,
      title: '52 पेज',
    },
    {
      icon: <Image className="w-6 h-6 text-[#B8860B]" />,
      title: 'HD देवांचे फोटो',
    },
    {
      icon: <Type className="w-6 h-6 text-[#800000]" />,
      title: 'सुरेख वाचता येणारी मराठी अक्षरे',
    },
    {
      icon: <Printer className="w-6 h-6 text-[#E65100]" />,
      title: 'प्रिंट करता येणारी PDF',
    },
    {
      icon: <Download className="w-6 h-6 text-[#B8860B]" />,
      title: 'लगेच डाउनलोड करता येणारी PDF',
    },
  ];

  return (
    <section id="features-section" className="py-6 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-5">
        <h2 className="font-['Tiro_Devanagari_Marathi','Rozha_One',serif] text-2xl md:text-3xl text-[#800000] font-bold tracking-wide">
          आरती संग्रहाची प्रमुख वैशिष्ट्ये
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-[#800000] via-[#FF9933] to-[#800000] mx-auto mt-2 rounded-full" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {features.map((feat, idx) => (
          <div
            key={idx}
            className="bg-[#FFFDF8] border border-[#D4AF37]/50 rounded-xl p-3 text-center shadow-sm hover:shadow-md hover:border-[#800000] transition-all flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-full bg-[#FAF0D7] group-hover:bg-[#FF9933]/20 flex items-center justify-center transition-colors">
              {feat.icon}
            </div>
            <h3 className="font-['Noto_Sans_Devanagari',sans-serif] text-xs sm:text-sm font-bold text-[#3E2723] leading-snug">
              {feat.title}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
};
