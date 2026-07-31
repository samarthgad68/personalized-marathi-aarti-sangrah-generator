import React, { useState } from 'react';
import { UserFormData } from '../types';
import { X, CheckCircle, AlertCircle, Loader2, Lock, ShieldCheck, Download, Sparkles } from 'lucide-react';
import { createRazorpayOrder, verifyPaymentAndDownloadPDF } from '../services/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: UserFormData;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, formData }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePay = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Create Order
      const orderRes = await createRazorpayOrder();

      // 2. If Test Mode (no Razorpay keys configured)
      if (orderRes.isTestMode || !window.Razorpay) {
        setSuccessMsg('पेमेंट यशस्वी झाले! तुमची ५२ पानांची वैयक्तिकृत आरती संग्रह PDF तयार होत आहे...');

        // Verify and Download PDF directly
        await verifyPaymentAndDownloadPDF({
          razorpay_order_id: orderRes.orderId || 'order_test_demo',
          razorpay_payment_id: `pay_simulated_${Date.now()}`,
          razorpay_signature: 'simulated_signature_valid',
          formData: {
            businessName: formData.businessName,
            proprietorName: formData.proprietorName,
            address: formData.address,
            mobileNumber: formData.mobileNumber,
            photoUrl: formData.photoUrl,
          },
        });

        setLoading(false);
        setTimeout(() => {
          onClose();
        }, 2000);
        return;
      }

      // 3. Open Razorpay Live Checkout
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
            setSuccessMsg('पेमेंट प्राप्त झाले! PDF डाउनलोड होत आहे...');

            await verifyPaymentAndDownloadPDF({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              formData: {
                businessName: formData.businessName,
                proprietorName: formData.proprietorName,
                address: formData.address,
                mobileNumber: formData.mobileNumber,
                photoUrl: formData.photoUrl,
              },
            });

            setLoading(false);
            setTimeout(() => {
              onClose();
            }, 2000);
          } catch (err: any) {
            setErrorMsg(err.message || 'PDF निर्मितीमध्ये समस्या आली.');
            setLoading(false);
          }
        },
        prefill: {
          name: formData.businessName,
          contact: formData.mobileNumber,
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
      setErrorMsg(err.message || 'पेमेंट प्रक्रिया पूर्ण करता आली नाही.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FFFDF8] border-2 border-[#D4AF37] rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#FAF0D7] text-[#6B1212] hover:bg-[#F3E5AB] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF9933] to-[#800000] text-[#F3E5AB] flex items-center justify-center mx-auto mb-3 shadow-md">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="font-['Yatra_One',serif] text-2xl text-[#6B1212]">
            आरती संग्रह PDF पेमेंट
          </h3>
          <p className="text-xs text-[#665544] mt-1">
            सुरक्षित Razorpay पेमेंट गेटवेद्वारे पेमेंट पूर्ण करा.
          </p>
        </div>

        {/* Order Details Summary */}
        <div className="bg-[#FAF6EE] border border-[#E6D3B1] rounded-xl p-4 mb-5 space-y-2 text-xs md:text-sm">
          <div className="flex justify-between text-[#3E2723]">
            <span>नाव / व्यवसाय:</span>
            <span className="font-bold text-[#800000]">{formData.businessName}</span>
          </div>
          {formData.proprietorName && (
            <div className="flex justify-between text-[#3E2723]">
              <span>प्रोप्रायटर / हुद्दा:</span>
              <span className="font-bold">{formData.proprietorName}</span>
            </div>
          )}
          <div className="flex justify-between text-[#3E2723]">
            <span>मोबाईल:</span>
            <span className="font-bold">{formData.mobileNumber}</span>
          </div>
          <div className="flex justify-between text-[#3E2723]">
            <span>एकूण पाने:</span>
            <span className="font-bold text-[#800000]">५२ पाने (२१ आरत्या)</span>
          </div>
          <div className="border-t border-[#E6D3B1] pt-2 flex justify-between items-center text-base font-bold text-[#6B1212]">
            <span>एकूण शुल्क:</span>
            <span className="text-xl text-[#E65100]">₹ 99.00</span>
          </div>
        </div>

        {/* Error / Success Messages */}
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

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#665544] mb-5">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span>100% सुरक्षित पेमेंट | SSL एनक्रिप्टेड</span>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-[#FF9933] via-[#E65100] to-[#800000] text-white font-['Yatra_One',serif] text-lg rounded-xl shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              प्रक्रिया सुरू आहे...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              ₹99 भरा आणि PDF डाउनलोड करा
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-[#887766] mt-3">
          पेमेंट यशस्वी होताच तुमची ५२ पानावरील वैयक्तिकृत PDF आपोआप डाउनलोड होईल.
        </p>
      </div>
    </div>
  );
};
