import React from 'react';
import { PolicyType } from '../types';
import { Shield, FileText, RefreshCcw, AlertTriangle, Heart } from 'lucide-react';

interface FooterProps {
  onOpenPolicy: (type: PolicyType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPolicy }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer-section" className="bg-[#420A0A] text-[#FAF6EE] pt-8 pb-6 px-4 border-t-4 border-[#D4AF37]">
      <div className="max-w-6xl mx-auto">
        
        {/* Links Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs md:text-sm mb-6 text-[#E6D3B1]">
          <button
            onClick={() => onOpenPolicy('terms')}
            className="hover:text-[#F3E5AB] underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            नियम व अटी (Terms)
          </button>
          <span>•</span>
          <button
            onClick={() => onOpenPolicy('privacy')}
            className="hover:text-[#F3E5AB] underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            गोपनीयता धोरण (Privacy Policy)
          </button>
          <span>•</span>
          <button
            onClick={() => onOpenPolicy('refund')}
            className="hover:text-[#F3E5AB] underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            परतावा नियम (Refund Policy)
          </button>
          <span>•</span>
          <button
            onClick={() => onOpenPolicy('disclaimer')}
            className="hover:text-[#F3E5AB] underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            अस्वीकरण (Disclaimer)
          </button>
        </div>

        {/* Copyright */}
        <div className="text-center text-[11px] md:text-xs text-[#B89B80]">
          <p>
            © {currentYear} वैयक्तिकृत मराठी आरती संग्रह. सर्व हक्क सुरक्षित. (All Rights Reserved)
          </p>
        </div>

      </div>
    </footer>
  );
};
