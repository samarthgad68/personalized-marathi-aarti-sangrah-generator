import React, { useState } from 'react';
import { UserFormData, PolicyType } from '../types';
import { NoteSection } from './NoteSection';
import { FormSection } from './FormSection';
import { PreviewSection } from './PreviewSection';
import { Footer } from './Footer';
import { PaymentModal } from './PaymentModal';
import { generatePDFWithSession } from '../services/api';
import { Sparkles, Home, CheckCircle2, ArrowLeft } from 'lucide-react';

interface GeneratorPageProps {
  sessionToken: string | null;
  onGoHome: () => void;
  onOpenPolicy: (type: PolicyType) => void;
}

export const GeneratorPage: React.FC<GeneratorPageProps> = ({
  sessionToken,
  onGoHome,
  onOpenPolicy,
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    businessName: 'श्री गणेश ज्वेलर्स',
    proprietorName: 'श्री. महेश जोशी',
    address: 'दुकान क्र. ४, लक्ष्मी रोड, पुणे',
    mobileNumber: '9876543210',
    photoUrl: undefined,
    photoFile: null,
  });

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const scrollToPreview = () => {
    const el = document.getElementById('preview-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGeneratePdf = async () => {
    // If session token exists, generate PDF directly!
    if (sessionToken) {
      setIsGenerating(true);
      setGenerateError(null);
      try {
        await generatePDFWithSession(sessionToken, {
          businessName: formData.businessName,
          proprietorName: formData.proprietorName,
          address: formData.address,
          mobileNumber: formData.mobileNumber,
          photoUrl: formData.photoUrl,
        });
      } catch (err: any) {
        console.error('Generation error:', err);
        setGenerateError(err.message || 'PDF तयार करताना त्रुटी आली.');
      } finally {
        setIsGenerating(false);
      }
    } else {
      // If user came directly without payment, open payment modal
      setIsPaymentOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#3E2723] font-['Noto_Sans_Devanagari',sans-serif] flex flex-col justify-between">
      <div>
        {/* Top Minimal Navigation Bar */}
        <div className="bg-[#800000] text-[#FAF6EE] py-3 px-4 border-b-2 border-[#D4AF37] shadow-md mb-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={onGoHome}
              className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-[#F3E5AB] hover:text-[#FF9933] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>मुख्य पृष्ठ (Home)</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="font-['Tiro_Devanagari_Marathi',serif] font-bold text-sm md:text-base text-[#FF9933]">
                वैयक्तिकृत आरती संग्रह जनरेटर
              </span>
            </div>

            {sessionToken && (
              <span className="inline-flex items-center gap-1 bg-green-800 text-green-100 text-[11px] font-bold px-2.5 py-1 rounded-full border border-green-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-300" />
                पेमेंट पूर्ण ✓
              </span>
            )}
          </div>
        </div>

        {/* 1. Important Note Section */}
        <NoteSection />

        {/* Error notification if direct generate fails */}
        {generateError && (
          <div className="px-4 max-w-4xl mx-auto mb-4">
            <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded-xl text-xs md:text-sm font-semibold flex items-center justify-between">
              <span>{generateError}</span>
              <button
                onClick={() => setGenerateError(null)}
                className="text-red-900 font-bold underline"
              >
                बंद करा
              </button>
            </div>
          </div>
        )}

        {/* Generating Overlay Indicator */}
        {isGenerating && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#FFFDF8] border-2 border-[#D4AF37] rounded-2xl p-6 text-center max-w-sm w-full shadow-2xl">
              <div className="w-12 h-12 border-4 border-[#800000] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <h4 className="font-['Tiro_Devanagari_Marathi',serif] font-bold text-lg text-[#800000]">
                तुमची ५२ पानांची आरती संग्रह PDF तयार होत आहे...
              </h4>
              <p className="text-xs text-[#665544] mt-1 font-medium">
                कृपया थोडा वेळ थांबा, PDF आपोआप डाउनलोड होईल.
              </p>
            </div>
          </div>
        )}

        {/* 2. Complete Form Section & Photo Upload */}
        <FormSection
          formData={formData}
          setFormData={setFormData}
          onPreview={scrollToPreview}
          onGeneratePdf={handleGeneratePdf}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
        />

        {/* 3. Preview Section */}
        <PreviewSection
          formData={formData}
          onGeneratePdf={handleGeneratePdf}
        />
      </div>

      {/* Footer */}
      <Footer onOpenPolicy={onOpenPolicy} />

      {/* Payment Modal Fallback (If accessed without session) */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        formData={formData}
      />
    </div>
  );
};
