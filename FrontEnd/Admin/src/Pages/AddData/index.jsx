import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import fetchData from '../../Utils/fetchData';
import { toPersianDigits, formatToJalali } from '../../Utils/utils';
import StatCard from '../../Components/UI/StatCard';
import RokadCard from '../../Components/UI/RokadCard';
import RokadButton from '../../Components/UI/RokadButton';
import {
  PlusCircle,
  ClipboardList,
  Search,
  Medal,
  ChevronLeft,
  ChevronRight,
  Filter,
  User
} from 'lucide-react';

export default function AddData() {
  const token = localStorage.getItem("token");

  const [activitiesList, setActivitiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchActivities = async () => {
    if (!token) return;
    setLoading(true);

    try {
      let query = `admin-activity?page=${page}&limit=10`;
      if (studentSearch.trim()) query += `&studentName=${encodeURIComponent(studentSearch.trim())}`;
      if (selectedCategory) query += `&category=${encodeURIComponent(selectedCategory)}`;

      const res = await fetchData(query, {
        headers: { authorization: `Bearer ${token}` }
      });

      if (res?.success && Array.isArray(res.data)) {
        setActivitiesList(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.totalCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [page, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchActivities();
  };

  const categories = [
    'فعالیت‌های آموزشی',
    'فعالیت‌های شغلی',
    'فعالیت‌های داوطلبانه و توسعه فردی',
    'موارد کسر امتیاز',
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#202A5A] dark:text-white">
            ثبت اطلاعات و فعالیت‌ها
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            ثبت دستی امتیاز، معدل‌ها یا فعالیت‌های کارگاهی برای دانش‌آموزان
          </p>
        </div>

        <Link to="/add-data/create">
          <RokadButton variant="primary" icon={PlusCircle} size="md">
            ثبت فعالیت جدید برای دانش‌آموز
          </RokadButton>
        </Link>
      </div>

      {/* 2. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <StatCard
          title="تعداد فعالیت‌های ثبت‌شده"
          value={totalCount}
          subtitle="توسط دبیران و کادر مدرسه"
          icon={ClipboardList}
          theme="male"
        />
        <StatCard
          title="ثبت مستقیم در کارنامه"
          value="لحظه‌ای"
          subtitle="امتیازات بلافاصله در رتبه‌بندی منعکس می‌شوند"
          icon={Medal}
          theme="ecosystem"
        />
      </div>

      {/* 3. Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-white dark:bg-[#151C28] border border-gray-200 dark:border-gray-800 shadow-[2px_2px_0_#202A5A] dark:shadow-[2px_2px_0_#59BBAF]">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setSelectedCategory('');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !selectedCategory
                ? 'bg-[#59BBAF] text-white shadow-[2px_2px_0_#1F413D]'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            همه دسته‌ها
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#59BBAF] text-white shadow-[2px_2px_0_#1F413D]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
          <input
            type="text"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            placeholder="جستجوی نام دانش‌آموز..."
            className="rokad-input pr-9 text-xs"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </form>
      </div>

      {/* 4. Table */}
      <RokadCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">در حال دریافت داده‌ها...</div>
        ) : activitiesList.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-[#202A5A] dark:text-white mb-1">
              هیچ رکوردی یافت نشد
            </h4>
            <p className="text-xs text-gray-400 mb-4">
              می‌توانید با دکمه بالا برای دانش‌آموزان فعالیت جدید ثبت نمایید.
            </p>
            <Link to="/add-data/create">
              <RokadButton variant="primary" size="sm" icon={PlusCircle}>
                ثبت فعالیت جدید
              </RokadButton>
            </Link>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead className="bg-[#F8F9FA] dark:bg-[#1C2536] text-[#202A5A] dark:text-white font-black border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="p-4">دانش‌آموز</th>
                    <th className="p-4">پایه و کلاس</th>
                    <th className="p-4">عنوان فعالیت</th>
                    <th className="p-4">جزئیات</th>
                    <th className="p-4">تاریخ ثبت</th>
                    <th className="p-4 text-center">نوع</th>
                    <th className="p-4 text-center">امتیاز</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {activitiesList.map((item) => (
                    <tr
                      key={item.id || item._id}
                      className="hover:bg-gray-50/80 dark:hover:bg-[#1C2536]/50 transition-colors"
                    >
                      <td className="p-4 font-bold text-[#202A5A] dark:text-white">
                        {item.user?.fullName}
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-400">
                        پایه {item.user?.grade || '—'} • کلاس {toPersianDigits(item.user?.class || '')}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-[#202A5A] dark:text-white block">
                          {item.activity?.name}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {item.activity?.parent}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {item.details || '—'}
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-400">
                        {formatToJalali(item.createdAt)}
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                          {item.type || 'فردی'}
                        </span>
                      </td>
                      <td className="p-4 text-center font-black text-[#59BBAF]">
                        {item.scoreAwarded > 0
                          ? `+${toPersianDigits(item.scoreAwarded)}`
                          : toPersianDigits(item.scoreAwarded)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {activitiesList.map((item) => (
                <div key={item.id || item._id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#202A5A] dark:text-white">
                        {item.user?.fullName}
                      </h4>
                      <span className="text-xs text-gray-400">
                        پایه {item.user?.grade} • کلاس {toPersianDigits(item.user?.class)}
                      </span>
                    </div>
                    <span className="font-black text-[#59BBAF] text-sm">
                      {item.scoreAwarded > 0 ? `+${toPersianDigits(item.scoreAwarded)}` : toPersianDigits(item.scoreAwarded)} امتیاز
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-gray-50 dark:bg-[#1C2536] text-xs">
                    <span className="font-bold text-[#202A5A] dark:text-white block">
                      {item.activity?.name}
                    </span>
                    {item.details && (
                      <span className="text-gray-500 dark:text-gray-400 block mt-0.5">
                        جزئیات: {item.details}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                    <span>{formatToJalali(item.createdAt)}</span>
                    <span>نوع: {item.type || 'فردی'}</span>
                  </div>
                </div>
              ))}
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
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>قبلی</span>
              </RokadButton>
              <RokadButton
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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