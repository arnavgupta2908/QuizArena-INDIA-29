import React, { useState } from 'react';
import { Trophy, CheckCircle2, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { WebsiteSettings } from '../types';

interface NavbarProps {
  settings: WebsiteSettings;
  onOpenRegister: () => void;
  onOpenCheckStatus: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ settings, onOpenRegister, onOpenCheckStatus }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#070b19]/90 backdrop-blur-md border-b border-white/10 transition-all">
      {settings.announcement_banner && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 text-xs sm:text-sm font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-inner">
          <span className="animate-pulse">✨</span>
          <span>{settings.announcement_banner}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300/40">
              <Trophy className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-wider text-white uppercase">
                  QUIZARENA
                </span>
                <span className="text-xl sm:text-2xl font-black tracking-wider text-amber-400 uppercase">
                  INDIA
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase">
                {settings.tagline || 'Think. Compete. Win.'}
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <button onClick={() => scrollTo('about')} className="hover:text-amber-400 transition-colors">
              About
            </button>
            <button onClick={() => scrollTo('prizes')} className="hover:text-amber-400 transition-colors">
              Prizes
            </button>
            <button onClick={() => scrollTo('how-it-works')} className="hover:text-amber-400 transition-colors">
              How to Participate
            </button>
            <button onClick={() => scrollTo('rules')} className="hover:text-amber-400 transition-colors">
              Rules & Syllabus
            </button>
            <button onClick={() => scrollTo('faqs')} className="hover:text-amber-400 transition-colors">
              FAQs
            </button>
            <button onClick={() => scrollTo('contact')} className="hover:text-amber-400 transition-colors">
              Support
            </button>
          </div>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onOpenCheckStatus}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              Check Status
            </button>

            <button
              onClick={onOpenRegister}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 rounded-lg shadow-md shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer border border-amber-200/50"
            >
              <span>REGISTER NOW</span>
              <span className="bg-slate-950/20 px-1.5 py-0.5 rounded text-[11px] font-extrabold text-slate-950">
                ₹{settings.registration_fee}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenRegister}
              className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 rounded-lg flex items-center gap-1"
            >
              Register ₹{settings.registration_fee}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white bg-slate-800/50 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0f24] border-b border-white/10 px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm font-medium text-slate-300 pb-3 border-b border-white/5">
            <button onClick={() => scrollTo('about')} className="text-left py-2 px-3 rounded hover:bg-white/5">About</button>
            <button onClick={() => scrollTo('prizes')} className="text-left py-2 px-3 rounded hover:bg-white/5">Prizes</button>
            <button onClick={() => scrollTo('how-it-works')} className="text-left py-2 px-3 rounded hover:bg-white/5">How to Participate</button>
            <button onClick={() => scrollTo('rules')} className="text-left py-2 px-3 rounded hover:bg-white/5">Rules & Syllabus</button>
            <button onClick={() => scrollTo('faqs')} className="text-left py-2 px-3 rounded hover:bg-white/5">FAQs</button>
            <button onClick={() => scrollTo('contact')} className="text-left py-2 px-3 rounded hover:bg-white/5">Support</button>
          </div>
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenCheckStatus(); }}
              className="w-full py-2.5 text-xs font-semibold text-slate-300 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              Check Registration Status
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenRegister(); }}
              className="w-full py-3 text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-lg shadow-md flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              REGISTER NOW (₹{settings.registration_fee})
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
