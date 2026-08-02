import React, { useState } from 'react';
import { Eye, X, ZoomIn, Sparkles } from 'lucide-react';

export const ThumbnailPreview: React.FC = () => {
  const [selectedImg, setSelectedImg] = useState<{ url: string; title: string } | null>(null);

  const samplePages = [
    { pageNum: 1, title: 'मुखपृष्ठ (Cover Page)', url: '/assets/pages/Page 1.jpg' },
    { pageNum: 2, title: 'श्री गणेश आरती', url: '/assets/pages/Page 2.jpg' },
    { pageNum: 3, title: 'श्री शंकाराची आरती', url: '/assets/pages/Page 3.jpg' },
    { pageNum: 4, title: 'श्री दुर्गेची आरती', url: '/assets/pages/Page 4.jpg' },
    { pageNum: 5, title: 'श्री विठ्ठलाची आरती', url: '/assets/pages/Page 5.jpg' },
    { pageNum: 6, title: 'श्री दत्ताची आरती', url: '/assets/pages/Page 6.jpg' },
    { pageNum: 7, title: 'घालीन लोटांगण', url: '/assets/pages/Page 7.jpg' },
  ];

  return (
    <section id="thumbnail-preview-section" className="py-8 px-4 max-w-6xl mx-auto">
      {/* Title */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 bg-[#FAF0D7] text-[#800000] px-3 py-1 rounded-full text-xs font-bold border border-[#D4AF37] mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" /> ५२ पानांचा संपूर्ण संग्रह
        </span>
        <h2 className="font-['Tiro_Devanagari_Marathi','Rozha_One',serif] text-2xl md:text-3xl text-[#800000] font-bold tracking-wide">
          आरती संग्रहाची झलक (Sample Pages)
        </h2>
        <p className="font-['Anek_Devanagari','Noto_Sans_Devanagari',sans-serif] text-xs md:text-sm text-[#665544] font-medium mt-1">
          इथे क्लिक करून आरती संग्रहाच्या पानांचे उच्च दर्जाचे लेआउट पहा
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-[#800000] via-[#FF9933] to-[#800000] mx-auto mt-2 rounded-full" />
      </div>

      {/* Thumbnails Grid (5-7 images) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
        {samplePages.map((item) => (
          <div
            key={item.pageNum}
            onClick={() => setSelectedImg({ url: item.url, title: item.title })}
            className="group relative bg-[#FFFDF8] border-2 border-[#D4AF37]/60 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#800000] transition-all cursor-pointer flex flex-col transform hover:-translate-y-1"
          >
            {/* Image container */}
            <div className="aspect-[1/1.5] w-full overflow-hidden bg-[#FAF6EE] relative">
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-[#800000]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="p-2 bg-[#FAF0D7] text-[#800000] rounded-full shadow-lg">
                  <ZoomIn className="w-5 h-5" />
                </span>
              </div>
            </div>

            {/* Caption */}
            <div className="p-2 text-center bg-[#FFFDF8] border-t border-[#D4AF37]/30">
              <p className="font-['Noto_Sans_Devanagari',sans-serif] text-[11px] md:text-xs font-bold text-[#3E2723] truncate">
                {item.title}
              </p>
              <span className="text-[10px] text-[#800000] font-semibold">पान {item.pageNum}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Zoom Modal */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedImg(null)}
        >
          <div
            className="bg-[#FFFDF8] border-2 border-[#D4AF37] rounded-2xl max-w-lg w-full p-4 relative shadow-2xl overflow-hidden flex flex-col items-center max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImg(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-[#FAF0D7] text-[#6B1212] hover:bg-[#F3E5AB] transition-colors z-10 shadow"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <h3 className="font-['Tiro_Devanagari_Marathi','Rozha_One',serif] font-bold text-lg text-[#800000] mb-3 pr-8">
              {selectedImg.title}
            </h3>

            {/* Image */}
            <div className="w-full overflow-auto rounded-xl border border-[#D4AF37] bg-[#FAF6EE] flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedImg.url}
                alt={selectedImg.title}
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>

            <p className="text-xs text-[#665544] mt-3 text-center font-medium">
              खालील भागात तुमचे नाव, फोटो आणि पत्ता आपोआप मुद्रित (Print) होईल.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
