import React, { useState } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Trophy,
  Download,
  Calendar,
  MapPin,
  ShieldCheck,
  Phone,
  Mail,
  Send,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

interface CheckStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  supportPhone: string;
  supportEmail: string;
}

export const CheckStatusModal: React.FC<CheckStatusModalProps> = ({
  isOpen,
  onClose,
  supportPhone,
  supportEmail
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter your Registration ID or 10-digit mobile number.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await api.checkRegistrationStatus(query.trim());
      setResult(res.data);
    } catch (err: any) {
      setError(err.message || 'No matching registration found. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-xl bg-[#090e24] border border-amber-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/80 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0b1333] via-[#101a42] to-[#0b1333] px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Search className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                CHECK REGISTRATION STATUS
              </h3>
              <p className="text-[11px] text-slate-400">
                Track payment verification & download your admit pass
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
        <div className="p-6 space-y-6">
          {/* Search Box */}
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Enter Registration ID or Registered Mobile
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. QAI-2026-78421 or 9876543210"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 font-mono"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md text-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Check</span>
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Status Result Display */}
          {result && (
            <div className="space-y-4 pt-2">
              {/* PENDING STATUS */}
              {result.status === 'PENDING' && (
                <div className="bg-slate-950/90 rounded-2xl p-5 border border-amber-500/30 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">Payment Awaiting Verification</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase">
                          PENDING
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Submitted on {new Date(result.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-white/5">
                    Your payment of <strong>₹{result.payment_amount}</strong> (UTR: <code className="text-amber-400 font-mono">{result.utr_number}</code>) is currently undergoing manual verification by our administration team. Verification typically completes within 2–4 hours.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-3">
                    <div>
                      <span className="text-slate-400 block">Registration ID:</span>
                      <span className="font-mono font-bold text-white">{result.registration_id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Participant:</span>
                      <span className="font-bold text-white">{result.full_name}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CONFIRMED STATUS - OFFICIAL ADMIT CARD */}
              {result.status === 'CONFIRMED' && (
                <div className="bg-gradient-to-b from-[#0e1738] to-[#080d24] rounded-2xl p-6 border-2 border-amber-400/80 shadow-2xl space-y-5">
                  <div className="flex items-start justify-between border-b border-amber-400/30 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                        <Trophy className="w-6 h-6 text-slate-950 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-amber-400 tracking-wider uppercase block">
                          QUIZARENA INDIA
                        </span>
                        <h4 className="text-lg font-black text-white">OFFICIAL ADMIT PASS</h4>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      CONFIRMED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-400 block text-[10px] uppercase">Reg ID</span>
                      <span className="font-mono font-black text-amber-400 text-sm">{result.registration_id}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-400 block text-[10px] uppercase">Candidate</span>
                      <span className="font-bold text-white truncate block">{result.full_name}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-400 block text-[10px] uppercase">State</span>
                      <span className="font-bold text-white">{result.state}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-400 block text-[10px] uppercase">Exam Date</span>
                      <span className="font-bold text-amber-400">30th Dec 2026</span>
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Your ₹{result.payment_amount} payment has been officially verified. Your exam portal credentials will be emailed to {result.email}.</span>
                  </div>

                  {/* Telegram Channel Section for Confirmed Quizzers */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#0088cc]/15 via-[#00a2ed]/10 to-[#0088cc]/15 border border-[#0088cc]/40 text-center space-y-2.5">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#38bdf8] uppercase tracking-wider">
                      <Send className="w-3.5 h-3.5 text-[#38bdf8]" />
                      <span>Official Quiz Telegram Updates Channel</span>
                    </div>

                    <div>
                      <a
                        href="https://t.me/quizarenaindia"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-black text-sm shadow-md transition-all cursor-pointer font-mono"
                      >
                        <span>https://t.me/quizarenaindia</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <p className="text-xs text-slate-200 font-medium">
                      join this telegram link for more updates about Quiz
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handlePrintCard}
                      className="flex-1 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      <span>Print / Save Admit Card</span>
                    </button>
                  </div>
                </div>
              )}

              {/* REJECTED STATUS */}
              {result.status === 'REJECTED' && (
                <div className="bg-slate-950/90 rounded-2xl p-5 border border-rose-500/40 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                      <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">Registration Rejected</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 uppercase">
                          REJECTED
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Reviewed by Administrator
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
                    <strong className="block text-rose-400">Reason for Rejection:</strong>
                    <p>{result.rejection_reason || 'Payment screenshot or UTR number could not be validated against official bank records.'}</p>
                  </div>

                  <div className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-white/5">
                    If you believe this is an error or need to submit the correct payment receipt, please contact our support team at <a href={`mailto:${supportEmail}`} className="text-amber-400 underline">{supportEmail}</a> or WhatsApp <a href={`https://wa.me/${supportPhone.replace(/\D/g, '')}`} className="text-amber-400 underline">{supportPhone}</a>.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
