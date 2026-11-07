import React from 'react';
import { UserCheck, QrCode, FileCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface HowToParticipateProps {
  registrationFee: number;
  onOpenRegister: () => void;
}

export const HowToParticipate: React.FC<HowToParticipateProps> = ({ registrationFee, onOpenRegister }) => {
  const steps = [
    {
      step: '01',
      title: 'Fill Participant Details',
      desc: 'Enter your basic contact information, age, state, and city. Valid Indian mobile number is required.',
      icon: UserCheck,
      badge: 'Step 1'
    },
    {
      step: '02',
      title: `Pay ₹${registrationFee} via Official QR`,
      desc: 'Scan our official UPI QR code using PhonePe, GPay, Paytm, BHIM, or any banking app.',
      icon: QrCode,
      badge: 'Step 2'
    },
    {
      step: '03',
      title: 'Submit UTR & Screenshot',
      desc: 'Enter your 12-digit UPI Transaction ID (UTR) and upload your payment confirmation receipt.',
      icon: FileCheck,
      badge: 'Step 3'
    },
    {
      step: '04',
      title: 'Manual Verification & Admit Pass',
      desc: 'Our team verifies your transaction. Once verified, download your confirmed Admit Pass & exam link.',
      icon: CheckCircle2,
      badge: 'Confirmation'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#050814] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-3">
            <span>EASY 4-STEP PROCESS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            How to <span className="gold-gradient-text">Participate</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            A seamless, transparent, and completely digital process designed for participants from every state of India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((s, index) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="glass-card rounded-2xl p-6 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-black text-slate-600 group-hover:text-amber-400/80 transition-colors font-mono">
                      {s.step}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {s.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-amber-400" />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{s.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs font-semibold text-amber-400/90 gap-1">
                  <span>Fast & Secure</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 text-center">
          <button
            onClick={onOpenRegister}
            className="px-8 py-4 rounded-xl text-base font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-500/25 transition-all inline-flex items-center gap-3 cursor-pointer"
          >
            <span>START YOUR REGISTRATION</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
