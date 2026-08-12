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
    <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-[#0b1322] flex flex-col justify-between p-2 md:p-4 shrink-0 md:min-h-[calc(100vh-4rem)]">
      <div className="space-y-2 md:space-y-6">
        <div className="hidden md:flex px-3 py-2 text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 items-center gap-2">
          <Boxes className="w-4 h-4 text-cyan-400" /> Operational Control
        </div>

        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {navItems.map((item) => {
            if (!item.roles.includes(user?.role)) return null;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 md:space-x-3 px-3 py-2 md:py-2.5 rounded-xl font-medium transition text-sm shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold glow-cyan'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-5 h-5 md:w-5 md:h-5" />
                <span className="whitespace-nowrap">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* RBAC Notice Footer - Hidden on Mobile */}
      <div className="hidden md:block p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1 font-mono mt-4">
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
