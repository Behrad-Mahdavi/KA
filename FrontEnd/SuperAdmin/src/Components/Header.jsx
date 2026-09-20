import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Menu, Sun, Moon, LogOut, ShieldCheck, ChevronDown } from 'lucide-react';
import { useTheme } from '../Utils/ThemeContext';
import { formatToJalali } from '../Utils/utils';

export default function Header({ onMenuClick, title = 'میز مدیریت ارشد' }) {
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const jalaliDate = useMemo(() => {
    return formatToJalali(new Date(), { showMonthName: true, includeDayName: true });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#151D2A]/90 backdrop-blur border-b-2 border-[#202A5A] dark:border-[#59BBAF]/30 px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Right side: Mobile Menu Trigger + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border-2 border-[#202A5A] dark:border-[#59BBAF]/50 rokad-shadow bg-white dark:bg-[#1E2640] text-[#202A5A] dark:text-white cursor-pointer active:scale-95 transition"
            aria-label="منوی ناوبری"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E0195B] animate-pulse"></span>
              <h1 className="text-base sm:text-lg font-black text-[#202A5A] dark:text-white">
                {title}
              </h1>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 hidden sm:block">
              امروز: {jalaliDate}
            </p>
          </div>
        </div>

        {/* Left side: Controls + User Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border-2 border-[#202A5A] dark:border-[#59BBAF]/50 rokad-shadow bg-white dark:bg-[#1E2640] text-gray-700 dark:text-gray-300 hover:border-[#59BBAF] transition cursor-pointer"
            title="تغییر حالت شب/روز"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-[#202A5A]" />
            )}
          </button>

          {/* User Profile Badge & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="h-11 min-h-[44px] px-3 flex items-center gap-2 rounded-xl border-2 border-[#202A5A] dark:border-[#59BBAF]/50 rokad-shadow bg-white dark:bg-[#1E2640] text-right cursor-pointer hover:border-[#59BBAF] transition"
            >
              <div className="w-7 h-7 rounded-lg bg-[#E0195B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="hidden md:block leading-tight text-right">
                <span className="text-xs font-bold text-gray-900 dark:text-white block">
                  {user?.fullName || 'مدیر کل سامانه'}
                </span>
                <span className="text-[10px] text-[#E0195B] font-bold block">
                  دسترسی راهبر ارشد
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-[#1E2640] rounded-xl border-2 border-[#202A5A] dark:border-[#59BBAF]/50 rokad-shadow p-2 text-right z-50 animate-fadeIn">
                <div className="p-3 border-b border-gray-100 dark:border-white/5 mb-1">
                  <p className="font-bold text-xs text-gray-900 dark:text-white">
                    {user?.fullName || 'مدیر کل'}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {user?.idCode || 'SuperAdmin'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                >
                  <span>خروج از حساب کاربری</span>
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
