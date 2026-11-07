import React from 'react';
import { BookOpen, CheckCircle2, ShieldAlert, Award, Compass, Sparkles } from 'lucide-react';
import { Competition } from '../types';

interface RulesAndSyllabusProps {
  competition: Competition | undefined;
}

export const RulesAndSyllabus: React.FC<RulesAndSyllabusProps> = ({ competition }) => {
  const topics = competition?.topics || [
    'Indian History & National Heritage',
    'Science, Space & Modern Technology',
    'Geography & Wildlife of India',
    'Sports, Cricket & Global Olympics',
    'Current Affairs & National Events',
    'Logical Reasoning & Analytical Ability'
  ];

  const rules = competition?.rules || [
    'Total 50 multiple choice questions (MCQ).',
    '45 Minutes overall exam duration.',
    '+2 Marks for every correct answer, -0.5 for wrong answers.',
    'Tie-breaker is determined by the total submission time recorded by the server.',
    'Accessible on any smartphone, tablet, laptop, or desktop with a modern browser.'
  ];

  return (
    <section id="rules" className="py-20 bg-[#070c1e] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>EXAMINATION BLUEPRINT</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Rules, Format & <span className="gold-gradient-text">Syllabus</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Fair, transparent, and 100% skill-based examination protocol. Designed to reward genuine knowledge.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Rules & Examination Format */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Competition Rules & Format</h3>
                <p className="text-xs text-slate-400">Strict adherence enforced by proctoring engine</p>
              </div>
            </div>

            <ul className="space-y-4">
              {rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-amber-500/30">
                    {idx + 1}
                  </div>
                  <span className="leading-relaxed">{rule}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 p-4 rounded-xl bg-slate-900/80 border border-amber-500/20 text-xs text-slate-300">
              <strong className="text-amber-400 block mb-1">⚖️ Skill-Based Competition Declaration:</strong>
              QuizArena India operates strictly as a game of skill under Indian law. Evaluation is purely predicated on participant knowledge, cognitive agility, and academic recall. No lottery, sweepstakes, or games of chance.
            </div>
          </div>

          {/* Topics & Syllabus */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Compass className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Curated Syllabus</h3>
                <p className="text-xs text-slate-400">Balanced questions ranging from foundational to expert level</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {topics.map((topic, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-amber-500/30 transition-all flex items-center gap-2.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-slate-200">{topic}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Marking & Scoring Matrix</h4>
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="bg-slate-950/60 p-2 rounded-lg">
                  <div className="text-base font-bold text-emerald-400 font-mono">+2.0</div>
                  <div className="text-[10px] text-slate-400">Correct Answer</div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg">
                  <div className="text-base font-bold text-rose-400 font-mono">-0.5</div>
                  <div className="text-[10px] text-slate-400">Incorrect Answer</div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg">
                  <div className="text-base font-bold text-slate-300 font-mono">0.0</div>
                  <div className="text-[10px] text-slate-400">Unattempted</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
