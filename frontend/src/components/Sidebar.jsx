import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ArrowLeftRight, 
  Users, 
  ShieldAlert,
  Boxes
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER']
    },
    {
      name: 'Purchases Intake',
      path: '/purchases',
      icon: ShoppingCart,
      roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER']
    },
    {
      name: 'Cross-Base Transfers',
      path: '/transfers',
      icon: ArrowLeftRight,
      roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER']
    },
    {
      name: 'Assignments & Consumables',
      path: '/assignments',
      icon: Users,
      roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER']
    },
    {
      name: 'Security Audit Logs',
      path: '/audit-logs',
      icon: ShieldAlert,
      roles: ['ADMIN', 'BASE_COMMANDER']
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0b1322] flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="px-3 py-2 text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Boxes className="w-4 h-4 text-cyan-400" /> Operational Control
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            if (!item.roles.includes(user?.role)) return null;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium transition text-sm ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold glow-cyan'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* RBAC Notice Footer */}
      <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1 font-mono">
        <div className="text-slate-300 font-semibold flex items-center justify-between">
          <span>Active Role:</span>
          <span className="text-cyan-400">{user?.role}</span>
        </div>
        <div className="text-[11px] text-slate-500 truncate">
          Scope: {user?.baseName}
        </div>
      </div>
    </aside>
  );
};
