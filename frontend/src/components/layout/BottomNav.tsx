import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Salad,
  Pill,
  Bot,
  User,
} from 'lucide-react';

const mobileNavItems = [
  { label: 'Home', to: '/', icon: LayoutDashboard },
  { label: 'Wellness', to: '/wellness', icon: Activity },
  { label: 'Nutrition', to: '/nutrition', icon: Salad },
  { label: 'CareSync', to: '/caresync', icon: Pill },
  { label: 'Assistant', to: '/assistant', icon: Bot },
  { label: 'Profile', to: '/profile', icon: User },
];

export const BottomNav: React.FC = () => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 z-40 flex items-center justify-around shadow-lg">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-teal-600 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-lg ${isActive ? 'bg-teal-50' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
