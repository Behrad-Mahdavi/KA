import React, { useEffect, useState } from 'react';
import fetchData from '../../Utils/fetchData';
import { toPersianDigits, formatToJalali } from '../../Utils/utils';
import StatCard from '../../Components/UI/StatCard';
import RokadCard from '../../Components/UI/RokadCard';
import RokadButton from '../../Components/UI/RokadButton';
import RokadBadge from '../../Components/UI/RokadBadge';
import AddActivityModal from './AddActivityModal';
import ActivityDetailsModal from './ActivityDetailsModal';
import {
  CheckCircle2,
  Clock,
  ClipboardList,
  Plus,
  Eye,
  Calendar,
  AlertCircle,
  Filter
} from 'lucide-react';

export default function Activities() {
  const token = localStorage.getItem("token");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const [stats, setStats] = useState({
    approvedStudentActivities: 0,
    pendingStudentActivities: 0,
    totalAllActivities: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const [activities, setActivities] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'approved', 'pending', 'admin'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStats = async () => {
    if (!token) return;
    try {
      const res = await fetchData('my-activities/my-stats', {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.success && res.data) {
        setStats({
          approvedStudentActivities: res.data.approvedStudentActivities ?? res.data.approvedCount ?? 0,
          pendingStudentActivities: res.data.pendingStudentActivities ?? res.data.pendingCount ?? 0,
          totalAllActivities: res.data.totalAllActivities ?? (
            (res.data.approvedCount || 0) + (res.data.pendingCount || 0) + (res.data.adminTotal || 0)
          ),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchActivities = async () => {
    if (!token) return;
    setLoadingList(true);
    try {
      let query = `my-activities/my-list?page=${page}&limit=10`;
      if (filterStatus === 'approved') query += `&status=approved&entryType=student`;
      else if (filterStatus === 'pending') query += `&status=pending&entryType=student`;
      else if (filterStatus === 'admin') query += `&entryType=admin`;

      const res = await fetchData(query, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.success && Array.isArray(res.data)) {
        setActivities(res.data);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [filterStatus, page]);

  const handleActivityAdded = () => {
    fetchStats();
    fetchActivities();
  };

  const getStatusBadge = (status) => {
    if (status === 'approved' || status === 'ثبت توسط ادمین') {
      return (
        <RokadBadge
          variant="approved"
          label={status === 'ثبت توسط ادمین' ? 'ثبت ادمین' : 'تایید شده'}
        />
      );
    }
    if (status === 'pending') {
      return <RokadBadge variant="pending" label="در انتظار بررسی" />;
    }
    return <RokadBadge variant="rejected" label="رد شده" />;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#202A5A] dark:text-white">
            فعالیت‌ها و دستاوردها
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            ثبت، پیگیری وضعیت و بررسی امتیازات فعالیت‌های شما
          </p>
        </div>

        <RokadButton
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          icon={Plus}
          size="md"
        >
          ثبت فعالیت جدید
        </RokadButton>
      </div>

      {/* 2. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          title="فعالیت‌های تایید شده"
          value={stats.approvedStudentActivities}
          subtitle="امتیاز به حساب شما اضافه شد"
          icon={CheckCircle2}
          theme="ecosystem"
        />
        <StatCard
          title="در انتظار بررسی"
          value={stats.pendingStudentActivities}
          subtitle="در صف بررسی دبیران هنرستان"
          icon={Clock}
          theme="college"
        />
        <StatCard
          title="کل فعالیت‌های ثبت‌شده"
          value={stats.totalAllActivities}
          subtitle="مجموع فعالیت‌های فردی و گروهی"
          icon={ClipboardList}
          theme="male"
        />
      </div>

      {/* 3. Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#151C28] border border-gray-200 dark:border-gray-800 shadow-[2px_2px_0_#202A5A] dark:shadow-[2px_2px_0_#59BBAF]">
        {[
          { id: 'all', label: 'همه فعالیت‌ها' },
          { id: 'approved', label: 'تایید شده' },
          { id: 'pending', label: 'در انتظار بررسی' },
          { id: 'admin', label: 'ثبت‌شده توسط مدرسه' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setFilterStatus(tab.id);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              filterStatus === tab.id
                ? 'bg-[#59BBAF] text-white shadow-[2px_2px_0_#1F413D]'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Activities Data Table / Card View */}
      <RokadCard className="p-0 overflow-hidden">
        {loadingList ? (
          <div className="p-12 text-center text-xs text-gray-400">
            در حال بارگذاری لیست فعالیت‌ها...
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-[#202A5A] dark:text-white mb-1">
              فعالیتی با این فیلتر یافت نشد
            </h4>
            <p className="text-xs text-gray-400 mb-4">
              می‌توانید فعالیت جدیدی ثبت کنید تا پس از بررسی امتیاز دریافت نمایید.
            </p>
            <RokadButton
              onClick={() => setIsAddModalOpen(true)}
              variant="primary"
              size="sm"
              icon={Plus}
            >
              ثبت فعالیت جدید
            </RokadButton>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead className="bg-[#F8F9FA] dark:bg-[#1C2536] text-[#202A5A] dark:text-white font-black border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="p-4">عنوان فعالیت</th>
                    <th className="p-4">جزئیات / مقدار</th>
                    <th className="p-4">تاریخ ثبت</th>
                    <th className="p-4">وضعیت</th>
                    <th className="p-4">امتیاز کسب‌شده</th>
                    <th className="p-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {activities.map((item) => (
                    <tr
                      key={item.id || item._id}
                      className="hover:bg-gray-50/80 dark:hover:bg-[#1C2536]/50 transition-colors"
                    >
                      <td className="p-4 font-bold text-[#202A5A] dark:text-white">
                        {item.activityName}
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {item.details || '—'}
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-400">
                        {formatToJalali(item.submissionDate || item.sortDate)}
                      </td>
                      <td className="p-4">{getStatusBadge(item.status)}</td>
                      <td className="p-4 font-black text-[#59BBAF]">
                        {item.scoreAwarded > 0
                          ? `+${toPersianDigits(item.scoreAwarded)}`
                          : toPersianDigits(item.scoreAwarded)}
                      </td>
                      <td className="p-4 text-center">
                        <RokadButton
                          onClick={() => {
                            setSelectedActivity(item);
                            setIsDetailsModalOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                          icon={Eye}
                        >
                          جزئیات
                        </RokadButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {activities.map((item) => (
                <div key={item.id || item._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-[#202A5A] dark:text-white">
                      {item.activityName}
                    </h4>
                    {getStatusBadge(item.status)}
                  </div>

                  {item.details && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      جزئیات: {item.details}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 text-xs border-t border-gray-100 dark:border-gray-800">
                    <span className="text-gray-400">
                      {formatToJalali(item.submissionDate || item.sortDate)}
                    </span>
                    <span className="font-black text-[#59BBAF]">
                      {item.scoreAwarded > 0
                        ? `+${toPersianDigits(item.scoreAwarded)} امتیاز`
                        : `${toPersianDigits(item.scoreAwarded)} امتیاز`}
                    </span>
                  </div>

                  <RokadButton
                    onClick={() => {
                      setSelectedActivity(item);
                      setIsDetailsModalOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    className="w-full"
                  >
                    مشاهده جزئیات
                  </RokadButton>
                </div>
              ))}
            </div>
          </>
        )}
      </RokadCard>

      {/* Modals */}
      <AddActivityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleActivityAdded}
        token={token}
      />

      <ActivityDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        activity={selectedActivity}
      />
    </div>
  );
}
