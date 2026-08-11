import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { NetMoveModal } from '../components/NetMoveModal';
import { 
  Building, 
  Filter, 
  RefreshCw, 
  ShieldCheck, 
  Boxes, 
  Activity, 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';

export const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  // Filters
  const [selectedBase, setSelectedBase] = useState(user?.role === 'BASE_COMMANDER' ? String(user.baseId) : '');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [metricsRes, basesRes, eqRes] = await Promise.all([
        api.get('/assets/dashboard-metrics', {
          params: {
            baseId: selectedBase || undefined,
            equipmentTypeId: selectedEquipment || undefined
          }
        }),
        api.get('/assets/bases'),
        api.get('/assets/equipment-types')
      ]);

      setMetrics(metricsRes.data);
      setBases(basesRes.data);
      setEquipmentTypes(eqRes.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBase, selectedEquipment]);

  // Colors for Recharts
  const COLORS = ['#00f2fe', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

  const pieData = metrics ? [
    { name: 'Available / Stock', value: metrics.closingBalance, color: '#10b981' },
    { name: 'Assigned to Personnel', value: metrics.assigned, color: '#00f2fe' },
    { name: 'Expended / Spent', value: metrics.expended, color: '#f43f5e' }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Filter Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#0d172a] p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-mono flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" /> Operational Command Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Real-time balance calculations: Opening + Net Movement - Assigned - Expended = Closing Balance
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Base Selector */}
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
            <Building className="w-4 h-4 text-cyan-400" />
            <select
              value={selectedBase}
              onChange={(e) => setSelectedBase(e.target.value)}
              disabled={user?.role === 'BASE_COMMANDER'}
              className="bg-transparent text-sm text-slate-200 focus:outline-none font-mono disabled:opacity-60 cursor-pointer"
            >
              <option value="">All Bases (Global View)</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          {/* Equipment Type Selector */}
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
            <Boxes className="w-4 h-4 text-cyan-400" />
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="bg-transparent text-sm text-slate-200 focus:outline-none font-mono cursor-pointer"
            >
              <option value="">All Equipment Categories</option>
              {equipmentTypes.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} ({eq.category})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchData}
            title="Refresh Data"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl transition border border-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Dynamic Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Opening Balance"
          value={metrics ? metrics.openingBalance : '...'}
          icon={Boxes}
          color="blue"
          subtitle="Baseline stock"
        />

        <StatCard
          title="Net Movement"
          value={metrics ? (metrics.netMovement >= 0 ? `+${metrics.netMovement}` : metrics.netMovement) : '...'}
          icon={TrendingUp}
          color="emerald"
          clickable={true}
          onClick={() => setShowModal(true)}
          subtitle="Click for breakdown pop-up"
        />

        <StatCard
          title="Assigned Assets"
          value={metrics ? metrics.assigned : '...'}
          icon={ShieldCheck}
          color="cyan"
          subtitle="Active in personnel duty"
        />

        <StatCard
          title="Expended Assets"
          value={metrics ? metrics.expended : '...'}
          icon={Activity}
          color="amber"
          subtitle="Consumed ammunition & wear"
        />

        <StatCard
          title="Closing Balance"
          value={metrics ? metrics.closingBalance : '...'}
          icon={Boxes}
          color="cyan"
          subtitle="Final real-time availability"
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" /> Equipment Stock & Allocation by Category
            </h3>
            <span className="text-xs font-mono text-slate-400">Purchased vs Assigned</span>
          </div>

          <div className="h-64 w-full">
            {metrics?.categoryBreakdown && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.categoryBreakdown}>
                  <XAxis dataKey="category" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="purchased" name="Purchased Stock" fill="#00f2fe" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="assigned" name="Assigned" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expended" name="Expended" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-cyan-400" /> Stock Status Distribution
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Equipment Inventory Summary Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
          <Boxes className="w-4 h-4 text-cyan-400" /> Equipment Stock Inventory Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 font-mono text-xs text-slate-400 uppercase">
                <th className="py-3 px-4">Equipment Designation</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Net Stock</th>
                <th className="py-3 px-4">Active Assigned</th>
                <th className="py-3 px-4">Expended</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs text-slate-300">
              {metrics?.equipmentStock?.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4 font-semibold text-white">{item.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-cyan-400 font-bold">{(item.net_stock || 0).toLocaleString()} {item.unit_of_measure}</td>
                  <td className="py-3 px-4 text-emerald-400">{(item.active_assigned || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-rose-400 font-semibold">{(item.total_expended || 0).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      (item.net_stock || 0) > 50 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {(item.net_stock || 0) > 50 ? '● OPTIMAL' : '▲ REORDER NEEDED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Net Movement Detail Pop-Up Modal */}
      <NetMoveModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        metrics={metrics}
      />
    </div>
  );
};
