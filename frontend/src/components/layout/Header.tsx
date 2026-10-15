import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  LogOut,
  User as UserIcon,
  Bell,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Mobile Brand / Greeting */}
      <div className="flex items-center gap-3">
        {/* Mobile Logo Only */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Heart className="w-4 h-4 fill-white/20" />
          </div>
          <span className="font-bold text-slate-800 text-base">SehatSync <span className="text-teal-600">AI</span></span>
        </div>

        {/* Desktop Greeting */}
        <div className="hidden lg:block">
          <h2 className="text-sm font-semibold text-slate-800">
            {getGreeting()}, <span className="text-teal-700">{user?.name?.split(' ')[0] || 'Member'}</span>
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Continuous Vitals Telemetry Active</span>
          </div>
        </div>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-3">
        {/* Assistant Quick Shortcut */}
        <button
          onClick={() => navigate('/assistant')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold border border-teal-200 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Ask My Health AI</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => toast('No urgent medical alerts. All vitals look balanced.', { icon: '🔔' })}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-500" />
        </button>

        {/* User Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-600 to-emerald-700 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-700 leading-tight">
                {user?.name || 'My Account'}
              </p>
              <p className="text-[10px] text-teal-600 font-medium">Verified Patient</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{user?.name || 'Aarogya User'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => navigate('/profile')}
                className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2 font-medium"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                Profile & Health Goals
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium border-t border-slate-50 mt-1"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
