import React from 'react';
import { PolicyType } from '../types';
import { X, ShieldCheck, FileText, RefreshCw, AlertCircle } from 'lucide-react';

interface PolicyModalProps {
  policyType: PolicyType;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ policyType, onClose }) => {
  if (!policyType) return null;

  const getContent = () => {
    switch (policyType) {
      case 'privacy':
        return {
          title: 'गोपनीयता धोरण (Privacy Policy)',
          icon: <ShieldCheck className="w-6 h-6 text-green-700" />,
          body: (
            <div className="space-y-3 text-xs md:text-sm text-[#3E2723] leading-relaxed">
              <p>
                आम्ही तुमच्या वैयक्तिक माहितीच्या गोपनीयतेचा आदर करतो. तुमच्याद्वारे प्रविष्ट केलेली माहिती (नाव, पत्ता, मोबाईल नंबर, फोटो) ही फक्त ५२ पानावरील वैयक्तिकृत आरती संग्रह PDF तयार करण्यासाठीच वापरली जाते.
              </p>
              <h5 className="font-bold text-[#6B1212]">१. डेटा सुरक्षितता व हटवणे:</h5>
              <p>
                PDF यशस्वीरीत्या डाउनलोड झाल्यानंतर तुमच्याद्वारे अपलोड केलेला फोटो आणि तयार झालेली PDF सर्व्हरवरून तत्काळ आपोआप डिलीट केली जाते. सर्व्हरवर कोणताही युझर डेटा साठवून ठेवला जात नाही.
              </p>
              <h5 className="font-bold text-[#6B1212]">२. तृतीय-पक्ष सेवा:</h5>
              <p>
                पेमेंट प्रक्रियेसाठी आम्ही Razorpay सुरक्षित पेमेंट गेटवेचा वापर करतो. तुमची कार्ड किंवा यूपीआय माहिती आमच्या सर्व्हरवर साठवली जात नाही.
              </p>
            </div>
          ),
        };

      case 'terms':
        return {
          title: 'नियम व अटी (Terms & Conditions)',
          icon: <FileText className="w-6 h-6 text-[#800000]" />,
          body: (
            <div className="space-y-3 text-xs md:text-sm text-[#3E2723] leading-relaxed">
              <p>
                वैयक्तिकृत आरती संग्रह PDF जनरेटर सेवा वापरण्यापूर्वी कृपया खालील नियम व अटी काळजीपूर्वक वाचा:
              </p>
              <h5 className="font-bold text-[#6B1212]">१. अचूक माहिती भरण्याची जबाबदारी:</h5>
              <p>
                फॉर्ममध्ये नाव, पत्ता व मोबाईल नंबर स्पेलिंग तपासून अचूक भरा. एकदा PDF तयार झाल्यानंतर त्यात कोणताही बदल किंवा दुरुस्ती करता येणार नाही.
              </p>
              <h5 className="font-bold text-[#6B1212]">२. वैयक्तिक वापर:</h5>
              <p>
                तयार झालेली डिजिटल PDF ही तुमच्या व्यावसायिक किंवा वैयक्तिक वितरणासाठी वैध आहे.
              </p>
            </div>
          ),
        };

      case 'refund':
        return {
          title: 'परतावा धोरण (Refund & Cancellation Policy)',
          icon: <RefreshCw className="w-6 h-6 text-[#E65100]" />,
          body: (
            <div className="space-y-3 text-xs md:text-sm text-[#3E2723] leading-relaxed">
              <p>
                आमची सेवा ही इन्स्टंट डिजिटल डाउनलोड प्रॉडक्ट आहे.
              </p>
              <h5 className="font-bold text-[#6B1212]">१. नो रिफंड पॉलिसी:</h5>
              <p>
                पेमेंट यशस्वी झाल्यानंतर तात्काळ कस्टम PDF जनरेट केली जाते. त्यामुळे एकदा पेमेंट पूर्ण झाल्यावर रिफंड किंवा कॅन्सलेशन मिळणार नाही.
              </p>
              <h5 className="font-bold text-[#6B1212]">२. तांत्रिक अडचणींसाठी मदत:</h5>
              <p>
                पेमेंट यशस्वी होऊनही PDF डाउनलोड न झाल्यास आमच्या सपोर्ट टीमशी त्वरित संपर्क साधा.
              </p>
            </div>
          ),
        };

      case 'disclaimer':
        return {
          title: 'अस्वीकरण (Disclaimer)',
          icon: <AlertCircle className="w-6 h-6 text-[#B8860B]" />,
          body: (
            <div className="space-y-3 text-xs md:text-sm text-[#3E2723] leading-relaxed">
              <p>
                या आरती संग्रहातील सर्व आरत्या, स्तोत्रे व मंत्र पारंपरिक धार्मिक साहित्यावर आधारित आहेत.
              </p>
              <p>
                सर्व माहिती वाचकांना धार्मिक पूजेसाठी उपलब्ध करून देण्यात आली आहे. युझरद्वारे भरलेल्या स्पेलिंग किंवा चुकीच्या माहितीसाठी ही सिस्टीम जबाबदार असणार नाही.
              </p>
            </div>
          ),
        };

      default:
        return { title: '', icon: null, body: null };
    }
  };

  const content = getContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FFFDF8] border-2 border-[#D4AF37] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#FAF0D7] pb-3 mb-4">
          <div className="flex items-center gap-2">
            {content.icon}
            <h3 className="font-['Yatra_One',serif] text-lg md:text-xl text-[#6B1212]">
              {content.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-[#FAF0D7] text-[#6B1212] hover:bg-[#F3E5AB]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-3">
          {content.body}
        </div>

        {/* Footer Close */}
        <div className="pt-4 border-t border-[#E6D3B1] mt-4 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#800000] text-[#F3E5AB] font-bold text-xs md:text-sm rounded-lg hover:bg-[#6B1212]"
          >
            बंद करा (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
