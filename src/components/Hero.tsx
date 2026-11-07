import React, { useEffect, useState } from 'react';
import { Trophy, Award, Sparkles, ArrowRight, ShieldCheck, Clock, Users, Flame } from 'lucide-react';
import { WebsiteSettings, Competition } from '../types';

interface HeroProps {
  settings: WebsiteSettings;
  activeCompetition: Competition | undefined;
  onOpenRegister: () => void;
  onOpenCheckStatus: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  activeCompetition,
  onOpenRegister,
  onOpenCheckStatus
}) => {
  // Exam Date: 30th December 2026 (10:00 AM IST)
  const targetDate = activeCompetition?.start_date
    ? new Date(activeCompetition.start_date).getTime()
    : new Date('2026-12-30T10:00:00+05:30').getTime();

  const calculateTimeLeft = () => {
    const now = Date.now();
    const diff = targetDate - now;
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-[#050814] bg-grid-pattern">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[300px] bg-amber-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-semibold mb-6 animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>ALL INDIA ONLINE QUIZ CHAMPIONSHIP 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-slate-300">LIMITED SEATS</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Challenge Your Knowledge. <br className="hidden sm:inline" />
            <span className="gold-gradient-text">Prove Your Skills.</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
            {settings.hero_subheading ||
              "India's premier national online quiz battleground. Test your intellect across General Knowledge, Science, Indian Heritage & Current Affairs. Compete with thousands, win cash prizes, and earn verified national certificates."}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base sm:text-lg font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-500/25 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer border border-amber-200/60"
            >
              <Trophy className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              <span>REGISTER NOW</span>
              <span className="bg-slate-950/20 text-slate-950 px-2 py-0.5 rounded-md text-sm font-black">
                ₹{settings.registration_fee} ONLY
              </span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              onClick={onOpenCheckStatus}
              className="w-full sm:w-auto px-6 py-4 rounded-xl text-base font-semibold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition-all flex items-center justify-center gap-2.5 cursor-pointer backdrop-blur-sm"
            >
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Check Registration Status</span>
            </button>
          </div>

          {/* Live Countdown Box */}
          <div className="max-w-2xl mx-auto glass-card rounded-2xl p-4 sm:p-6 border border-white/10 mb-12 shadow-2xl">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Exam on 30th December 2026 • Starts In:</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>Last Date to Register: 30th Dec 2026</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              <div className="bg-slate-950/70 rounded-xl p-2.5 sm:p-3 border border-white/5">
                <span className="block text-2xl sm:text-4xl font-extrabold text-white font-mono">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Days</span>
              </div>
              <div className="bg-slate-950/70 rounded-xl p-2.5 sm:p-3 border border-white/5">
                <span className="block text-2xl sm:text-4xl font-extrabold text-white font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Hours</span>
              </div>
              <div className="bg-slate-950/70 rounded-xl p-2.5 sm:p-3 border border-white/5">
                <span className="block text-2xl sm:text-4xl font-extrabold text-white font-mono">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Mins</span>
              </div>
              <div className="bg-slate-950/70 rounded-xl p-2.5 sm:p-3 border border-white/5">
                <span className="block text-2xl sm:text-4xl font-extrabold text-amber-400 font-mono">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-amber-400/80 uppercase tracking-wider">Secs</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-white/5">
            <div className="glass-card rounded-xl p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-black text-amber-400">Laptop & Phones</div>
              <div className="text-xs text-slate-300 font-medium mt-0.5">Top Gadget Prizes</div>
            </div>
            <div className="glass-card rounded-xl p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-black text-white font-mono">50 MCQs</div>
              <div className="text-xs text-slate-300 font-medium mt-0.5">45 Minutes Online</div>
            </div>
            <div className="glass-card rounded-xl p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">100%</div>
              <div className="text-xs text-slate-300 font-medium mt-0.5">Skill & Knowledge</div>
            </div>
            <div className="glass-card rounded-xl p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-black text-white font-mono">₹{settings.registration_fee}</div>
              <div className="text-xs text-slate-300 font-medium mt-0.5">Nominal Entry Fee</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
