import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ThumbnailFrameProps {
  index: number;
}

const ThumbnailFrame: React.FC<ThumbnailFrameProps> = ({ index }) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const [candidateIdx, setCandidateIdx] = useState(0);

  const candidatePaths = [
    `/assets/thumbnails/${index}.jpg`,
    `/assets/thumbnails/thumb${index}.jpg`,
    `/assets/thumbnails/Page ${index}.jpg`,
    `/assets/thumbnails/${index}.png`,
    `/assets/thumbnails/thumb${index}.png`,
  ];

  const handleImgError = () => {
    if (candidateIdx < candidatePaths.length - 1) {
      setCandidateIdx((prev) => prev + 1);
    } else {
      setImageState('failed');
    }
  };

  const handleImgLoad = () => {
    setImageState('loaded');
  };

  return (
    <div className="bg-[#FFFDF8] border-2 border-[#D4AF37]/60 hover:border-[#800000] rounded-xl p-2 shadow-md transition-all group flex flex-col items-center">
      <div className="w-full aspect-[9/16] rounded-lg bg-[#FAF0D7]/40 border border-[#D4AF37]/30 flex items-center justify-center relative overflow-hidden">
        {imageState !== 'failed' && (
          <img
            src={candidatePaths[candidateIdx]}
            alt={`आरती संग्रह झलक ${index}`}
            onLoad={handleImgLoad}
            onError={handleImgError}
            className={`w-full h-full object-contain rounded-lg transition-opacity duration-300 ${
              imageState === 'loaded' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
          />
        )}

        {imageState !== 'loaded' && (
          <div className="flex flex-col items-center justify-center p-3 text-center space-y-1.5">
            <div className="w-10 h-10 rounded-full bg-[#FAF0D7] border border-[#D4AF37] flex items-center justify-center text-[#800000] shadow-inner group-hover:scale-105 transition-transform">
              <ImageIcon className="w-5 h-5 text-[#800000]" />
            </div>
            <span className="font-['Tiro_Devanagari_Marathi','Rozha_One',serif] font-bold text-xs text-[#800000]">
              झलक {index}
            </span>
            <span className="text-[10px] text-[#665544] font-medium font-['Noto_Sans_Devanagari',sans-serif]">
              फोटो फ्रेम {index}
            </span>
          </div>
        )}
      </div>
      <div className="mt-2 text-center">
        <span className="font-['Anek_Devanagari','Noto_Sans_Devanagari',sans-serif] text-xs font-bold text-[#6B1212]">
          पृष्ठ {index}
        </span>
      </div>
    </div>
  );
};

export const ThumbnailPreview: React.FC = () => {
  return (
    <section id="thumbnails-section" className="py-8 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="font-['Tiro_Devanagari_Marathi','Rozha_One',serif] text-2xl md:text-3xl text-[#800000] font-bold tracking-wide">
          आरती संग्रहाची झलक
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-[#800000] via-[#FF9933] to-[#800000] mx-auto mt-2 rounded-full" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
          <ThumbnailFrame key={num} index={num} />
        ))}
      </div>
    </section>
  );
};
