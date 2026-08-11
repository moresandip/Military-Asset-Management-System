import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, LogOut, Building, ShieldAlert, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickRoleSwitch = async (username, password) => {
    const res = await login(username, password);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0c1527]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & System Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-cyan-400 font-extrabold text-lg tracking-wider font-mono">
          <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/30 glow-cyan">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <span>MILITARY ASSET MANAGEMENT SYSTEM</span>
        </div>
        <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          ● ONLINE
        </span>
      </div>

      {/* Center: Quick Demo RBAC Switcher Toolbar */}
      <div className="hidden lg:flex items-center space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
        <span className="text-slate-400 px-2 font-mono flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Demo Switch:
        </span>
        <button
          onClick={() => handleQuickRoleSwitch('admin_user', 'AdminPass123!')}
          className={`px-2.5 py-1 rounded-lg transition font-medium ${
            user?.role === 'ADMIN' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          Admin
        </button>
        <button
          onClick={() => handleQuickRoleSwitch('commander_alpha', 'CommandPass123!')}
          className={`px-2.5 py-1 rounded-lg transition font-medium ${
            user?.role === 'BASE_COMMANDER' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          Commander (Alpha)
        </button>
        <button
          onClick={() => handleQuickRoleSwitch('logistics_officer', 'LogisticsPass123!')}
          className={`px-2.5 py-1 rounded-lg transition font-medium ${
            user?.role === 'LOGISTICS_OFFICER' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          Logistics Officer
        </button>
      </div>

      {/* User Profile Info & Logout */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 text-right">
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-slate-100 flex items-center justify-end gap-1.5">
              <span>{user?.rank} {user?.fullName}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">
                {user?.role}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-end gap-1 font-mono">
              <Building className="w-3 h-3 text-cyan-400" />
              {user?.baseName}
            </div>
          </div>
          <div className="p-2 bg-slate-800 rounded-full border border-slate-700 text-cyan-400">
            <User className="w-5 h-5" />
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition border border-transparent hover:border-rose-500/30"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
