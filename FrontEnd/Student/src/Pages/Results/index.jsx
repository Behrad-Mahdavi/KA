import React, { useState, useEffect } from 'react';
import fetchData from '../../Utils/fetchData';
import { toPersianDigits } from '../../Utils/utils';
import RokadCard from '../../Components/UI/RokadCard';
import StatCard from '../../Components/UI/StatCard';
import RokadButton from '../../Components/UI/RokadButton';
import {
  Trophy,
  Medal,
  Award,
  Users,
  ChevronRight,
  ChevronLeft,
  Crown,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function StudentResults() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentUserRankData, setCurrentUserRankData] = useState(null);

  const fetchRankings = async (targetPage = 1) => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetchData(`users/my-grade-rankings?page=${targetPage}&limit=10`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res?.success && Array.isArray(res.data)) {
        setRankings(res.data);
        setTotalPages(Math.ceil((res.totalCount || 0) / 10) || 1);
        setPage(targetPage);

        // Find current user row
        const myRow = res.data.find(r => r.id === user?.id || r._id === user?.id || r.idCode === user?.idCode);
        if (myRow) setCurrentUserRankData(myRow);
      } else {
        setError(res?.message || 'خطا در دریافت جدول امتیازات');
      }
    } catch (err) {
      setError(err.message || 'خطای شبکه');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings(1);
  }, []);

  // Top 3 for Podium
  const topThree = rankings.slice(0, 3);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#202A5A] dark:text-white">
            جدول امتیازات و رتبه‌بندی
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            رتبه‌بندی دانش‌آموزان برتر در پایه تحصیلی {user?.grade || ''}
          </p>
        </div>

        {currentUserRankData && (
          <div className="inline-flex items-center gap-3 p-3 rounded-2xl bg-[#EEF8F7] dark:bg-[#1F413D]/40 border border-[#59BBAF]/40 shadow-[2px_2px_0_#59BBAF]">
            <Trophy className="w-5 h-5 text-[#59BBAF]" />
            <div>
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block">رتبه شما در پایه</span>
              <span className="text-sm font-black text-[#1F413D] dark:text-[#EEF8F7]">
                رتبه {toPersianDigits(currentUserRankData.rank || user?.rankInGrade || 1)} • {toPersianDigits(currentUserRankData.score || user?.score || 0)} امتیاز
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Top 3 Podium (Neo-brutalist) */}
      {topThree.length >= 3 && page === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {/* 2nd Place */}
          <RokadCard className="text-center p-5 border-gray-300 dark:border-gray-700 sm:order-1 order-2 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 flex items-center justify-center font-black text-lg border border-gray-300 dark:border-gray-700">
                🥈
              </div>
              <span className="text-xs font-bold text-gray-400 block">رتبه ۲ پایه</span>
              <h4 className="text-sm font-black text-[#202A5A] dark:text-white mt-1">
                {topThree[1].name || topThree[1].fullName}
              </h4>
              <span className="text-[11px] text-gray-400">
                کلاس {toPersianDigits(topThree[1].class)}
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 text-sm font-black text-[#202A5A] dark:text-gray-300">
              {toPersianDigits(topThree[1].score)} امتیاز
            </div>
          </RokadCard>

          {/* 1st Place (Winner) */}
          <RokadCard className="text-center p-6 border-2 border-amber-400 dark:border-amber-500 shadow-[3.5px_3.5px_0_#F8A41D] sm:order-2 order-1 sm:-mt-3 flex flex-col justify-between bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-950/20 dark:to-[#151C28]">
            <div>
              <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 flex items-center justify-center font-black text-2xl border border-amber-300 shadow-sm">
                👑
              </div>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 block">
                مقام اول پایه
              </span>
              <h4 className="text-base font-black text-[#202A5A] dark:text-white mt-1">
                {topThree[0].name || topThree[0].fullName}
              </h4>
              <span className="text-xs text-gray-400">
                کلاس {toPersianDigits(topThree[0].class)}
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-amber-200/60 dark:border-amber-900/40 text-base font-black text-amber-600 dark:text-amber-400">
              {toPersianDigits(topThree[0].score)} امتیاز
            </div>
          </RokadCard>

          {/* 3rd Place */}
          <RokadCard className="text-center p-5 border-amber-700/30 dark:border-amber-900/40 sm:order-3 order-3 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-amber-900/10 dark:bg-amber-950 text-amber-700 flex items-center justify-center font-black text-lg border border-amber-700/20">
                🥉
              </div>
              <span className="text-xs font-bold text-gray-400 block">رتبه ۳ پایه</span>
              <h4 className="text-sm font-black text-[#202A5A] dark:text-white mt-1">
                {topThree[2].name || topThree[2].fullName}
              </h4>
              <span className="text-[11px] text-gray-400">
                کلاس {toPersianDigits(topThree[2].class)}
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 text-sm font-black text-[#202A5A] dark:text-gray-300">
              {toPersianDigits(topThree[2].score)} امتیاز
            </div>
          </RokadCard>
        </div>
      )}

      {/* 3. Full Leaderboard Table */}
      <RokadCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">در حال دریافت رتبه‌بندی...</div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-[#202A5A] dark:text-white mb-2">{error}</h4>
            <RokadButton onClick={() => fetchRankings(1)} variant="primary" size="sm">تلاش مجدد</RokadButton>
          </div>
        ) : rankings.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">داده‌ای یافت نشد.</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead className="bg-[#F8F9FA] dark:bg-[#1C2536] text-[#202A5A] dark:text-white font-black border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="p-4 text-center">رتبه</th>
                    <th className="p-4">دانش‌آموز</th>
                    <th className="p-4 text-center">کلاس</th>
                    <th className="p-4 text-center">آموزشی</th>
                    <th className="p-4 text-center">داوطلبانه</th>
                    <th className="p-4 text-center">شغلی</th>
                    <th className="p-4 text-center">کسر امتیاز</th>
                    <th className="p-4 text-center">امتیاز کل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rankings.map((row, idx) => {
                    const isMe = row.id === user?.id || row._id === user?.id || row.idCode === user?.idCode;
                    const rankNum = row.rank || idx + 1;

                    return (
                      <tr
                        key={row.id || row._id || idx}
                        className={`transition-colors ${
                          isMe
                            ? 'bg-[#EEF8F7] dark:bg-[#1F413D]/40 font-bold border-r-4 border-r-[#59BBAF]'
                            : 'hover:bg-gray-50/80 dark:hover:bg-[#1C2536]/50'
                        }`}
                      >
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-black text-xs ${
                            rankNum === 1 ? 'bg-amber-400 text-white' :
                            rankNum === 2 ? 'bg-gray-300 text-gray-800' :
                            rankNum === 3 ? 'bg-amber-700 text-white' :
                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                          }`}>
                            {toPersianDigits(rankNum)}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-[#202A5A] dark:text-white">
                          <div className="flex items-center gap-2">
                            <span>{row.name || row.fullName}</span>
                            {isMe && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#59BBAF] text-white">
                                شما
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center text-gray-500 dark:text-gray-400">
                          {toPersianDigits(row.class)}
                        </td>
                        <td className="p-4 text-center text-[#652D90] font-bold">
                          {toPersianDigits(row.educationalActivities || 0)}
                        </td>
                        <td className="p-4 text-center text-[#E0195B] font-bold">
                          {toPersianDigits(row.voluntaryActivities || 0)}
                        </td>
                        <td className="p-4 text-center text-[#F8A41D] font-bold">
                          {toPersianDigits(row.jobActivities || 0)}
                        </td>
                        <td className="p-4 text-center text-gray-400">
                          {toPersianDigits(row.deductions || 0)}
                        </td>
                        <td className="p-4 text-center font-black text-sm text-[#202A5A] dark:text-white">
                          {toPersianDigits(row.score)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {rankings.map((row, idx) => {
                const isMe = row.id === user?.id || row._id === user?.id || row.idCode === user?.idCode;
                const rankNum = row.rank || idx + 1;

                return (
                  <div
                    key={row.id || row._id || idx}
                    className={`p-4 space-y-2 ${isMe ? 'bg-[#EEF8F7] dark:bg-[#1F413D]/40' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-xs">
                          {toPersianDigits(rankNum)}
                        </span>
                        <span className="font-bold text-sm text-[#202A5A] dark:text-white">
                          {row.name || row.fullName}
                        </span>
                        {isMe && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#59BBAF] text-white">
                            شما
                          </span>
                        )}
                      </div>
                      <span className="font-black text-[#202A5A] dark:text-white">
                        {toPersianDigits(row.score)} امتیاز
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                      <span>کلاس {toPersianDigits(row.class)}</span>
                      <span>آموزشی: {toPersianDigits(row.educationalActivities || 0)} • شغلی: {toPersianDigits(row.jobActivities || 0)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
            <span className="text-gray-400">
              صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)}
            </span>
            <div className="flex items-center gap-2">
              <RokadButton
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => fetchRankings(page - 1)}
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>قبلی</span>
              </RokadButton>
              <RokadButton
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => fetchRankings(page + 1)}
              >
                <span>بعدی</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </RokadButton>
            </div>
          </div>
        )}
      </RokadCard>
    </div>
  );
}
