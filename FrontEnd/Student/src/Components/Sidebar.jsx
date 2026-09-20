import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Gift,
  Trophy,
  X,
  Sparkles,
  Coins,
  Medal
} from 'lucide-react';
import { cn, toPersianDigits } from '../Utils/utils';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const menuItems = [
    { to: '/', label: 'داشبورد', icon: LayoutDashboard },
    { to: '/activities', label: 'فعالیت‌ها', icon: ClipboardList },
    { to: '/rewards', label: 'ویترین پاداش‌ها', icon: Gift, matches: ['/rewards', '/request-reward'] },
    { to: '/results', label: 'جدول امتیازات', icon: Trophy },
  ];

  const isLinkActive = (item) => {
    if (item.matches) {
      return item.matches.some(path => location.pathname === path || location.pathname.startsWith(path));
    }
    return location.pathname === item.to;
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#121824] border-l border-gray-200/80 dark:border-gray-800 transition-colors">
      {/* Brand & School Logo */}
      <div className="h-16 sm:h-20 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#59BBAF] to-[#438C83] flex items-center justify-center text-white shadow-[2px_2px_0_#1F413D]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black text-sm text-[#202A5A] dark:text-white tracking-tight">
              سامانه رُکاد
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EEF8F7] dark:bg-[#1F413D]/60 text-[#438C83] dark:text-[#59BBAF] border border-[#59BBAF]/20">
              پورتال دانش‌آموز
            </span>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
          aria-label="بستن منو"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        <div className="text-[11px] font-bold text-gray-400 dark:text-gray-400 px-3 mb-2">
          منوی اصلی
        </div>

        {menuItems.map((item) => {
          const active = isLinkActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={cn(
                'flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all',
                active
                  ? 'bg-[#EEF8F7] dark:bg-[#1F413D]/60 text-[#1F413D] dark:text-[#EEF8F7] border border-[#59BBAF]/40 shadow-[2.5px_2.5px_0_#59BBAF]'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1C2536] hover:text-[#202A5A] dark:hover:text-white'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 sm:w-5 sm:h-5 transition-colors',
                    active ? 'text-[#59BBAF]' : 'text-gray-400'
                  )}
                />
                <span>{item.label}</span>
              </div>
              {active && (
                <span className="w-1.5 h-4 rounded-full bg-[#59BBAF]" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Mini Wallet / Stats in Sidebar Footer */}
      {user && (
        <div className="p-4 m-4 rounded-2xl bg-gray-50 dark:bg-[#151C28] border border-gray-200/80 dark:border-gray-800">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
            <span>کیف امتیاز و توکن</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              فعال
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white dark:bg-[#1C2536] border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 mb-0.5">
                <Medal className="w-3 h-3 text-[#202A5A] dark:text-[#59BBAF]" />
                <span>امتیاز</span>
              </div>
              <span className="text-sm font-black text-[#202A5A] dark:text-white">
                {toPersianDigits(user.score || 0)}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-[#1C2536] border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 mb-0.5">
                <Coins className="w-3 h-3 text-amber-500" />
                <span>توکن</span>
              </div>
              <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                {toPersianDigits(user.token || 0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 sm:w-72 h-screen sticky top-0 flex-shrink-0 z-40">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-over) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          {/* Drawer Box */}
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-right duration-200">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
}