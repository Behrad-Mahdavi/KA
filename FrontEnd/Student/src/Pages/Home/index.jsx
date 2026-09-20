import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import fetchData from '../../Utils/fetchData';
import { toPersianDigits } from '../../Utils/utils';
import StatCard from '../../Components/UI/StatCard';
import RokadCard from '../../Components/UI/RokadCard';
import RokadButton from '../../Components/UI/RokadButton';
import RokadBadge from '../../Components/UI/RokadBadge';
import {
  Medal,
  Coins,
  Trophy,
  Users,
  Plus,
  Gift,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  GraduationCap,
  Sparkles,
  ChevronLeft
} from 'lucide-react';

export default function StudentHome() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetchData('student-dashboard', {
          headers: { authorization: `Bearer ${token}` }
        });
        if (response?.success && response?.data) {
          setDashboardData(response.data);
          try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (storedUser && typeof storedUser === 'object') {
              storedUser.score = response.data.totalUserScore ?? response.data.totalScore ?? storedUser.score;
              storedUser.token = response.data.availableTokens ?? response.data.spendableTokens ?? Math.floor((storedUser.score || 0) * 0.95);
              localStorage.setItem('user', JSON.stringify(storedUser));
              window.dispatchEvent(new Event('userUpdated'));
            }
          } catch (e) {
            console.error('Error syncing user score/tokens:', e);
          }
        } else {
          setError(response?.message || 'خطا در دریافت اطلاعات داشبورد.');
        }
      } catch (err) {
        setError(err.message || 'خطای اتصال به سرور');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
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

  if (error) {
    return (
      <RokadCard className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-[#202A5A] dark:text-white mb-2">{error}</h3>
        <RokadButton onClick={() => window.location.reload()} variant="primary" size="sm">
          تلاش مجدد
        </RokadButton>
      </RokadCard>
    );
  }

  const totalUserScore = dashboardData?.totalUserScore ?? dashboardData?.totalScore ?? user?.score ?? 0;
  const availableTokens = dashboardData?.availableTokens ?? dashboardData?.spendableTokens ?? Math.floor(Number(totalUserScore) * 0.95);
  const totalTokens = dashboardData?.totalTokens ?? totalUserScore;

  const rankInSchool = dashboardData?.rankInSchool ?? dashboardData?.userRankInSchool ?? user?.rankInSchool;
  const rankInGrade = dashboardData?.rankInGrade ?? dashboardData?.userRankInGrade ?? user?.rankInGrade;
  const rankInClass = dashboardData?.rankInClass ?? dashboardData?.userRankInClass ?? user?.rankInClass;

  const {
    activitySummary = [],
    higherNeighbors = [],
    lowerNeighbors = [],
  } = dashboardData || {};

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Welcome & Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#202A5A] via-[#1D2651] to-[#161D3D] text-white p-6 sm:p-8 border-2 border-[#182044] shadow-[4px_4px_0_#59BBAF]">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 -mt-10 -ml-10 w-40 h-40 bg-[#59BBAF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 -mb-10 -mr-10 w-40 h-40 bg-[#E0195B]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-[#59BBAF]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>پایه {user?.grade || 'نامشخص'} • کلاس {toPersianDigits(user?.class || '')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black">
              سلام، {user?.fullName || 'دانش‌آموز عزیز'} 👋
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              رشته تحصیلی: {user?.fieldOfStudy || 'فنی و مهارتی'} • به پنل امتیازدهی و دستاوردهای هنرستان خوش آمدید.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/activities">
              <button className="rokad-btn-primary px-4 py-2.5 text-xs sm:text-sm">
                <Plus className="w-4 h-4" />
                <span>ثبت فعالیت جدید</span>
              </button>
            </Link>
            <Link to="/rewards">
              <button className="rokad-btn-outline px-4 py-2.5 text-xs sm:text-sm bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Gift className="w-4 h-4 text-[#59BBAF]" />
                <span>دریافت پاداش</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics & Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="جمع کل امتیازات"
          value={totalUserScore}
          subtitle="مجموع تلاش‌های مهارتی"
          icon={Medal}
          theme="male"
          trend={{ value: "فعال", isPositive: true }}
        />
        <StatCard
          title="توکن‌های قابل استفاده"
          value={availableTokens}
          subtitle="۹۵٪ توکن‌ها قابل استفاده هستند"
          icon={Coins}
          theme="college"
          trend={{ value: "۹۵٪ قابل خرج", isPositive: true }}
        />
        <StatCard
          title="رتبه در هنرستان"
          value={rankInSchool ? `رتبه ${toPersianDigits(rankInSchool)}` : 'رتبه ۱'}
          subtitle="میان تمام دانش‌آموزان"
          icon={Trophy}
          theme="ecosystem"
        />
        <StatCard
          title="رتبه در کلاس"
          value={rankInClass ? `رتبه ${toPersianDigits(rankInClass)}` : (rankInGrade ? `رتبه ${toPersianDigits(rankInGrade)} پایه` : 'رتبه ۱')}
          subtitle={`پایه ${user?.grade || ''} • کلاس ${toPersianDigits(user?.class || '')}`}
          icon={Users}
          theme="club"
        />
      </div>

      {/* 3. Activity Categories Progress & Gamification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Breakdown (2 cols on lg) */}
        <div className="lg:col-span-2">
          <RokadCard className="h-full">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#202A5A] dark:text-white">
                  وضعیت دسته‌بندی فعالیت‌ها
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  روند پیشرفت شما در ۴ حوزه امتیازدهی
                </p>
              </div>
              <Link
                to="/activities"
                className="text-xs font-bold text-[#59BBAF] hover:underline flex items-center gap-1"
              >
                <span>مشاهده سوابق</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-5">
              {activitySummary.length > 0 ? (
                activitySummary.map((item) => {
                  const isDeduction = item.parentName === 'موارد کسر امتیاز';
                  const percentage = Math.min(100, Math.max(0, item.progressPercentage || 0));

                  return (
                    <div
                      key={item.parentName}
                      className="p-4 rounded-2xl bg-gray-50/80 dark:bg-[#1C2536]/60 border border-gray-100 dark:border-gray-800/80 transition-all hover:border-[#59BBAF]/30"
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.rawHexColor || '#59BBAF' }}
                          />
                          <span className="text-xs sm:text-sm font-bold text-[#202A5A] dark:text-white">
                            {item.parentName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs sm:text-sm font-black"
                            style={{ color: item.rawHexColor || '#202A5A' }}
                          >
                            {isDeduction
                              ? `-${toPersianDigits(Math.abs(item.totalScore || 0))}`
                              : `+${toPersianDigits(item.totalScore || 0)}`}{' '}
                            امتیاز
                          </span>
                          {!isDeduction && (
                            <span className="text-[11px] font-bold text-gray-400">
                              ({toPersianDigits(percentage)}٪)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: isDeduction
                              ? `${Math.min(100, Math.abs(item.totalScore || 0) * 2)}%`
                              : `${percentage}%`,
                            backgroundColor: item.rawHexColor || '#59BBAF',
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-gray-400">
                  اطلاعاتی در دسترس نیست.
                </div>
              )}
            </div>
          </RokadCard>
        </div>

        {/* 4. Competition & Neighbors (Rank Surrounding Students) */}
        <div className="lg:col-span-1">
          <RokadCard className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#59BBAF]" />
                <h3 className="text-base font-black text-[#202A5A] dark:text-white">
                  جدول رقابت نزدیک
                </h3>
              </div>
              <Link to="/results" className="text-xs font-bold text-[#59BBAF] hover:underline">
                کل جدول
              </Link>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              همکلاسی‌های نزدیک شما در جدول رتبه‌بندی:
            </p>

            <div className="space-y-2 flex-1">
              {/* Higher Neighbors */}
              {higherNeighbors.map((st, idx) => (
                <div
                  key={st.id || idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#1C2536] border border-gray-100 dark:border-gray-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold flex items-center justify-center text-[10px]">
                      {toPersianDigits((rankInSchool || 2) - higherNeighbors.length + idx)}
                    </span>
                    <span className="font-bold text-gray-700 dark:text-gray-200">
                      {st.fullName}
                    </span>
                  </div>
                  <span className="font-bold text-[#202A5A] dark:text-gray-300">
                    {toPersianDigits(st.score)} امتیاز
                  </span>
                </div>
              ))}

              {/* Current Student (Highlighted) */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#EEF8F7] dark:bg-[#1F413D]/60 border-2 border-[#59BBAF] shadow-[2px_2px_0_#59BBAF] text-xs font-bold my-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#59BBAF] text-white flex items-center justify-center text-[11px] font-black">
                    {toPersianDigits(rankInSchool || 1)}
                  </span>
                  <span className="text-[#1F413D] dark:text-[#EEF8F7]">
                    {user?.fullName} (شما)
                  </span>
                </div>
                <span className="text-[#59BBAF] font-black text-sm">
                  {toPersianDigits(totalUserScore)} امتیاز
                </span>
              </div>

              {/* Lower Neighbors */}
              {lowerNeighbors.map((st, idx) => (
                <div
                  key={st.id || idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#1C2536] border border-gray-100 dark:border-gray-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold flex items-center justify-center text-[10px]">
                      {toPersianDigits((rankInSchool || 1) + idx + 1)}
                    </span>
                    <span className="font-bold text-gray-700 dark:text-gray-200">
                      {st.fullName}
                    </span>
                  </div>
                  <span className="font-bold text-[#202A5A] dark:text-gray-300">
                    {toPersianDigits(st.score)} امتیاز
                  </span>
                </div>
              ))}
            </div>
          </RokadCard>
        </div>
      </div>
    </div>
  );
}