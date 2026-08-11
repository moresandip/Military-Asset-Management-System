import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Plus, Calendar, Building, DollarSign, User, ShieldCheck } from 'lucide-react';

export const Purchases = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Form state
  const [baseId, setBaseId] = useState(user?.baseId ? String(user.baseId) : '1');
  const [equipmentTypeId, setEquipmentTypeId] = useState('1');
  const [quantity, setQuantity] = useState('50');
  const [unitCost, setUnitCost] = useState('1200');
  const [supplier, setSupplier] = useState('General Defense Industries');

  const canCreate = ['ADMIN', 'LOGISTICS_OFFICER'].includes(user?.role);

  const fetchPurchases = async () => {
    try {
      const [pRes, bRes, eqRes] = await Promise.all([
        api.get('/purchases'),
        api.get('/assets/bases'),
        api.get('/assets/equipment-types')
      ]);
      setPurchases(pRes.data);
      setBases(bRes.data);
      setEquipmentTypes(eqRes.data);
    } catch (err) {
      console.error('Failed to load purchases:', err);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/purchases', {
        baseId: Number(baseId),
        equipmentTypeId: Number(equipmentTypeId),
        quantity: Number(quantity),
        unitCost: Number(unitCost),
        supplier
      });
      setMessage({ type: 'success', text: 'Stock purchase intake recorded successfully!' });
      fetchPurchases();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to record purchase' });
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
            <ShoppingCart className="w-6 h-6 text-cyan-400" /> Stock Purchases & Asset Procurement
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Log incoming inventory purchases. Adds stock directly to base opening/net balances.
          </p>
        </div>
      </div>

      {/* Procurement Form (RBAC restricted to Admin & Logistics Officer) */}
      {canCreate ? (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-2 uppercase tracking-wider">
            <Plus className="w-4 h-4" /> Record New Inventory Purchase
          </h2>

          {message && (
            <div className={`p-3 rounded-xl text-xs font-mono border ${
              message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 font-mono text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Destination Base</label>
              <select
                value={baseId}
                onChange={(e) => setBaseId(e.target.value)}
                disabled={user?.role === 'BASE_COMMANDER'}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-cyan-400"
              >
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
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
              <label className="block text-slate-400 mb-1">Quantity</label>
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
              <label className="block text-slate-400 mb-1">Unit Cost ($ USD)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Supplier Contractor</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-cyan-400"
                placeholder="Defense Supplier"
                required
              />
            </div>

            <div className="md:col-span-3 lg:col-span-5 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4" /> {loading ? 'Logging Procurement...' : 'Log Asset Intake'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 font-mono text-xs">
          🔒 RBAC Notice: Purchasing authority restricted to Administrators and Logistics Officers.
        </div>
      )}

      {/* Historical Purchases Log Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-cyan-400" /> Historical Procurement Audit Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 font-mono text-xs text-slate-400 uppercase">
                <th className="py-3 px-4">Intake Date</th>
                <th className="py-3 px-4">Base Garrison</th>
                <th className="py-3 px-4">Equipment Item</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs text-slate-300">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4 text-slate-400">{new Date(p.date).toLocaleString()}</td>
                  <td className="py-3 px-4 font-semibold text-white">{p.base_name}</td>
                  <td className="py-3 px-4 text-cyan-400 font-bold">{p.equipment_name}</td>
                  <td className="py-3 px-4 font-bold text-emerald-400">+{p.quantity.toLocaleString()}</td>
                  <td className="py-3 px-4">${p.unit_cost?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-300">{p.supplier}</td>
                  <td className="py-3 px-4 text-slate-400">{p.created_by_user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
