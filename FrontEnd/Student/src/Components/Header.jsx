import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../Utils/ThemeContext';
import { formatToJalali, toPersianDigits } from '../Utils/utils';
import {
  Menu,
  Moon,
  Sun,
  Bell,
  LogOut,
  Calendar,
  User as UserIcon,
  GraduationCap
} from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import fetchData from '../Utils/fetchData';

export default function Header({ onMenuClick, title = "داشبورد دانش‌آموز" }) {
  const { theme, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const [userDropdown, setUserDropdown] = useState(false);
  const userRef = useRef(null);

  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      const response = await fetchData('notifications?filter=unread', {
        headers: { authorization: `Bearer ${token}` }
      });
      if (response?.success) {
        setUnreadCount(response.totalCount || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  // Outside click handler
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const currentDateFormatted = formatToJalali(new Date(), {
    showMonthName: true,
    includeDayName: true,
  });

  return (
    <header className="sticky top-0 z-30 h-16 sm:h-20 bg-white/90 dark:bg-[#0B0F17]/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Right Side: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
          aria-label="باز کردن منو"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#59BBAF]/15 text-[#59BBAF]">
              <GraduationCap className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold text-[#59BBAF] hidden sm:inline-block">
              هنرستان استارتاپی رُکاد
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-[#202A5A] dark:text-white mt-0.5">
            {title}
          </h1>
        </div>
      </div>

      {/* Left Side: Date, Theme, Notifications & User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Jalali Date Display */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#151C28] border border-gray-200/60 dark:border-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400">
          <Calendar className="w-3.5 h-3.5 text-[#59BBAF]" />
          <span>{currentDateFormatted}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#151C28] border border-gray-200/80 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:text-[#59BBAF] dark:hover:text-[#59BBAF] transition-all cursor-pointer"
          aria-label="تغییر تم"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotifOpen(prev => !prev);
              fetchUnreadCount();
            }}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#151C28] border border-gray-200/80 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:text-[#59BBAF] dark:hover:text-[#59BBAF] transition-all relative cursor-pointer"
            aria-label="اعلان‌ها"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-[#0B0F17]">
                {toPersianDigits(unreadCount)}
              </span>
            )}
          </button>
          <NotificationPanel
            isOpen={isNotifOpen}
            onClose={() => {
              setIsNotifOpen(false);
              fetchUnreadCount();
            }}
            token={token}
            userType="student"
          />
        </div>

        {/* User Profile */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserDropdown(prev => !prev)}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-gray-50 dark:bg-[#151C28] border border-gray-200/80 dark:border-gray-800 hover:border-[#59BBAF]/50 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#59BBAF] text-white flex items-center justify-center font-black text-xs">
              {user?.fullName ? user.fullName[0] : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-bold text-[#202A5A] dark:text-white truncate max-w-[100px]">
                {user?.fullName || 'دانش‌آموز'}
              </span>
              <span className="block text-[10px] text-gray-400">
                {user?.grade ? `پایه ${user.grade}` : 'دانش‌آموز'}
              </span>
            </div>
          </button>

          {userDropdown && (
            <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-[#151C28] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-[3px_3px_0_#202A5A] dark:shadow-[3px_3px_0_#59BBAF] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2 border-b border-gray-100 dark:border-gray-800 text-right">
                <p className="text-xs font-bold text-[#202A5A] dark:text-white">
                  {user?.fullName}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  کد ملی: {toPersianDigits(user?.idCode || '')}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج از حساب</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
