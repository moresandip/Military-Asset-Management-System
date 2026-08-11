import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftRight, Send, Building, Boxes, AlertTriangle, CheckCircle } from 'lucide-react';

export const Transfers = () => {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Form state
  const [sourceBaseId, setSourceBaseId] = useState(user?.baseId ? String(user.baseId) : '1');
  const [destinationBaseId, setDestinationBaseId] = useState('2');
  const [equipmentTypeId, setEquipmentTypeId] = useState('1');
  const [quantity, setQuantity] = useState('10');
  const [notes, setNotes] = useState('Strategic asset reallocation');

  const fetchTransfers = async () => {
    try {
      const [tRes, bRes, eqRes] = await Promise.all([
        api.get('/transfers'),
        api.get('/assets/bases'),
        api.get('/assets/equipment-types')
      ]);
      setTransfers(tRes.data);
      setBases(bRes.data);
      setEquipmentTypes(eqRes.data);
    } catch (err) {
      console.error('Failed to load transfers:', err);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (sourceBaseId === destinationBaseId) {
      setMessage({ type: 'error', text: 'Source base and destination base cannot be the same military base.' });
      setLoading(false);
      return;
    }

    try {
      await api.post('/transfers', {
        sourceBaseId: Number(sourceBaseId),
        destinationBaseId: Number(destinationBaseId),
        equipmentTypeId: Number(equipmentTypeId),
        quantity: Number(quantity),
        notes
      });
      setMessage({ type: 'success', text: 'Atomic cross-base asset transfer executed and committed successfully!' });
      fetchTransfers();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Transfer failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-[#0d172a] p-5 rounded-2xl border border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-mono flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-cyan-400" /> Cross-Base Atomic Asset Transfers
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Execute transactional transfers (BEGIN...COMMIT) between military installations with strict audit trails.
          </p>
        </div>
      </div>

      {/* Transfer Execution Form */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-2 uppercase tracking-wider">
          <Send className="w-4 h-4" /> Initiate Cross-Base Asset Transfer
        </h2>

        {message && (
          <div className={`p-3 rounded-xl text-xs font-mono border ${
            message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4 inline mr-1" /> : <AlertTriangle className="w-4 h-4 inline mr-1" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 font-mono text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Source Base (Origin)</label>
            <select
              value={sourceBaseId}
              onChange={(e) => setSourceBaseId(e.target.value)}
              disabled={user?.role === 'BASE_COMMANDER'}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-cyan-400"
            >
              {bases.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Destination Base (Recipient)</label>
            <select
              value={destinationBaseId}
              onChange={(e) => setDestinationBaseId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-cyan-400"
            >
              {bases.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Equipment Designation</label>
            <select
              value={equipmentTypeId}
              onChange={(e) => setEquipmentTypeId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-cyan-400"
            >
              {equipmentTypes.map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.name} ({eq.category})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Transfer Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Transfer Rationale / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-cyan-400"
              placeholder="e.g. Tactical rebalance"
              required
            />
          </div>

          <div className="md:col-span-2 lg:col-span-5 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <ArrowLeftRight className="w-4 h-4" /> {loading ? 'Executing Atomic Transaction...' : 'Execute Atomic Transfer'}
            </button>
          </div>
        </form>
      </div>

      {/* Historical Movement Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-cyan-400" /> Historical Cross-Base Asset Movements
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 font-mono text-xs text-slate-400 uppercase">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Origin Base</th>
                <th className="py-3 px-4">Destination Base</th>
                <th className="py-3 px-4">Equipment Item</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4">Initiated By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs text-slate-300">
              {transfers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4 text-slate-400">{new Date(t.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-4 font-semibold text-amber-400">{t.source_base_name}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-400">{t.destination_base_name}</td>
                  <td className="py-3 px-4 text-cyan-400 font-bold">{t.equipment_name}</td>
                  <td className="py-3 px-4 font-bold text-white">{t.quantity.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      ● {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{t.notes}</td>
                  <td className="py-3 px-4 text-slate-400">{t.initiated_by_user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
