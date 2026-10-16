import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Salad,
  Pill,
  Bot,
  MoreHorizontal,
  X,
  MapPin,
  Users2,
  BookOpen,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

const mobileNavItems = [
  { label: 'Overview', to: '/', icon: LayoutDashboard },
  { label: 'Wellness', to: '/wellness', icon: Activity },
  { label: 'Nutrition', to: '/nutrition', icon: Salad },
  { label: 'Care', to: '/caresync', icon: Pill },
  { label: 'Nearby', to: '/nearby', icon: MapPin },
];

export const BottomNav: React.FC = () => {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const moreRoutes = [
    { label: 'Counsellors', to: '/counsellors', icon: Users2 },
    { label: 'Health Library', to: '/library', icon: BookOpen },
    { label: 'Ask My Health', to: '/assistant', icon: Bot },
    { label: 'Settings', to: '/profile', icon: User },
  ];

  return (
    <>
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/25" onClick={() => setMoreOpen(false)}>
          <nav
            aria-label="More navigation"
            className="absolute bottom-16 right-3 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {moreRoutes.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMoreOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                    isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
      <nav aria-label="Primary navigation" className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1.5 z-40 flex items-center justify-around shadow-lg">
        {mobileNavItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors ${
                isActive ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-lg ${isActive ? 'bg-teal-50' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5">{label}</span>
              </>
            )}
          </NavLink>
        ))}
        <button
          type="button"
          aria-expanded={moreOpen}
          aria-label={moreOpen ? 'Close more navigation' : 'Open more navigation'}
          onClick={() => setMoreOpen(!moreOpen)}
          className={`flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-xl ${
            moreOpen || moreRoutes.some(({ to }) => location.pathname.startsWith(to))
              ? 'text-teal-700 font-bold'
              : 'text-slate-500'
          }`}
        >
          <div className={`p-1 rounded-lg ${moreOpen ? 'bg-teal-50' : ''}`}>
            {moreOpen ? <X className="h-5 w-5" /> : <MoreHorizontal className="h-5 w-5" />}
          </div>
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </nav>
    </>
  );
};

export default BottomNav;
