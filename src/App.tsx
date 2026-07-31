import React, { useState } from 'react';
import { UserFormData, PolicyType } from './types';
import { Header } from './components/Header';
import { FeatureSection } from './components/FeatureSection';
import { NoteSection } from './components/NoteSection';
import { FormSection } from './components/FormSection';
import { PreviewSection } from './components/PreviewSection';
import { PaymentModal } from './components/PaymentModal';
import { Footer } from './components/Footer';
import { PolicyModal } from './components/PolicyModal';

export default function App() {
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
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);

  const scrollToPreview = () => {
    const el = document.getElementById('preview-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenPayment = () => {
    setIsPaymentOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#3E2723] font-['Noto_Sans_Devanagari',sans-serif] flex flex-col justify-between">
      <div>
        {/* Header */}
        <Header />

        {/* Features Section */}
        <FeatureSection />

        {/* Important Notice */}
        <NoteSection />

        {/* Main Personalization Form */}
        <FormSection
          formData={formData}
          setFormData={setFormData}
          onPreview={scrollToPreview}
          onGeneratePdf={handleOpenPayment}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
        />

        {/* Live Preview Engine */}
        <PreviewSection
          formData={formData}
          onGeneratePdf={handleOpenPayment}
        />
      </div>

      {/* Footer */}
      <Footer onOpenPolicy={(type) => setActivePolicy(type)} />

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        formData={formData}
      />

      <PolicyModal
        policyType={activePolicy}
        onClose={() => setActivePolicy(null)}
      />
    </div>
  );
}
