import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Salad,
  Pill,
  Bot,
  User,
  Heart,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  {
    label: 'Dashboard',
    to: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'RakshakAI',
    badge: 'Wellness',
    to: '/wellness',
    icon: Activity,
  },
  {
    label: 'Nutrition & Diet',
    to: '/nutrition',
    icon: Salad,
  },
  {
    label: 'CareSync',
    badge: 'Meds & Care',
    to: '/caresync',
    icon: Pill,
  },
  {
    label: 'AI Assistant',
    badge: 'Gemini',
    to: '/assistant',
    icon: Bot,
    highlight: true,
  },
  {
    label: 'Profile',
    to: '/profile',
    icon: User,
  },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-white border-r border-slate-200/80 sticky top-0 shrink-0 z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
          <Heart className="w-5 h-5 fill-white/20" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg text-slate-800 tracking-tight">Aarogya</span>
            <span className="font-bold text-xs bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-md">360</span>
          </div>
          <p className="text-[10px] uppercase font-semibold tracking-wider text-teal-600">Personal AI Health</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Core Health Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs border border-teal-200/60'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.highlight
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1'
                          : isActive
                          ? 'bg-teal-200/60 text-teal-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.highlight && <Sparkles className="w-2.5 h-2.5" />}
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Emergency Disclaimer / Help Badge */}
      <div className="p-4 m-3 bg-gradient-to-br from-teal-50/60 to-emerald-50/40 border border-teal-100 rounded-2xl">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-teal-900">Health Guard Active</p>
            <p className="text-[11px] text-teal-700/80 mt-0.5 leading-snug">
              RakshakAI & CareSync are monitoring your daily health metrics.
            </p>
          </div>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-100 border border-teal-200 flex items-center justify-center font-bold text-teal-700 text-sm">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {user?.name || 'Aarogya Member'}
          </p>
          <p className="text-xs text-slate-400 truncate">
            {user?.email || 'member@aarogya360.ai'}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
