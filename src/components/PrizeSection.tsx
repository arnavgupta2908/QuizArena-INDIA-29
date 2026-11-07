import React from 'react';
import { Trophy, Award, Medal, Smartphone, Laptop, Watch, Headphones, FileCheck, CheckCircle2 } from 'lucide-react';
import { Competition } from '../types';

interface PrizeSectionProps {
  competition: Competition | undefined;
  onOpenRegister: () => void;
}

export const PrizeSection: React.FC<PrizeSectionProps> = ({ competition, onOpenRegister }) => {
  return (
    <section id="prizes" className="py-20 bg-[#070c1e] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-3">
            <Trophy className="w-3.5 h-3.5" />
            <span>REWARDS & RECOGNITION</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Compete for <span className="gold-gradient-text">Glory & Grand Prizes</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Showcase your intelligence on the national stage. Win premium laptops, smartphones, smartwatches, headphones, and verified certificates.
          </p>
        </div>

        {/* 3 Main Prize Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12 items-stretch">
          {/* 2nd to 5th Place - Mobile Phone */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-700/60 relative flex flex-col justify-between order-2 md:order-1 hover:border-slate-400/40 transition-all">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-200 border border-slate-600 text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
              RANKS 2ND TO 5TH
            </div>
            <div className="text-center pt-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
                <Smartphone className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">2nd to 5th Prize</h3>
              <div className="text-2xl sm:text-3xl font-black text-white my-3">
                Smart Mobilephone
              </div>
              <p className="text-xs text-slate-400">Awarded to top 4 runners up (Ranks 2, 3, 4 & 5)</p>
              
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 text-left mt-6 pt-4 border-t border-white/10">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span><strong>Brand New 5G Smartphone</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>Custom Silver Trophy & Medal</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>Framed Certificate of Excellence</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>National Hall of Fame Recognition</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 1st Place - Champion Laptop */}
          <div className="glass-card-gold rounded-2xl p-8 sm:p-10 border-2 border-amber-400 relative flex flex-col justify-between order-1 md:order-2 shadow-2xl shadow-amber-500/20 transform md:-translate-y-4">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5 tracking-wider whitespace-nowrap">
              <Trophy className="w-3.5 h-3.5" />
              <span>1ST RANK CHAMPION</span>
            </div>
            <div className="text-center pt-4">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/40 mb-4 border border-amber-200">
                <Laptop className="w-11 h-11 text-slate-950 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black text-amber-400 uppercase tracking-wider">Grand 1st Prize</h3>
              <div className="text-3xl sm:text-4xl font-black text-white my-3">
                Brand New Laptop
              </div>
              <p className="text-xs text-amber-200/80">High-Performance Laptop for All-India Champion</p>
              
              <ul className="space-y-3 text-sm text-slate-200 text-left mt-6 pt-4 border-t border-amber-500/20">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Brand New Laptop (Latest Generation)</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Grand National Gold Trophy</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Official Framed Certificate of Championship</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Featured Profile on National QuizArena Portal</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-4">
              <button
                onClick={onOpenRegister}
                className="w-full py-3.5 px-4 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md shadow-amber-500/30 text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>CLAIM YOUR SHOT AT THE LAPTOP</span>
              </button>
            </div>
          </div>

          {/* 5th to 10th Place - Smartwatch & Headphones */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-700/60 relative flex flex-col justify-between order-3 md:order-3 hover:border-amber-700/40 transition-all">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 text-amber-400 border border-amber-600/60 text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
              RANKS 5TH TO 10TH
            </div>
            <div className="text-center pt-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-600/20 mb-4">
                <div className="flex items-center gap-1 text-white">
                  <Watch className="w-7 h-7" />
                  <Headphones className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-200">5th to 10th Prize</h3>
              <div className="text-xl sm:text-2xl font-black text-white my-3">
                Smart Watch & Headphones
              </div>
              <p className="text-xs text-slate-400">Premium Tech Combo for Rankers 5 to 10</p>
              
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 text-left mt-6 pt-4 border-t border-white/10">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Smartwatch with Health & Fitness Suite</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Wireless Over-Ear / ANC Headphones</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>Framed Certificate of High Merit</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>Special Recognition Badge & Entry to Next Season</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Certificate for All Participants */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <FileCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                Guaranteed Recognition for Everyone
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white">
                Official Digital Certificate of National Participation
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Every verified participant receives a tamper-proof, QR-verifiable certificate celebrating their effort in the National Championship.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenRegister}
            className="px-6 py-3 rounded-xl font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 text-xs sm:text-sm shrink-0 transition-all cursor-pointer shadow-md"
          >
            Register & Participate
          </button>
        </div>
      </div>
    </section>
  );
};
