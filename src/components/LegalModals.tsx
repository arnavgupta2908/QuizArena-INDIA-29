import React from 'react';
import { X, ShieldCheck, FileText, Scale } from 'lucide-react';
import { WebsiteSettings } from '../types';

interface LegalModalsProps {
  type: 'terms' | 'privacy' | 'refund' | null;
  onClose: () => void;
  settings: WebsiteSettings;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ type, onClose, settings }) => {
  if (!type) return null;

  const titles = {
    terms: 'Terms & Conditions',
    privacy: 'Privacy Policy',
    refund: 'Refund & Cancellation Policy'
  };

  const icons = {
    terms: Scale,
    privacy: ShieldCheck,
    refund: FileText
  };

  const contents = {
    terms: settings.terms_and_conditions,
    privacy: settings.privacy_policy,
    refund: settings.refund_policy
  };

  const Icon = icons[type];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-[#090e24] border border-amber-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/80 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0b1333] via-[#101a42] to-[#0b1333] px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Icon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                {titles[type]}
              </h3>
              <p className="text-[11px] text-slate-400">
                Official QUIZARENA INDIA Legal Documentation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
          {contents[type]}
        </div>

        {/* Footer */}
        <div className="bg-[#060a1c] px-6 py-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all cursor-pointer"
          >
            I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
};
