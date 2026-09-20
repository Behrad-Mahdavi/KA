import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  ListPlus,
  Gift,
  FileCheck2,
  Table,
  LogOut,
  X,
  ShieldAlert,
  Sparkles,
  Award
} from 'lucide-react';
import { toPersianDigits } from '../Utils/utils';

const navItems = [
  {
    to: '/',
    label: 'داشبورد مدیریت ارشد',
    icon: LayoutDashboard,
    badge: 'اصلی',
    color: 'male',
  },
  {
    to: '/add-users',
    label: 'ثبت‌نام گروهی کاربران',
    icon: UserPlus,
    color: 'college',
  },
  {
    to: '/add-activity',
    label: 'بارگذاری گروهی فعالیت‌ها',
    icon: ListPlus,
    color: 'female',
  },
  {
    to: '/rewards',
    label: 'بارگذاری کاتالوگ پاداش‌ها',
    icon: Gift,
    color: 'club',
  },
  {
    to: '/requests',
    label: 'کارتابل درخواست‌های فعالیت',
    icon: FileCheck2,
    color: 'male',
  },
  {
    to: '/results',
    label: 'جداول امتیازات و گزارشات',
    icon: Table,
    color: 'ecosystem',
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-[#151D2A] text-gray-800 dark:text-gray-100 transition-colors">
      {/* Brand Header */}
      <div className="p-5 border-b-2 border-[#202A5A] dark:border-[#59BBAF]/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/K-Logo.png"
            alt="پلتفرم کا"
            className="w-10 h-10 rounded-2xl object-cover border-2 border-[#202A5A] dark:border-[#59BBAF]/40 shadow-[2px_2px_0_#202A5A] dark:shadow-[2px_2px_0_#59BBAF]"
          />
          <div>
            <h2 className="font-black text-sm tracking-tight text-[#202A5A] dark:text-white">
              پلتـفرم کــا
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#202A5A] text-[#59BBAF] border border-[#59BBAF]/30">
              مدیریت عالی سیستم (SuperAdmin)
            </span>
          </div>
        </div>
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg border-2 border-gray-200 dark:border-white/10 hover:border-[#202A5A] text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all border-2 ${
                  isActive
                    ? 'bg-[#202A5A] text-white border-[#202A5A] shadow-[2.5px_2.5px_0_#59BBAF]'
                    : 'text-gray-700 dark:text-gray-300 border-transparent hover:border-[#202A5A]/30 dark:hover:border-white/20 hover:bg-gray-100 dark:hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-[#59BBAF]'
                          : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-[#59BBAF] text-[#202A5A]'
                          : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info & Logout */}
      <div className="p-4 border-t-2 border-[#202A5A] dark:border-[#59BBAF]/30 space-y-3">
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[11px] leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-[#202A5A] dark:text-[#59BBAF] mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-[#E0195B]" />
            <span>راهبر سیستم مرکزی</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            تغییرات جداول پایه و اکسل‌ها به صورت بلادرنگ در تمام پرتال‌ها اعمال می‌گردد.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-2.5 px-3 rounded-xl border-2 border-rose-500/50 hover:border-rose-500 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>خروج از پنل مدیریت عالی</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden lg:block w-72 shrink-0 border-l-2 border-[#202A5A] dark:border-[#59BBAF]/30 h-screen sticky top-0 z-20">
        <NavContent />
      </aside>

      {/* Mobile Drawer (Slide-over with Backdrop) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={onClose}
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-slideLeft">
            <NavContent />
          </div>
        </div>
      )}
    </>
  );
}
