import React from 'react';
import { Trophy, ShieldCheck, Heart } from 'lucide-react';
import { WebsiteSettings } from '../types';

interface FooterProps {
  settings: WebsiteSettings;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
  onOpenRefund: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenTerms,
  onOpenPrivacy,
  onOpenRefund
}) => {
  return (
    <footer className="bg-[#030610] border-t border-white/10 pt-16 pb-12 text-slate-400 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/5">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
                <Trophy className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-black tracking-wider text-white uppercase">
                  QUIZARENA <span className="text-amber-400">INDIA</span>
                </span>
                <p className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">
                  {settings.tagline || 'Think. Compete. Win.'}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Empowering curious minds across India through intellectual, skill-based online quiz championships. Celebrating knowledge, speed, and academic excellence.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-400/90 font-medium bg-amber-500/5 border border-amber-500/20 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>100% Skill-Based Competition (Non-Gambling)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Competition Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#about" className="hover:text-amber-400 transition-colors">About Championship</a>
              </li>
              <li>
                <a href="#prizes" className="hover:text-amber-400 transition-colors">Grand Cash Rewards & Trophies</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-amber-400 transition-colors">How to Register</a>
              </li>
              <li>
                <a href="#rules" className="hover:text-amber-400 transition-colors">Rules, Scoring & Topics</a>
              </li>
              <li>
                <a href="#faqs" className="hover:text-amber-400 transition-colors">Frequently Asked Questions</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-amber-400 transition-colors">Participant Support Desk</a>
              </li>
            </ul>
          </div>

          {/* Legal Policies */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Legal & Compliance</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              QuizArena India operates in strict compliance with the laws of India pertaining to skill games and knowledge competitions. All transactions are securely audited.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={onOpenTerms}
                className="text-xs font-medium text-slate-300 hover:text-amber-400 underline underline-offset-4 cursor-pointer"
              >
                Terms & Conditions
              </button>
              <button
                onClick={onOpenPrivacy}
                className="text-xs font-medium text-slate-300 hover:text-amber-400 underline underline-offset-4 cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                onClick={onOpenRefund}
                className="text-xs font-medium text-slate-300 hover:text-amber-400 underline underline-offset-4 cursor-pointer"
              >
                Refund Policy
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} QUIZARENA INDIA. All rights reserved. Built for Indian quizzers.
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Think. Compete. Win.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
