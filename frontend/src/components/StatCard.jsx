import React from 'react';
import { ArrowUpRight, Info } from 'lucide-react';

export const StatCard = ({ title, value, icon: Icon, color, onClick, subtitle, clickable = false }) => {
  const colorStyles = {
    blue: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    emerald: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    amber: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    rose: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
    cyan: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
  }[color || 'cyan'];

  return (
    <div
      onClick={onClick}
      className={`glass-card p-5 rounded-2xl border relative overflow-hidden transition ${
        clickable ? 'cursor-pointer hover:border-cyan-400 hover:scale-[1.02]' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          {title}
          {clickable && <Info className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />}
        </span>
        <div className={`p-2.5 rounded-xl border ${colorStyles}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {clickable && (
          <span className="text-xs font-mono text-cyan-400 flex items-center gap-0.5 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            View Breakdown <ArrowUpRight className="w-3 h-3" />
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-400 font-mono">
          {subtitle}
        </p>
      )}
    </div>
  );
};
