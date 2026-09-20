import React, { useState, useEffect, useCallback } from 'react';
import fetchData from '../../Utils/fetchData';
import { toPersianDigits, formatToJalali } from '../../Utils/utils';
import { toast } from 'sonner';
import StatCard from '../../Components/UI/StatCard';
import RokadCard from '../../Components/UI/RokadCard';
import RokadButton from '../../Components/UI/RokadButton';
import RokadBadge from '../../Components/UI/RokadBadge';
import RewardApprovalModal from './RewardApprovalModal';
import {
  Gift,
  Clock,
  CheckCircle2,
  XCircle,
  Coins,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export default function RewardsAdminPage() {
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({
    rewardsPendingValue: 0,
    rewardsPaidValue: 0,
    systemTotalUsedOrPaidTokens: 0,
    systemTotalAvailableTokens: 0,
  });

  const [rewardsList, setRewardsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending'); // default pending
  const [studentSearch, setStudentSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedReward, setSelectedReward] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  const loadStats = async () => {
    if (!token) return;
    try {
      const res = await fetchData('student-reward/admin-stats', {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res?.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch admin stats:", err.message);
    }
  };

  const loadRewards = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      let query = `student-reward/rewards-list?page=${page}&limit=10`;
      if (statusFilter !== 'all') query += `&status=${statusFilter}`;
      if (studentSearch.trim()) query += `&studentName=${encodeURIComponent(studentSearch.trim())}`;

      const res = await fetchData(query, {
        headers: { authorization: `Bearer ${token}` }
      });

      if (res?.success && Array.isArray(res.data)) {
        setRewardsList(res.data);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, studentSearch]);

  useEffect(() => {
    loadStats();
  }, [token]);

  useEffect(() => {
    loadRewards();
  }, [loadRewards]);

  const handleConfirmStatus = async (rewardId, newStatus) => {
    setSubmittingAction(true);
    try {
      const res = await fetchData(`student-reward/${rewardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });

      if (res?.success) {
        toast.success(newStatus === 'approved' ? "تحویل پاداش با موفقیت تایید شد." : "درخواست رد شد و توکن‌ها مسترد گردید.");
        setIsModalOpen(false);
        loadStats();
        loadRewards();
      } else {
        toast.error(res?.message || "خطا در تغییر وضعیت پاداش.");
      }
    } catch (err) {
      toast.error("خطای شبکه یا سرور");
    } finally {
      setSubmittingAction(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'approved') return <RokadBadge variant="approved" label="تحویل داده شده" />;
    if (status === 'pending') return <RokadBadge variant="pending" label="در انتظار تحویل" />;
    return <RokadBadge variant="rejected" label="رد شده" />;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#202A5A] dark:text-white">
          مدیریت پاداش‌ها و جوایز
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          بررسی و تایید تحویل جوایز درخواستی دانش‌آموزان با توکن‌های کسب‌شده
        </p>
      </div>

      {/* 2. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          title="درخواست‌های در انتظار"
          value={stats.rewardsPendingValue}
          subtitle="هدایای در صف بررسی یا تحویل"
          icon={Clock}
          theme="female"
        />
        <StatCard
          title="پاداش‌های تحویل شده"
          value={stats.rewardsPaidValue}
          subtitle="هدایای اعطا شده به دانش‌آموزان"
          icon={CheckCircle2}
          theme="ecosystem"
        />
        <StatCard
          title="مجموع توکن‌های مصرف‌شده"
          value={stats.systemTotalUsedOrPaidTokens}
          subtitle="توکن‌های خرج شده برای جوایز"
          icon={Coins}
          theme="college"
        />
      </div>

      {/* 3. Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-white dark:bg-[#151C28] border border-gray-200 dark:border-gray-800 shadow-[2px_2px_0_#202A5A] dark:shadow-[2px_2px_0_#59BBAF]">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'pending', label: 'در انتظار تحویل' },
            { id: 'approved', label: 'تحویل داده شده' },
            { id: 'rejected', label: 'رد شده' },
            { id: 'all', label: 'همه' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#59BBAF] text-white shadow-[2px_2px_0_#1F413D]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={studentSearch}
            onChange={(e) => {
              setStudentSearch(e.target.value);
              setPage(1);
            }}
            placeholder="جستجوی نام دانش‌آموز..."
            className="rokad-input pr-9 text-xs"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 4. Table */}
      <RokadCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">
            در حال دریافت لیست پاداش‌ها...
          </div>
        ) : rewardsList.length === 0 ? (
          <div className="p-12 text-center">
            <Gift className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-[#202A5A] dark:text-white mb-1">
              موردی با این فیلتر یافت نشد
            </h4>
            <p className="text-xs text-gray-400">
              هیچ درخواست پاداشی در این وضعیت ثبت نشده است.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead className="bg-[#F8F9FA] dark:bg-[#1C2536] text-[#202A5A] dark:text-white font-black border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="p-4">دانش‌آموز</th>
                    <th className="p-4">پایه</th>
                    <th className="p-4">عنوان پاداش</th>
                    <th className="p-4">توکن پرداختی</th>
                    <th className="p-4">تاریخ درخواست</th>
                    <th className="p-4">وضعیت</th>
                    <th className="p-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rewardsList.map((item) => (
                    <tr
                      key={item._id || item.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-[#1C2536]/50 transition-colors"
                    >
                      <td className="p-4 font-bold text-[#202A5A] dark:text-white">
                        {item.studentName || item.userName}
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-400">
                        {item.studentGrade ? `پایه ${item.studentGrade}` : '—'}
                      </td>
                      <td className="p-4 font-bold text-[#202A5A] dark:text-white">
                        {item.rewardTitle || item.title}
                      </td>
                      <td className="p-4 font-black text-amber-600 dark:text-amber-400">
                        {toPersianDigits(item.tokenCost || item.token || 0)} توکن
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-400">
                        {formatToJalali(item.submissionDate || item.createdAt)}
                      </td>
                      <td className="p-4">{getStatusBadge(item.status)}</td>
                      <td className="p-4 text-center">
                        <RokadButton
                          onClick={() => {
                            setSelectedReward({
                              studentRewardId: item._id || item.id,
                              userName: item.studentName || item.userName,
                              userGrade: item.studentGrade,
                              rewardTitle: item.rewardTitle || item.title,
                              rewardDescription: item.description,
                              submissionDate: formatToJalali(item.submissionDate || item.createdAt),
                              tokenAmountRequired: item.tokenCost || item.token || 0,
                            });
                            setIsModalOpen(true);
                          }}
                          variant={item.status === 'pending' ? 'primary' : 'outline'}
                          size="sm"
                        >
                          {item.status === 'pending' ? 'بررسی و تایید' : 'مشاهده'}
                        </RokadButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {rewardsList.map((item) => (
                <div key={item._id || item.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#202A5A] dark:text-white">
                        {item.studentName || item.userName}
                      </h4>
                      <span className="text-xs text-gray-400">
                        {item.studentGrade ? `پایه ${item.studentGrade}` : ''}
                      </span>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-gray-50 dark:bg-[#1C2536]">
                    <span className="font-bold text-[#202A5A] dark:text-white">
                      {item.rewardTitle || item.title}
                    </span>
                    <span className="font-black text-amber-600">
                      {toPersianDigits(item.tokenCost || item.token || 0)} توکن
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-gray-400">
                      {formatToJalali(item.submissionDate || item.createdAt)}
                    </span>
                    <RokadButton
                      onClick={() => {
                        setSelectedReward({
                          studentRewardId: item._id || item.id,
                          userName: item.studentName || item.userName,
                          userGrade: item.studentGrade,
                          rewardTitle: item.rewardTitle || item.title,
                          submissionDate: formatToJalali(item.submissionDate || item.createdAt),
                          tokenAmountRequired: item.tokenCost || item.token || 0,
                        });
                        setIsModalOpen(true);
                      }}
                      variant={item.status === 'pending' ? 'primary' : 'outline'}
                      size="sm"
                    >
                      {item.status === 'pending' ? 'بررسی و تایید' : 'مشاهده'}
                    </RokadButton>
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

      {/* Approval Modal */}
      <RewardApprovalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rewardData={selectedReward}
        onConfirm={handleConfirmStatus}
        submitting={submittingAction}
      />
    </div>
  );
}