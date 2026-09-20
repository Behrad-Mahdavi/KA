import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import fetchData from '../../Utils/fetchData';
import { toPersianDigits, formatToJalali } from '../../Utils/utils';
import StatCard from '../../Components/UI/StatCard';
import RokadCard from '../../Components/UI/RokadCard';
import RokadButton from '../../Components/UI/RokadButton';
import RokadBadge from '../../Components/UI/RokadBadge';
import {
  Clock,
  Medal,
  Coins,
  CheckCircle2,
  PlusCircle,
  ClipboardCheck,
  FileSpreadsheet,
  Trophy,
  ChevronLeft,
  AlertCircle,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export default function AdminHome() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [summary, setSummary] = useState({
    pendingRequestsCount: 0,
    totalScore: 0,
    availableTokens: 0,
    paidRewardsCount: 0,
    totalStudents: 0,
  });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [topStudentsByGrade, setTopStudentsByGrade] = useState({
    'دهم': [],
    'یازدهم': [],
    'دوازدهم': [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);

      try {
        const [sumRes, pendingRes, topRes] = await Promise.all([
          fetchData('dashboard/summary', { headers: { authorization: `Bearer ${token}` } }),
          fetchData('dashboard/recent-pending-requests?limit=6', { headers: { authorization: `Bearer ${token}` } }),
          fetchData('users/top-by-grades', { headers: { authorization: `Bearer ${token}` } })
        ]);

        if (sumRes?.success && sumRes.data) {
          setSummary(sumRes.data);
        }
        if (pendingRes?.success && Array.isArray(pendingRes.data)) {
          setPendingRequests(pendingRes.data);
        }
        if (topRes?.success && topRes.data) {
          setTopStudentsByGrade(topRes.data);
        }
      } catch (err) {
        setError(err.message || 'خطا در بارگذاری داده‌های داشبورد');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#202A5A] via-[#1D2651] to-[#121824] text-white p-6 sm:p-8 border-2 border-[#182044] shadow-[4px_4px_0_#59BBAF]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-[#59BBAF]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>پنل نظارتی هنرستان رُکاد</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black">
              خوش آمدید، {user?.fullName || 'همکار گرامی'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              تعداد {toPersianDigits(summary.pendingRequestsCount || 0)} درخواست جدید در انتظار بررسی شما قرار دارد.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/requests">
              <button className="rokad-btn-primary px-4 py-2.5 text-xs sm:text-sm">
                <ClipboardCheck className="w-4 h-4" />
                <span>بررسی درخواست‌ها</span>
              </button>
            </Link>
            <Link to="/add-data">
              <button className="rokad-btn-outline px-4 py-2.5 text-xs sm:text-sm bg-white/10 text-white border-white/20 hover:bg-white/20">
                <PlusCircle className="w-4 h-4 text-[#59BBAF]" />
                <span>ثبت فعالیت دانش‌آموز</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="درخواست‌های در انتظار"
          value={summary.pendingRequestsCount}
          subtitle="نیازمند تایید یا بازخورد"
          icon={Clock}
          theme="female"
        />
        <StatCard
          title="کل امتیازات اعطا شده"
          value={summary.totalScore}
          subtitle="در کل هنرستان"
          icon={Medal}
          theme="male"
        />
        <StatCard
          title="توکن‌های فعال در گردش"
          value={summary.availableTokens}
          subtitle="موجودی حساب دانش‌آموزان"
          icon={Coins}
          theme="college"
        />
        <StatCard
          title="پاداش‌های تحویل شده"
          value={summary.paidRewardsCount}
          subtitle="هدایای تایید و اهدا شده"
          icon={CheckCircle2}
          theme="ecosystem"
        />
      </div>

      {/* 3. Grid: Pending Review Queue & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Requests Table (2 cols on lg) */}
        <div className="lg:col-span-2">
          <RokadCard className="h-full p-5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-[#59BBAF]" />
                <h3 className="text-base sm:text-lg font-black text-[#202A5A] dark:text-white">
                  آخرین درخواست‌های در انتظار
                </h3>
              </div>
              <Link to="/requests" className="text-xs font-bold text-[#59BBAF] hover:underline flex items-center gap-1">
                <span>مشاهده کارتابل کامل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                هیچ درخواستی در صف انتظار وجود ندارد. همه بررسی شده‌اند!
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id || req._id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-[#202A5A] dark:text-gray-300 flex-shrink-0">
                        {req.userFullName ? req.userFullName[0] : 'د'}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-[#202A5A] dark:text-white block truncate">
                          {req.userFullName}
                        </span>
                        <span className="text-[11px] text-gray-400 block truncate">
                          {req.entityName} • {req.requestType === 'reward' ? 'درخواست پاداش' : 'ثبت فعالیت'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[10px] text-gray-400 hidden sm:inline-block">
                        {formatToJalali(req.createdAt)}
                      </span>
                      <Link to={req.requestType === 'reward' ? '/rewards' : '/requests'}>
                        <RokadButton variant="outline" size="sm">
                          بررسی
                        </RokadButton>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </RokadCard>
        </div>

        {/* Top Performers per Grade */}
        <div className="lg:col-span-1">
          <RokadCard className="h-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-[#202A5A] dark:text-white">
                  برترین‌های پایه‌ها
                </h3>
              </div>
              <Link to="/results" className="text-xs font-bold text-[#59BBAF] hover:underline">
                کل گزارشات
              </Link>
            </div>

            {['دهم', 'یازدهم', 'دوازدهم'].map((grade) => {
              const students = topStudentsByGrade[grade] || [];
              const topOne = students[0];

              return (
                <div
                  key={grade}
                  className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#1C2536] border border-gray-100 dark:border-gray-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#202A5A] dark:text-white">پایه {grade}</span>
                    {topOne ? (
                      <span className="font-black text-[#59BBAF]">
                        {toPersianDigits(topOne.score)} امتیاز
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[10px]">داده‌ای نیست</span>
                    )}
                  </div>

                  {topOne && (
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="truncate">نفر اول: {topOne.fullName || topOne.name}</span>
                      <span className="text-[11px]">کلاس {toPersianDigits(topOne.class)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </RokadCard>
        </div>
      </div>
    </div>
  );
}