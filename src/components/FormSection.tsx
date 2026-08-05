import React, { useState } from 'react';
import { UserFormData, FormErrors } from '../types';
import { Building2, User, MapPin, Phone, Upload, Eye, FileCheck, Image as ImageIcon, X } from 'lucide-react';
import { uploadPhoto } from '../services/api';

interface FormSectionProps {
  formData: UserFormData;
  setFormData: React.Dispatch<React.SetStateAction<UserFormData>>;
  onPreview: () => void;
  onGeneratePdf: () => void;
  isUploading: boolean;
  setIsUploading: (val: boolean) => void;
}

export const FormSection: React.FC<FormSectionProps> = ({
  formData,
  setFormData,
  onPreview,
  onGeneratePdf,
  isUploading,
  setIsUploading,
}) => {
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|jfif)$/i.test(file.name);
    if (!isImage) {
      setErrors((prev) => ({ ...prev, photo: 'फक्त प्रतिमा (JPG, PNG, WEBP) फोटो निवडा.' }));
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: 'फोटोची साईज २५ MB पेक्षा कमी असावी.' }));
      return;
    }

    setErrors((prev) => ({ ...prev, photo: undefined }));
    setIsUploading(true);

    try {
      const localUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, photoFile: file, photoUrl: localUrl }));

      const res = await uploadPhoto(file);
      if (res && res.photoUrl) {
        setFormData((prev) => ({ ...prev, photoUrl: res.photoUrl }));
      }
    } catch (err: any) {
      console.error('Photo upload warning:', err);
      // Keep local preview URL so the user still sees their uploaded image
    } finally {
      setIsUploading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'कृपया नाव / व्यवसायाचे नाव प्रविष्ट करा.';
    }
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'कृपया मोबाईल नंबर प्रविष्ट करा.';
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber.trim())) {
      newErrors.mobileNumber = 'कृपया १० अंकी योग्य मोबाईल नंबर प्रविष्ट करा.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreviewClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onPreview();
    }
  };

  const handleGeneratePdfClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onGeneratePdf();
    }
  };

  const clearPhoto = () => {
    setFormData((prev) => ({ ...prev, photoFile: null, photoUrl: undefined }));
  };

  return (
    <section id="form-section" className="px-4 max-w-4xl mx-auto mb-8">
      <div className="bg-[#FFFDF8] border-2 border-[#E6D3B1] rounded-2xl p-5 md:p-8 shadow-xl relative">
        <div className="flex items-center justify-between border-b-2 border-[#FAF0D7] pb-4 mb-6">
          <div>
            <h2 className="font-['Tiro_Devanagari_Marathi','Rozha_One',serif] text-xl md:text-2xl text-[#800000] flex items-center gap-2 font-bold">
              <span className="w-3 h-3 rounded-full bg-[#FF9933] inline-block" />
              वैयक्तिक माहिती फॉर्म (Personalization Details)
            </h2>
            <p className="font-['Anek_Devanagari','Noto_Sans_Devanagari',sans-serif] text-xs md:text-sm text-[#665544] mt-1 font-semibold">
              खालील माहिती तुमच्या आरती संग्रहाच्या प्रत्येक पानावर खालील भागात दिसेल.
            </p>
          </div>
        </div>

        <form className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {/* Field 1: नाव / व्यवसायाचे नाव */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs md:text-sm font-bold text-[#3E2723]">
                  नाव / व्यवसायाचे नाव <span className="text-red-600">*</span>
                </label>
                <span className="text-[10px] md:text-xs text-[#887766] font-medium">
                  {formData.businessName?.length || 0}/45
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#800000]">
                  <Building2 className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  maxLength={45}
                  placeholder="उदा. श्री गणेश ज्वेलर्स"
                  className={`w-full pl-10 pr-3 py-2.5 bg-white text-[#3E2723] border ${
                    errors.businessName ? 'border-red-500' : 'border-[#D4AF37]'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000] text-sm md:text-base font-medium`}
                />
              </div>
              {errors.businessName && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.businessName}</p>}
            </div>

            {/* Field 2: प्रोप्रायटर / हुद्दा */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs md:text-sm font-bold text-[#3E2723]">
                  प्रोप्रायटर / हुद्दा
                </label>
                <span className="text-[10px] md:text-xs text-[#887766] font-medium">
                  {formData.proprietorName?.length || 0}/45
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#800000]">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="proprietorName"
                  value={formData.proprietorName}
                  onChange={handleChange}
                  maxLength={45}
                  placeholder="उदा. श्री. महेश जोशी (संस्थापक)"
                  className="w-full pl-10 pr-3 py-2.5 bg-white text-[#3E2723] border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000] text-sm md:text-base font-medium"
                />
              </div>
            </div>

            {/* Field 3: पत्ता / इतर माहिती */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs md:text-sm font-bold text-[#3E2723]">
                  पत्ता / इतर माहिती
                </label>
                <span className="text-[10px] md:text-xs text-[#887766] font-medium">
                  {formData.address?.length || 0}/55
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#800000]">
                  <MapPin className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  maxLength={55}
                  placeholder="उदा. दुकान क्र. ४, लक्ष्मी रोड, पुणे"
                  className="w-full pl-10 pr-3 py-2.5 bg-white text-[#3E2723] border border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000] text-sm md:text-base font-medium"
                />
              </div>
            </div>

            {/* Field 4: मोबाईल नंबर */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs md:text-sm font-bold text-[#3E2723]">
                  मोबाईल नंबर <span className="text-red-600">*</span>
                </label>
                <span className="text-[10px] md:text-xs text-[#887766] font-medium">
                  {formData.mobileNumber?.length || 0}/12
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#800000]">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  maxLength={12}
                  placeholder="उदा. 9876543210"
                  className={`w-full pl-10 pr-3 py-2.5 bg-white text-[#3E2723] border ${
                    errors.mobileNumber ? 'border-red-500' : 'border-[#D4AF37]'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000] text-sm md:text-base font-medium`}
                />
              </div>
              {errors.mobileNumber && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.mobileNumber}</p>}
            </div>
          </div>

          {/* Photo Upload Area */}
          <div className="pt-2">
            <label className="block text-xs md:text-sm font-bold text-[#3E2723] mb-1">
              आपला किंवा व्यवसायाचा फोटो अपलोड करा (Photo Upload)
            </label>

            {formData.photoUrl ? (
              <div className="relative flex items-center gap-4 p-3 bg-[#FAF6EE] border-2 border-[#D4AF37] rounded-xl">
                <img
                  src={formData.photoUrl}
                  alt="Uploaded preview"
                  className="w-20 h-20 object-cover rounded-lg border border-[#800000]"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <p className="text-xs font-bold text-[#800000] flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" /> फोटो जोडला गेला आहे!
                  </p>
                  <p className="text-[11px] text-[#665544] mt-0.5">
                    हा फोटो तुमच्या आरती संग्रहाच्या सर्व पानांवर उजव्या बाजूला दिसेल.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="p-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                  title="फोटो काढून टाका"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="relative border-2 border-dashed border-[#D4AF37] rounded-xl p-5 text-center bg-[#FAF6EE]/50 hover:bg-[#FAF6EE] transition-colors cursor-pointer group">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-[#FAF0D7] text-[#800000] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    {isUploading ? (
                      <div className="w-6 h-6 border-2 border-[#800000] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <p className="text-xs md:text-sm font-bold text-[#800000]">
                    इथे क्लिक करा किंवा फोटो ड्रॅग करा (Click to Upload Photo)
                  </p>
                  <p className="text-[11px] text-[#887766] mt-0.5">
                    फॉरमॅट: JPG, PNG | कमाल साईज: 5 MB
                  </p>
                </div>
              </div>
            )}
            {errors.photo && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.photo}</p>}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            {/* Preview Button */}
            <button
              type="button"
              onClick={handlePreviewClick}
              className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FAF0D7] to-[#F3E5AB] text-[#800000] font-['Noto_Sans_Devanagari',sans-serif] font-bold text-base md:text-lg border-2 border-[#D4AF37] shadow-md hover:shadow-lg hover:from-[#F3E5AB] hover:to-[#E6C255] transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <Eye className="w-5 h-5 text-[#800000]" />
              पूर्वदृश्य पहा (Preview)
            </button>

            {/* Simple Orange PDF Button */}
            <button
              type="button"
              onClick={handleGeneratePdfClick}
              className="flex-1 py-3.5 px-6 rounded-xl bg-[#FF6600] hover:bg-[#E65C00] text-white font-['Noto_Sans_Devanagari',sans-serif] font-bold text-base md:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <FileCheck className="w-5 h-5 text-white" />
              PDF तयार करा (Generate PDF - ₹99)
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
