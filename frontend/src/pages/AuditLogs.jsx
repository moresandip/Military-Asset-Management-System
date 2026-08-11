import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Filter, Search, User, Globe, Calendar, Terminal } from 'lucide-react';

export const AuditLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filterAction, setFilterAction] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit-logs', {
        params: { action: filterAction || undefined }
      });
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterAction]);

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.details.toLowerCase().includes(term) ||
      log.username.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-[#0d172a] p-5 rounded-2xl border border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-mono flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-cyan-400" /> Central Security & Operations Audit Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Immutable system audit trail intercepting and recording every asset mutation and authentication attempt.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between gap-4 font-mono text-xs">
        <div className="flex items-center space-x-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700 flex-1">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit details, usernames, or actions..."
            className="bg-transparent text-white w-full focus:outline-none placeholder-slate-500"
          />
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
          <Filter className="w-4 h-4 text-cyan-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="">All Action Event Types</option>
            <option value="AUTH_LOGIN">AUTH_LOGIN</option>
            <option value="PURCHASE_CREATE">PURCHASE_CREATE</option>
            <option value="TRANSFER_EXECUTE">TRANSFER_EXECUTE</option>
            <option value="ASSIGNMENT_CREATE">ASSIGNMENT_CREATE</option>
            <option value="ASSIGNMENT_RETURN">ASSIGNMENT_RETURN</option>
            <option value="EXPENDITURE_LOG">EXPENDITURE_LOG</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 font-mono text-xs text-slate-400 uppercase">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Operator / User</th>
                <th className="py-3 px-4">Base Garrison</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Detailed Operation Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded font-bold text-[10px] ${
                      log.action.includes('LOGIN') ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' :
                      log.action.includes('TRANSFER') ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' :
                      log.action.includes('PURCHASE') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">
                    {log.full_name} <span className="text-slate-500 text-[11px]">(@{log.username})</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{log.base_name}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono">{log.ip_address}</td>
                  <td className="py-3 px-4 text-slate-200 max-w-md">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
