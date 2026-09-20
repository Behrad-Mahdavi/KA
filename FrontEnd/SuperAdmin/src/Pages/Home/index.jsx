import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Coins,
  Gift,
  CheckCircle2,
  Clock,
  UserPlus,
  ListPlus,
  FileCheck2,
  Table,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Users
} from 'lucide-react';
import StatCard from '../../Components/UI/StatCard';
import RokadCard from '../../Components/UI/RokadCard';
import RokadButton from '../../Components/UI/RokadButton';
import RokadBadge from '../../Components/UI/RokadBadge';
import { toPersianDigits, formatToJalali } from '../../Utils/utils';
import fetchData from '../../Utils/fetchData';

export default function SuperAdminHome() {
  const [stats, setStats] = useState({
    systemOverallStudentTokens: 0,
    systemTotalAvailableTokens: 0,
    rewardsPaidValue: 0,
    rewardsPendingValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAdminStats = async () => {
      if (!token) return;
      try {
        const res = await fetchData('student-reward/admin-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res?.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.warn("Could not load stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, [token]);

  const quickActions = [
    {
      title: 'ثبت‌نام گروهی کاربران',
      desc: 'افزودن هنرآموزان و پرسنل با فایل اکسل',
      to: '/add-users',
      icon: UserPlus,
      persona: 'college',
    },
    {
      title: 'تعریف و بروزرسانی فعالیت‌ها',
      desc: 'بارگذاری ماتریس فعالیت‌ها با ضرایب',
      to: '/add-activity',
      icon: ListPlus,
      persona: 'female',
    },
    {
      title: 'بارگذاری کاتالوگ جوایز',
      desc: 'تنظیم اقلام پاداش و توکن‌های موردنیاز',
      to: '/rewards',
      icon: Gift,
      persona: 'club',
    },
    {
      title: 'کارتابل تایید درخواست‌ها',
      desc: 'بررسی مدارک ارسالی هنرآموزان',
      to: '/requests',
      icon: FileCheck2,
      persona: 'male',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-[#202A5A] dark:border-[#59BBAF]/40 bg-[#202A5A] text-white p-6 sm:p-8 rokad-shadow">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#59BBAF]/20 text-[#59BBAF] border border-[#59BBAF]/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مرکز راهبری و کنترل هوشمند رُکاد</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black">
            سامانه مرکزی مدیریت ارزیابی و توکن‌های مهارت
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            از این بخش می‌توانید جریان امتیازات، توکن‌های اعطا شده، پرونده‌های ثبت‌نامی و درخواست‌های دوره‌ای را در سطح کل هنرستان پایش و مدیریت کنید.
          </p>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="کل امتیازات در گردش"
          value={toPersianDigits(stats.systemOverallStudentTokens || 0)}
          unit="امتیاز"
          icon={TrendingUp}
          persona="ecosystem"
        />
        <StatCard
          title="توکن‌های فعال و قابل استفاده"
          value={toPersianDigits(stats.systemTotalAvailableTokens || 0)}
          unit="توکن"
          icon={Coins}
          persona="college"
        />
        <StatCard
          title="پاداش‌های پرداخت‌شده"
          value={toPersianDigits(stats.rewardsPaidValue || 0)}
          unit="توکن"
          icon={Gift}
          persona="club"
        />
        <StatCard
          title="درخواست‌های در انتظار بررسی"
          value={toPersianDigits(stats.rewardsPendingValue || 0)}
          unit="مورد"
          icon={Clock}
          persona="female"
        />
      </div>

      {/* Fast Excel & Management Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-[#202A5A] dark:text-white">
              دستورات سریع بارگذاری و پیکربندی
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              مدیریت انبوه داده‌ها با ایمپورت فایل‌های اکسل استاندارد
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                to={action.to}
                className="rokad-card p-5 group flex flex-col justify-between hover:border-[#202A5A] dark:hover:border-[#59BBAF] transition-all"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[#202A5A] dark:text-[#59BBAF] group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#202A5A] dark:text-white group-hover:text-[#59BBAF] transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {action.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-[#202A5A] dark:text-[#59BBAF]">
                  <span>ورود به بخش</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Grade Rankings Link Banner */}
      <RokadCard
        title="پایش و تحلیل رتبه‌بندی پایه‌ها"
        subtitle="مشاهده جدول امتیازات دهم، یازدهم و دوازدهم به تفکیک دسته‌بندی‌های مهارتی"
        badge="تحلیل کارنامه"
        persona="male"
        action={
          <Link to="/results">
            <RokadButton variant="primary" size="sm">
              <Table className="w-4 h-4 ml-1.5" />
              مشاهده جداول کامل رتبه‌ها
            </RokadButton>
          </Link>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl border-2 border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 space-y-1">
            <span className="text-xs font-bold text-[#202A5A] dark:text-white">پایه دهم</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">کلاس‌های ۱۰۱، ۱۰۲، ۱۰۳</p>
            <p className="text-xs font-black text-[#59BBAF] pt-2">مشاهده کارنامه جامع &larr;</p>
          </div>
          <div className="p-4 rounded-xl border-2 border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 space-y-1">
            <span className="text-xs font-bold text-[#202A5A] dark:text-white">پایه یازدهم</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">کلاس‌های ۲۰۱، ۲۰۲، ۲۰۳</p>
            <p className="text-xs font-black text-[#59BBAF] pt-2">مشاهده کارنامه جامع &larr;</p>
          </div>
          <div className="p-4 rounded-xl border-2 border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 space-y-1">
            <span className="text-xs font-bold text-[#202A5A] dark:text-white">پایه دوازدهم</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">کلاس‌های ۳۰۱، ۳۰۲، ۳۰۳</p>
            <p className="text-xs font-black text-[#59BBAF] pt-2">مشاهده کارنامه جامع &larr;</p>
          </div>
        </div>
      </RokadCard>
    </div>
  );
}
