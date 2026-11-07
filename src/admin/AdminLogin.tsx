import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { AdminUser } from '../types';

interface AdminLoginProps {
  onSuccess: (admin: AdminUser) => void;
  onExit: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onExit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both admin email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.adminLogin(email.trim(), password);
      onSuccess(res.admin);
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040714] bg-grid-pattern flex flex-col justify-center items-center p-4">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20 mb-4 border border-amber-300/40">
            <Lock className="w-7 h-7 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider">
            QUIZARENA <span className="text-amber-400">INDIA</span>
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mt-1">
            Private Administrative Console
          </p>
        </div>

        <div className="glass-card-gold rounded-3xl p-7 sm:p-8 border border-amber-500/30 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-6">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Authorized Administrator Access Only</span>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Email Address</span>
              </label>
              <input
                type="email"
                required
                placeholder="admin@quizarena.in or arnavgupta2580@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Security Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'ACCESS ADMIN PANEL'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={onExit}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              ← Back to Public Website
            </button>
            <span className="font-mono text-[11px] text-slate-500">AES-256 / SHA-512</span>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-6">
          QuizArena India • End-to-end Verified Administrative Environment
        </p>
      </div>
    </div>
  );
};
