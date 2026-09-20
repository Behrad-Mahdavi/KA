import React, { useState, useEffect } from 'react';
import fetchData from '../../../Utils/fetchData';
import { toPersianDigits } from '../../../Utils/utils';
import RokadBadge from '../../../Components/UI/RokadBadge';
import { ChevronRight, ChevronLeft, Award, User, Layers, ArrowDownCircle } from 'lucide-react';

const headerConfig = [
  { title: "نام و نام‌خانوادگی", key: "name" },
  { title: "کلاس", key: "class" },
  { title: "فعالیت‌های آموزشی", key: "educationalActivities", color: "female" },
  { title: "داوطلبانه و فردی", key: "voluntaryActivities", color: "female" },
  { title: "فعالیت‌های شغلی", key: "jobActivities", color: "college" },
  { title: "کسر امتیازات", key: "deductions", color: "neutral" },
  { title: "امتیاز کل", key: "score", color: "ecosystem" },
  { title: "رتبه در پایه", key: "rank", color: "male" },
];

export default function GradeTable({ grade, token, onDataLoad }) {
  const [tableData, setTableData] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [errorTable, setErrorTable] = useState(null);
  const [currentPageTable, setCurrentPageTable] = useState(1);
  const [totalPagesTable, setTotalPagesTable] = useState(1);

  useEffect(() => {
    const fetchGradeData = async (page = 1) => {
      if (!grade || !token) {
        setTableData([]);
        setLoadingTable(false);
        if (!grade) setErrorTable("پایه‌ای برای نمایش جدول انتخاب نشده است.");
        return;
      }
      setLoadingTable(true);
      setErrorTable(null);
      try {
        const response = await fetchData(`users/grade-rankings?grade=${encodeURIComponent(grade)}&page=${page}&limit=15`, {
          headers: { authorization: `Bearer ${token}` }
        });

        if (response.success && Array.isArray(response.data)) {
          setTableData(response.data);
          setCurrentPageTable(page);
          setTotalPagesTable(Math.ceil((response.totalCount || 0) / 15));
          if (onDataLoad) onDataLoad({ grade, count: response.totalCount || 0 });
        } else {
          setErrorTable(response.message || `خطا در دریافت داده‌های پایه ${grade}.`);
          setTableData([]);
        }
      } catch (err) {
        setErrorTable(`خطای شبکه (پایه ${grade}): ` + (err.message || "خطای ناشناخته"));
        setTableData([]);
      } finally {
        setLoadingTable(false);
      }
    };

    fetchGradeData(currentPageTable);
  }, [grade, token, currentPageTable, onDataLoad]);

  const handlePageChangeTable = (newPage) => {
    if (newPage >= 1 && newPage <= totalPagesTable && !loadingTable) {
      setCurrentPageTable(newPage);
    }
  };

  if (loadingTable) {
    return (
      <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-[#202A5A] dark:border-[#59BBAF] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          در حال دریافت رتبه‌بندی پایه {grade}...
        </p>
      </div>
    );
  }

  if (errorTable) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-950/40 border-2 border-red-500 rounded-xl text-center text-red-600 dark:text-red-400 font-bold text-sm">
        {errorTable}
      </div>
    );
  }

  if (!tableData.length) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        داده‌ای برای نمایش در پایه {grade} وجود ندارد.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop View: Clean Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border-2 border-[#202A5A] dark:border-[#59BBAF]/30 rokad-shadow bg-white dark:bg-[#1E2640]">
        <table className="w-full text-right border-collapse text-sm">
          <thead>
            <tr className="bg-[#F8F9FA] dark:bg-[#151D2A] border-b-2 border-[#202A5A] dark:border-[#59BBAF]/30 text-xs font-bold text-gray-600 dark:text-gray-300">
              <th className="py-3 px-4 text-center">رتبه</th>
              <th className="py-3 px-4">نام و نام‌خانوادگی</th>
              <th className="py-3 px-4 text-center">کلاس</th>
              <th className="py-3 px-4 text-center">آموزشی</th>
              <th className="py-3 px-4 text-center">داوطلبانه و فردی</th>
              <th className="py-3 px-4 text-center">شغلی</th>
              <th className="py-3 px-4 text-center">کسورات</th>
              <th className="py-3 px-4 text-center">امتیاز کل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {tableData.map((row, idx) => {
              const rankNum = row.rank || idx + 1;
              const isTop3 = rankNum <= 3;
              return (
                <tr
                  key={row.id || idx}
                  className={`transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${
                    rankNum === 1
                      ? 'bg-amber-50/50 dark:bg-amber-950/20'
                      : rankNum === 2
                      ? 'bg-slate-100/50 dark:bg-slate-800/20'
                      : rankNum === 3
                      ? 'bg-orange-50/50 dark:bg-orange-950/20'
                      : ''
                  }`}
                >
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${
                        rankNum === 1
                          ? 'bg-amber-400 text-amber-950 border border-amber-500'
                          : rankNum === 2
                          ? 'bg-slate-300 text-slate-900 border border-slate-400'
                          : rankNum === 3
                          ? 'bg-amber-600 text-white border border-amber-700'
                          : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {toPersianDigits(rankNum)}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                    {row.name}
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-gray-500 dark:text-gray-400">
                    {toPersianDigits(row.class || '-')}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-[#E0195B]">
                    {toPersianDigits(row.educationalActivities ?? 0)}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-[#652D90]">
                    {toPersianDigits(row.voluntaryActivities ?? 0)}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-[#F8A41D]">
                    {toPersianDigits(row.jobActivities ?? 0)}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-red-500">
                    {row.deductions ? `(${toPersianDigits(row.deductions)}-)` : '۰'}
                  </td>
                  <td className="py-3 px-4 text-center font-black text-base text-[#59BBAF]">
                    {toPersianDigits(row.score ?? 0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {tableData.map((row, idx) => {
          const rankNum = row.rank || idx + 1;
          return (
            <div
              key={row.id || idx}
              className="bg-white dark:bg-[#1E2640] rounded-xl border-2 border-[#202A5A] dark:border-[#59BBAF]/30 p-4 rokad-shadow space-y-3"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      rankNum === 1
                        ? 'bg-amber-400 text-amber-950'
                        : rankNum === 2
                        ? 'bg-slate-300 text-slate-900'
                        : rankNum === 3
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {toPersianDigits(rankNum)}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{row.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">کلاس: {toPersianDigits(row.class || '-')}</p>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-gray-400 block">امتیاز کل</span>
                  <span className="font-black text-lg text-[#59BBAF]">{toPersianDigits(row.score ?? 0)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 dark:bg-white/5 p-2 rounded-lg flex items-center justify-between">
                  <span className="text-gray-500">آموزشی:</span>
                  <span className="font-bold text-[#E0195B]">{toPersianDigits(row.educationalActivities ?? 0)}</span>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 p-2 rounded-lg flex items-center justify-between">
                  <span className="text-gray-500">داوطلبانه:</span>
                  <span className="font-bold text-[#652D90]">{toPersianDigits(row.voluntaryActivities ?? 0)}</span>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 p-2 rounded-lg flex items-center justify-between">
                  <span className="text-gray-500">شغلی:</span>
                  <span className="font-bold text-[#F8A41D]">{toPersianDigits(row.jobActivities ?? 0)}</span>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 p-2 rounded-lg flex items-center justify-between">
                  <span className="text-gray-500">کسورات:</span>
                  <span className="font-bold text-red-500">{row.deductions ? `(${toPersianDigits(row.deductions)}-)` : '۰'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPagesTable > 1 && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <button
            onClick={() => handlePageChangeTable(currentPageTable - 1)}
            disabled={currentPageTable === 1 || loadingTable}
            className="p-2 border-2 border-[#202A5A] dark:border-[#59BBAF]/40 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            صفحه {toPersianDigits(currentPageTable)} از {toPersianDigits(totalPagesTable)}
          </span>
          <button
            onClick={() => handlePageChangeTable(currentPageTable + 1)}
            disabled={currentPageTable === totalPagesTable || loadingTable}
            className="p-2 border-2 border-[#202A5A] dark:border-[#59BBAF]/40 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}