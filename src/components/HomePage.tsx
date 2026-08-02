import React, { useState } from 'react';
import { Header } from './Header';
import { FeatureSection } from './FeatureSection';
import { ThumbnailPreview } from './ThumbnailPreview';
import { Footer } from './Footer';
import { PolicyType } from '../types';
import { createRazorpayOrder, verifyPaymentSession } from '../services/api';
import { ShieldCheck, Sparkles, Lock, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface HomePageProps {
  onPaymentSuccess: (sessionToken: string) => void;
  onOpenPolicy: (type: PolicyType) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onPaymentSuccess, onOpenPolicy }) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleStartPayment = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Create Razorpay order
      const orderRes = await createRazorpayOrder();

      // 2. Test mode fallback (when Razorpay SDK or live keys absent)
      if (orderRes.isTestMode || !window.Razorpay) {
        setSuccessMsg('पेमेंट यशस्वी झाले! तुम्हाला आरती संग्रह तयार करण्याच्या पेजवर पाठवले जात आहे...');

        const sessionRes = await verifyPaymentSession({
          razorpay_order_id: orderRes.orderId || 'order_test_demo',
          razorpay_payment_id: `pay_simulated_${Date.now()}`,
          razorpay_signature: 'simulated_signature_valid',
        });

        setLoading(false);
        setTimeout(() => {
          setIsPaymentModalOpen(false);
          onPaymentSuccess(sessionRes.sessionToken);
        }, 1500);
        return;
      }

      // 3. Razorpay Live Checkout
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: 'वैयक्तिकृत आरती संग्रह',
        description: '५२ पानांची वैयक्तिकृत आरती संग्रह PDF',
        image: '/assets/pages/Page 1.jpg',
        order_id: orderRes.orderId,
        handler: async (response: any) => {
          try {
            setSuccessMsg('पेमेंट प्राप्त झाले! तुम्हाला आरती संग्रह तयार करण्याच्या पेजवर पाठवले जात आहे...');

            const sessionRes = await verifyPaymentSession({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setLoading(false);
            setTimeout(() => {
              setIsPaymentModalOpen(false);
              onPaymentSuccess(sessionRes.sessionToken);
            }, 1500);
          } catch (err: any) {
            setErrorMsg(err.message || 'पेमेंट पडताळणीमध्ये अडचण आली.');
            setLoading(false);
          }
        },
        theme: {
          color: '#800000',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setErrorMsg('पेमेंट रद्द केले गेले.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setLoading(false);
        setErrorMsg(`पेमेंट अयशस्वी: ${response.error.description || 'अज्ञात त्रुटी'}`);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Payment error:', err);
      setErrorMsg(err.message || 'पेमेंट प्रक्रिया सुरू करता आली नाही.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#3E2723] font-['Noto_Sans_Devanagari',sans-serif] flex flex-col justify-between">
      <div>
        {/* Header Section (Ganesh Image, Title, Chant) */}
        <Header />

        {/* Product Information & Features Section */}
        <FeatureSection />

        {/* Sample Pages Thumbnail Preview Section */}
        <ThumbnailPreview />

        {/* Prominent ₹99 CTA Payment Button Section */}
        <section id="cta-payment-section" className="py-8 px-4 max-w-3xl mx-auto text-center">
          <div className="bg-[#FFFDF8] border-2 border-[#D4AF37] rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 bg-[#FF9933] text-[#6B1212] px-4 py-1 text-xs font-bold rounded-full shadow-md">
              विशेष सवलत
            </div>

            <h3 className="font-['Tiro_Devanagari_Marathi','Rozha_One',serif] text-xl md:text-2xl text-[#800000] font-bold mb-2">
              तुमचा आरती संग्रह आताच तयार करा
            </h3>
            <p className="font-['Anek_Devanagari','Noto_Sans_Devanagari',sans-serif] text-xs md:text-sm text-[#665544] mb-6 font-medium">
              फक्त ₹99 भरून लगेच तुमच्या व्यवसायाच्या / नावाच्या माहितीसह ५२ पानांचा वैयक्तिकृत आरती संग्रह डाउनलोड करा.
            </p>

            {/* Single CTA Button requested by user */}
            <button
              onClick={() => {
                setIsPaymentModalOpen(true);
                handleStartPayment();
              }}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#FF9933] via-[#E65100] to-[#800000] text-white font-['Noto_Sans_Devanagari',sans-serif] font-bold text-lg md:text-xl rounded-xl shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto cursor-pointer"
            >
              <Sparkles className="w-6 h-6 text-[#FFD700] animate-spin" />
              <span>₹99 मध्ये तुमचा वैयक्तिक आरती संग्रह तयार करा</span>
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#665544] font-medium">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>100% सुरक्षित Razorpay पेमेंट | झटपट ॲक्सेस</span>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer onOpenPolicy={onOpenPolicy} />

      {/* Payment Processing Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FFFDF8] border-2 border-[#D4AF37] rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
            
            {/* Close Button */}
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              disabled={loading}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-[#FAF0D7] text-[#6B1212] hover:bg-[#F3E5AB] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF9933] to-[#800000] text-[#F3E5AB] flex items-center justify-center mx-auto mb-3 shadow-md">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="font-['Tiro_Devanagari_Marathi','Rozha_One',serif] font-bold text-2xl text-[#6B1212]">
                सुरक्षित पेमेंट (Razorpay)
              </h3>
              <p className="text-xs text-[#665544] mt-1">
                ५२ पानांच्या वैयक्तिकृत आरती संग्रहासाठी फक्त ₹99 शुल्क.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-green-50 border border-green-300 text-green-800 p-3 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {loading ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#800000] animate-spin" />
                <p className="text-sm font-bold text-[#800000]">पेमेंट गेटवे लोड होत आहे...</p>
              </div>
            ) : (
              <button
                onClick={handleStartPayment}
                className="w-full py-3.5 bg-gradient-to-r from-[#FF9933] via-[#E65100] to-[#800000] text-white font-['Noto_Sans_Devanagari',sans-serif] font-bold text-lg rounded-xl shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-5 h-5" />
                ₹99 भरा आणि पुढे चला
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
