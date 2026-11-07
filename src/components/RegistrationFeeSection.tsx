import React from 'react';
import { IndianRupee, ShieldCheck, Server, Trophy, CheckCircle2, ArrowRight } from 'lucide-react';

interface RegistrationFeeSectionProps {
  fee: number;
  onOpenRegister: () => void;
}

export const RegistrationFeeSection: React.FC<RegistrationFeeSectionProps> = ({ fee, onOpenRegister }) => {
  return (
    <section className="py-20 bg-[#050814] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card-gold rounded-3xl p-8 sm:p-12 border border-amber-500/30 max-w-5xl mx-auto relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Fee Highlight */}
            <div className="lg:col-span-5 text-center lg:text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-500/30">
                Transparent & Affordable
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Nominal Registration Fee
              </h2>
              <div className="my-6">
                <div className="flex items-baseline justify-center lg:justify-start gap-1">
                  <span className="text-5xl sm:text-7xl font-black text-amber-400 font-mono">₹{fee}</span>
                  <span className="text-slate-400 text-sm font-semibold">/ participant</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">One-time participation fee. No hidden charges.</p>
              </div>

              <button
                onClick={onOpenRegister}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/25 transition-all inline-flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>REGISTER NOW FOR ₹{fee}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right Column: Breakdown */}
            <div className="lg:col-span-7 bg-slate-950/60 rounded-2xl p-6 border border-white/5 space-y-4">
              <h3 className="text-base font-bold text-slate-200">What does your ₹{fee} cover?</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Server className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Cloud Examination Servers</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">High-speed low-latency servers to host thousands simultaneously.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">AI Proctoring Engine</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Fair play mechanisms and browser integrity monitoring.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Grand Prize Pool & Trophies</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Direct funding for Laptop, Smartphones, Smartwatches & Trophies.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Verified Digital Certificate</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Tamper-proof verifiable QR digital participation certificate.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
