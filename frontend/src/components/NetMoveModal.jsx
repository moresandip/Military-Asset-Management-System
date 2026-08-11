import React from 'react';
import { X, Plus, Minus, ArrowRightLeft, ShoppingCart, Calculator } from 'lucide-react';

export const NetMoveModal = ({ isOpen, onClose, metrics }) => {
  if (!isOpen || !metrics) return null;

  const purchases = metrics.purchases || 0;
  const transfersIn = metrics.transfersIn || 0;
  const transfersOut = metrics.transfersOut || 0;
  const netMovement = metrics.netMovement || 0;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f1b2e] border border-cyan-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl glow-cyan relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6 border-b border-slate-800 pb-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30 text-cyan-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-mono">Net Movement Breakdown</h3>
            <p className="text-xs text-slate-400">Mathematical inventory audit breakdown</p>
          </div>
        </div>

        {/* Formula Box */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 mb-6 font-mono text-xs text-slate-300">
          <p className="text-cyan-400 font-semibold mb-1">EQUATION:</p>
          <p>Net Movement = Purchases + Transfers In - Transfers Out</p>
        </div>

        {/* Breakdown Items */}
        <div className="space-y-3 font-mono text-sm">
          <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2.5 text-slate-300">
              <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <span>Purchases (+)</span>
            </div>
            <span className="font-bold text-emerald-400">+{purchases.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2.5 text-slate-300">
              <div className="p-1 bg-cyan-500/20 text-cyan-400 rounded">
                <Plus className="w-4 h-4" />
              </div>
              <span>Transfers In (+)</span>
            </div>
            <span className="font-bold text-cyan-400">+{transfersIn.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2.5 text-slate-300">
              <div className="p-1 bg-rose-500/20 text-rose-400 rounded">
                <Minus className="w-4 h-4" />
              </div>
              <span>Transfers Out (-)</span>
            </div>
            <span className="font-bold text-rose-400">-{transfersOut.toLocaleString()}</span>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-base font-bold bg-cyan-950/40 p-3.5 rounded-xl border border-cyan-500/30">
            <span className="text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-cyan-400" /> Total Net Movement:
            </span>
            <span className={`font-mono ${netMovement >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netMovement >= 0 ? `+${netMovement.toLocaleString()}` : netMovement.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-xl transition border border-slate-700 font-mono text-sm"
        >
          Close Breakdown Window
        </button>
      </div>
    </div>
  );
};
