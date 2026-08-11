import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Flame, Plus, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

export const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' or 'expenditures'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Assignment Form State
  const [assignBaseId, setAssignBaseId] = useState(user?.baseId ? String(user.baseId) : '1');
  const [assignEquipmentTypeId, setAssignEquipmentTypeId] = useState('1');
  const [assignedToPersonnel, setAssignedToPersonnel] = useState('1st Platoon Bravo');
  const [assignQuantity, setAssignQuantity] = useState('15');

  // Expenditure Form State
  const [expendBaseId, setExpendBaseId] = useState(user?.baseId ? String(user.baseId) : '1');
  const [expendEquipmentTypeId, setExpendEquipmentTypeId] = useState('3');
  const [expendQuantity, setExpendQuantity] = useState('1000');
  const [expendReason, setExpendReason] = useState('Tactical field training exercises');

  const fetchData = async () => {
    try {
      const [aRes, eRes, bRes, eqRes] = await Promise.all([
        api.get('/ops/assignments'),
        api.get('/ops/expenditures'),
        api.get('/assets/bases'),
        api.get('/assets/equipment-types')
      ]);
      setAssignments(aRes.data);
      setExpenditures(eRes.data);
      setBases(bRes.data);
      setEquipmentTypes(eqRes.data);
    } catch (err) {
      console.error('Failed to fetch ops data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/ops/assignments', {
        baseId: Number(assignBaseId),
        equipmentTypeId: Number(assignEquipmentTypeId),
        assignedToPersonnel,
        quantity: Number(assignQuantity)
      });
      setMessage({ type: 'success', text: 'Personnel equipment assignment successfully recorded!' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Assignment failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpenditure = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/ops/expenditures', {
        baseId: Number(expendBaseId),
        equipmentTypeId: Number(expendEquipmentTypeId),
        quantity: Number(expendQuantity),
        reason: expendReason
      });
      setMessage({ type: 'success', text: 'Asset expenditure / consumable log recorded successfully!' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Expenditure log failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleReturnAssignment = async (id) => {
    try {
      await api.patch(`/ops/assignments/${id}/return`);
      fetchData();
    } catch (err) {
      console.error('Failed to return assignment:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-[#0d172a] p-5 rounded-2xl border border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-mono flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" /> Personnel Assignments & Asset Expenditures
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Track equipment issued to tactical personnel and mark consumed ammunition / expended assets.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 font-mono text-xs">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2.5 rounded-t-xl font-bold transition flex items-center gap-2 ${
            activeTab === 'assignments' 
              ? 'bg-slate-800 text-cyan-400 border-t border-x border-cyan-500/30' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> Personnel Assignments
        </button>

        <button
          onClick={() => setActiveTab('expenditures')}
          className={`px-4 py-2.5 rounded-t-xl font-bold transition flex items-center gap-2 ${
            activeTab === 'expenditures' 
              ? 'bg-slate-800 text-amber-400 border-t border-x border-amber-500/30' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4" /> Expended Consumables & Wear
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-xs font-mono border ${
          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
        }`}>
          {message.text}
        </div>
      )}

      {/* ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {/* Assignment Creation Form */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-2 uppercase tracking-wider">
              <Plus className="w-4 h-4" /> Issue Equipment Assignment to Unit/Personnel
            </h2>

            <form onSubmit={handleCreateAssignment} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Base Installation</label>
                <select
                  value={assignBaseId}
                  onChange={(e) => setAssignBaseId(e.target.value)}
                  disabled={user?.role === 'BASE_COMMANDER'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-cyan-400"
                >
                  {bases.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Equipment Type</label>
                <select
                  value={assignEquipmentTypeId}
                  onChange={(e) => setAssignEquipmentTypeId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-cyan-400"
                >
                  {equipmentTypes.map((eq) => (
                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Assigned Unit / Personnel</label>
                <input
                  type="text"
                  value={assignedToPersonnel}
                  onChange={(e) => setAssignedToPersonnel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-cyan-400"
                  placeholder="Unit or Officer Name"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Quantity Issued</label>
                <input
                  type="number"
                  min="1"
                  value={assignQuantity}
                  onChange={(e) => setAssignQuantity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-cyan-400"
                  required
                />
              </div>

              <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <Plus className="w-4 h-4" /> {loading ? 'Issuing...' : 'Issue Equipment Assignment'}
                </button>
              </div>
            </form>
          </div>

          {/* Assignments Log Table */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" /> Active & Historical Duty Assignments
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 font-mono text-xs text-slate-400 uppercase">
                    <th className="py-3 px-4">Assignment Date</th>
                    <th className="py-3 px-4">Base Garrison</th>
                    <th className="py-3 px-4">Equipment Item</th>
                    <th className="py-3 px-4">Assigned Personnel / Unit</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs text-slate-300">
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 text-slate-400">{new Date(a.assignment_date).toLocaleString()}</td>
                      <td className="py-3 px-4 font-semibold text-white">{a.base_name}</td>
                      <td className="py-3 px-4 text-cyan-400 font-bold">{a.equipment_name}</td>
                      <td className="py-3 px-4 text-slate-200 font-medium">{a.assigned_to_personnel}</td>
                      <td className="py-3 px-4 font-bold text-white">{a.quantity.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.status === 'ACTIVE' 
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' 
                            : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                        }`}>
                          ● {a.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {a.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleReturnAssignment(a.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium border border-slate-700 transition flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3 text-cyan-400" /> Mark Returned
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EXPENDITURES TAB */}
      {activeTab === 'expenditures' && (
        <div className="space-y-6">
          {/* Expenditure Logging Form */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold font-mono text-amber-400 flex items-center gap-2 uppercase tracking-wider">
              <Flame className="w-4 h-4" /> Log Consumed Asset / Spent Ammunition
            </h2>

            <form onSubmit={handleCreateExpenditure} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Base Installation</label>
                <select
                  value={expendBaseId}
                  onChange={(e) => setExpendBaseId(e.target.value)}
                  disabled={user?.role === 'BASE_COMMANDER'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-amber-400"
                >
                  {bases.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Equipment Designation</label>
                <select
                  value={expendEquipmentTypeId}
                  onChange={(e) => setExpendEquipmentTypeId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-amber-400"
                >
                  {equipmentTypes.map((eq) => (
                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Quantity Expended</label>
                <input
                  type="number"
                  min="1"
                  value={expendQuantity}
                  onChange={(e) => setExpendQuantity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Operational Reason / Details</label>
                <input
                  type="text"
                  value={expendReason}
                  onChange={(e) => setExpendReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-amber-400"
                  placeholder="e.g. Live-fire exercise"
                  required
                />
              </div>

              <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Flame className="w-4 h-4" /> {loading ? 'Logging Expenditure...' : 'Log Asset Expenditure'}
                </button>
              </div>
            </form>
          </div>

          {/* Expenditures Log Table */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" /> Historical Asset Expenditure Logs
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 font-mono text-xs text-slate-400 uppercase">
                    <th className="py-3 px-4">Date Recorded</th>
                    <th className="py-3 px-4">Base Garrison</th>
                    <th className="py-3 px-4">Equipment Item</th>
                    <th className="py-3 px-4">Quantity Expended</th>
                    <th className="py-3 px-4">Operational Reason</th>
                    <th className="py-3 px-4">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs text-slate-300">
                  {expenditures.map((ex) => (
                    <tr key={ex.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 text-slate-400">{new Date(ex.date).toLocaleString()}</td>
                      <td className="py-3 px-4 font-semibold text-white">{ex.base_name}</td>
                      <td className="py-3 px-4 text-cyan-400 font-bold">{ex.equipment_name}</td>
                      <td className="py-3 px-4 font-bold text-rose-400">-{ex.quantity.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-300">{ex.reason}</td>
                      <td className="py-3 px-4 text-slate-400">{ex.recorded_by_user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
