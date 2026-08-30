import React, { useState } from 'react';
import { Header } from './Header';
import { FeatureSection } from './FeatureSection';
import { ThumbnailPreview } from './ThumbnailPreview';
import { Footer } from './Footer';
import { PolicyType } from '../types';
import { createRazorpayOrder, verifyPaymentSession } from '../services/api';
import {
  ShieldCheck,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface HomePageProps {
  onPaymentSuccess: (sessionToken: string) => void;
  onOpenPolicy: (type: PolicyType) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onPaymentSuccess,
  onOpenPolicy,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleStartPayment = async () => {
    if (loading) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Create Razorpay order from backend
      const orderRes = await createRazorpayOrder();

      console.log('Razorpay Order Response:', {
        orderId: orderRes?.orderId,
        amount: orderRes?.amount,
        currency: orderRes?.currency,
        keyId: orderRes?.keyId,
        isTestMode: orderRes?.isTestMode,
      });

      // 2. NEVER allow test/demo/simulated payment on live website
      if (orderRes?.isTestMode === true) {
        throw new Error(
          'Live payment configuration चुकीची आहे. Razorpay test/demo mode enabled आहे.'
        );
      }

      // 3. Razorpay SDK must be available
      if (!window.Razorpay) {
        throw new Error(
          'Razorpay Payment Gateway load झाले नाही. कृपया page refresh करून पुन्हा प्रयत्न करा.'
        );
      }

      // 4. Validate required order information
      if (!orderRes?.orderId) {
        throw new Error(
          'Razorpay Order ID मिळाला नाही. Payment सुरू करता आले नाही.'
        );
      }

      if (!orderRes?.keyId) {
        throw new Error(
          'Razorpay Key ID मिळाला नाही. Payment configuration तपासा.'
        );
      }

      if (!orderRes?.amount) {
        throw new Error(
          'Payment amount मिळाला नाही. Payment सुरू करता आले नाही.'
        );
      }

      // 5. Razorpay Checkout options
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency || 'INR',

        name: 'वैयक्तिकृत आरती संग्रह',

        description:
          '५२ पानांची वैयक्तिकृत आरती संग्रह PDF',

        image: '/assets/pages/Page%201.jpg',

        order_id: orderRes.orderId,

        handler: async (response: any) => {
          try {
            setLoading(true);
            setErrorMsg(null);

            console.log('Razorpay Payment Response:', {
              order_id: response?.razorpay_order_id,
              payment_id: response?.razorpay_payment_id,
              has_signature: !!response?.razorpay_signature,
            });

            // Make sure Razorpay returned all required values
            if (
              !response?.razorpay_order_id ||
              !response?.razorpay_payment_id ||
              !response?.razorpay_signature
            ) {
              throw new Error(
                'Razorpay payment response अपूर्ण आहे. Payment verify करता आले नाही.'
              );
            }

            setSuccessMsg(
              'पेमेंट प्राप्त झाले आहे. पेमेंट पडताळणी सुरू आहे...'
            );

            // 6. Verify payment on backend
            const sessionRes = await verifyPaymentSession({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (!sessionRes?.sessionToken) {
              throw new Error(
                'Payment verification successful झाली नाही. Generator access मिळाला नाही.'
              );
            }

            // 7. Only after successful backend verification
            setSuccessMsg(
              'पेमेंट यशस्वी झाले! आरती संग्रह तयार करण्याच्या पेजवर पाठवत आहोत...'
            );

            setLoading(false);

            setTimeout(() => {
              onPaymentSuccess(sessionRes.sessionToken);
            }, 1000);
          } catch (err: any) {
            console.error('Payment verification error:', err);

            setLoading(false);
            setSuccessMsg(null);

            setErrorMsg(
              err?.message ||
                'पेमेंट पडताळणीमध्ये अडचण आली. कृपया पुन्हा प्रयत्न करा.'
            );
          }
        },

        theme: {
          color: '#800000',
        },

        modal: {
          ondismiss: () => {
            setLoading(false);

            setErrorMsg('पेमेंट रद्द केले गेले.');

            setSuccessMsg(null);
          },
        },
      };

      // 8. Create Razorpay checkout
      const razorpay = new window.Razorpay(options);

      // 9. Handle failed payment
      razorpay.on('payment.failed', (response: any) => {
        console.error('Razorpay Payment Failed:', response);

        setLoading(false);
        setSuccessMsg(null);

        const description =
          response?.error?.description ||
          'पेमेंट अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा.';

        setErrorMsg(`पेमेंट अयशस्वी: ${description}`);
      });

      // 10. Open actual Razorpay Checkout
      razorpay.open();
    } catch (err: any) {
      console.error('Payment initialization error:', err);

      setLoading(false);
      setSuccessMsg(null);

      setErrorMsg(
        err?.message ||
          'पेमेंट प्रक्रिया सुरू करता आली नाही. कृपया पुन्हा प्रयत्न करा.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#3E2723] font-['Noto_Sans_Devanagari',sans-serif] flex flex-col justify-between">
      <div>
        {/* Header */}
        <Header />

        {/* Features */}
        <FeatureSection />

        {/* Aarti Sangrah Preview */}
        <ThumbnailPreview />

        {/* Payment Section */}
        <section
          id="cta-payment-section"
          className="py-8 px-4 max-w-3xl mx-auto text-center"
        >
          <div className="bg-[#FFFDF8] border-2 border-[#D4AF37] rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">

            {/* Discount Badge */}
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 bg-[#FF9933] text-[#6B1212] px-4 py-1 text-xs font-bold rounded-full shadow-md">
              विशेष सवलत
            </div>

            {/* Heading */}
            <h3 className="font-['Tiro_Devanagari_Marathi','Rozha_One',serif] text-xl md:text-2xl text-[#800000] font-bold mb-2">
              तुमचा आरती संग्रह आताच तयार करा
            </h3>

            {/* Description */}
            <p className="font-['Anek_Devanagari','Noto_Sans_Devanagari',sans-serif] text-xs md:text-sm text-[#665544] mb-6 font-medium">
              फक्त ₹99 भरून लगेच तुमच्या व्यवसायाच्या / नावाच्या माहितीसह
              ५२ पानांचा वैयक्तिकृत आरती संग्रह डाउनलोड करा.
            </p>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded-xl text-xs font-semibold mb-4 flex items-center justify-center gap-2 max-w-md mx-auto">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="bg-green-50 border border-green-300 text-green-800 p-3 rounded-xl text-xs font-semibold mb-4 flex items-center justify-center gap-2 max-w-md mx-auto">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Payment Button */}
            <button
              type="button"
              onClick={handleStartPayment}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#FF9933] via-[#E65100] to-[#800000] text-white font-['Noto_Sans_Devanagari',sans-serif] font-bold text-lg md:text-xl rounded-xl shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 text-[#FFD700] animate-spin" />
                  <span>पेमेंट प्रक्रिया सुरू आहे...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 text-[#FFD700] animate-spin" />
                  <span>
                    ₹99 मध्ये तुमचा वैयक्तिक आरती संग्रह तयार करा
                  </span>
                </>
              )}
            </button>

            {/* Security Message */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#665544] font-medium">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>
                100% सुरक्षित Razorpay पेमेंट | झटपट ॲक्सेस
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer onOpenPolicy={onOpenPolicy} />
    </div>
  );
};