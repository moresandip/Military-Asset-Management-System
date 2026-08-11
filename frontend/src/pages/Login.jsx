import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, ShieldCheck, Database, Key } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('admin_user');
  const [password, setPassword] = useState('AdminPass123!');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-[#070c17] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Military Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/30 text-cyan-400 mb-3 glow-cyan">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wider font-mono">MILITARY ASSET MANAGEMENT SYSTEM</h1>
          <p className="text-slate-400 text-xs mt-1 font-mono uppercase tracking-widest">
            Enterprise Operational Command Portal
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-slate-800 relative">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-mono">
            <Lock className="w-5 h-5 text-cyan-400" /> Tactical Sign In
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-mono">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-slate-300 mb-1">
                Military ID / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono text-sm"
                  placeholder="Enter username..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-slate-300 mb-1">
                Access Token / Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono text-sm"
                  placeholder="Enter password..."
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition flex items-center justify-center space-x-2 font-mono shadow-lg shadow-cyan-500/20"
            >
              <span>{loading ? 'Authenticating...' : 'AUTHENTICATE & LOG IN'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Quick Fill Preset Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-xs font-mono uppercase font-semibold text-slate-400 mb-3 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Select Test Credentials:
            </p>
            <div className="space-y-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => handleQuickFill('admin_user', 'AdminPass123!')}
                className="w-full text-left p-2.5 bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-700 flex justify-between items-center text-slate-300 transition"
              >
                <div>
                  <span className="font-bold text-cyan-400">Admin</span> - General Vance
                  <div className="text-[11px] text-slate-500">Global Command Access</div>
                </div>
                <span className="text-emerald-400">Select →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('commander_alpha', 'CommandPass123!')}
                className="w-full text-left p-2.5 bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-700 flex justify-between items-center text-slate-300 transition"
              >
                <div>
                  <span className="font-bold text-amber-400">Base Commander</span> - Col. Jenkins
                  <div className="text-[11px] text-slate-500">Fort Alpha (Base #1)</div>
                </div>
                <span className="text-emerald-400">Select →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('logistics_officer', 'LogisticsPass123!')}
                className="w-full text-left p-2.5 bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-700 flex justify-between items-center text-slate-300 transition"
              >
                <div>
                  <span className="font-bold text-indigo-400">Logistics Officer</span> - Capt. Miller
                  <div className="text-[11px] text-slate-500">Transfers & Purchases</div>
                </div>
                <span className="text-emerald-400">Select →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
