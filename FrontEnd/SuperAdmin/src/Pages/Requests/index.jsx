import React, { useState, useEffect } from 'react';
import fetchData from '../../Utils/fetchData';
import { toPersianDigits, formatToJalali } from '../../Utils/utils';
import { toast } from 'sonner';
import StatCard from '../../Components/UI/StatCard';
import RokadCard from '../../Components/UI/RokadCard';
import RokadButton from '../../Components/UI/RokadButton';
import RokadBadge from '../../Components/UI/RokadBadge';
import RequestApprovalModal from './RequestApprovalModal';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  AlertCircle
} from 'lucide-react';

export default function Requests() {
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({ pendingCount: 0, approvedCount: 0, totalRequests: 0 });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [searchStudent, setSearchStudent] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchStats = async () => {
    if (!token) return;
    try {
      const res = await fetchData('admin-review/student-activity-stats', {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res?.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    if (!token) return;
    setLoading(true);
    try {
      let query = `admin-review/student-activities-list?page=${page}&limit=10`;
      if (filterStatus !== 'all') query += `&status=${filterStatus}`;
      if (searchStudent.trim()) query += `&studentName=${encodeURIComponent(searchStudent.trim())}`;

      const res = await fetchData(query, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res?.success && Array.isArray(res.data)) {
        setRequests(res.data);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [filterStatus, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  const handleApprove = async (id, scoreAwarded, adminComment, details) => {
    setSubmittingAction(true);
    try {
      const res = await fetchData(`admin-review/student-activities/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ scoreAwarded, adminComment, details })
      });

      if (res?.success) {
        toast.success("درخواست با موفقیت تایید و امتیاز ثبت شد.");
        setIsModalOpen(false);
        fetchStats();
        fetchRequests();
      } else {
        toast.error(res?.message || "خطا در تایید درخواست.");
      }
    } catch (err) {
      toast.error("خطای شبکه یا سرور");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReject = async (id, adminComment) => {
    setSubmittingAction(true);
    try {
      const res = await fetchData(`admin-review/student-activities/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ adminComment })
      });

      if (res?.success) {
        toast.info("درخواست رد شد و بازخورد به دانش‌آموز اعلام گردید.");
        setIsModalOpen(false);
        fetchStats();
        fetchRequests();
      } else {
        toast.error(res?.message || "خطا در رد درخواست.");
      }
    } catch (err) {
      toast.error("خطای شبکه یا سرور");
    } finally {
      setSubmittingAction(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'approved') return <RokadBadge variant="ecosystem">تایید شده</RokadBadge>;
    if (status === 'pending') return <RokadBadge variant="college">در انتظار بررسی</RokadBadge>;
    return <RokadBadge variant="female">رد شده</RokadBadge>;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#202A5A] dark:text-white">
          کارتابل بررسی و داوری درخواست‌ها
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          بررسی، تایید امتیاز یا رد فعالیت‌های ارسال‌شده توسط دانش‌آموزان با دسترسی مدیریت عالی
        </p>
      </div>

      {/* 2. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          title="در انتظار بررسی"
          value={toPersianDigits(stats.pendingCount || 0)}
          unit="مورد"
          icon={Clock}
          persona="female"
        />
        <StatCard
          title="تایید شده"
          value={toPersianDigits(stats.approvedCount || 0)}
          unit="مورد"
          icon={CheckCircle2}
          persona="ecosystem"
        />
        <StatCard
          title="کل درخواست‌ها"
          value={toPersianDigits(stats.totalRequests || 0)}
          unit="مورد"
          icon={ClipboardList}
          persona="male"
        />
      </div>

      {/* 3. Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#1E2640] border-2 border-[#202A5A] dark:border-[#59BBAF]/30 rokad-shadow">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'pending', label: 'در انتظار بررسی' },
            { id: 'approved', label: 'تایید شده' },
            { id: 'rejected', label: 'رد شده' },
            { id: 'all', label: 'همه درخواست‌ها' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterStatus(tab.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                filterStatus === tab.id
                  ? 'bg-[#202A5A] text-[#59BBAF] border-[#202A5A] shadow-[2px_2px_0_#59BBAF]'
                  : 'bg-transparent text-gray-600 dark:text-gray-300 border-transparent hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            placeholder="جستجوی نام دانش‌آموز..."
            className="w-full rokad-input rounded-xl pr-9 text-xs bg-white dark:bg-[#151D2A]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </form>
      </div>

      {/* 4. Requests Table */}
      <RokadCard className="p-0 overflow-hidden" hover={false}>
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">
            در حال دریافت درخواست‌ها...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-[#202A5A] dark:text-white mb-1">
              درخواستی در این بخش وجود ندارد
            </h4>
            <p className="text-xs text-gray-400">
              با انتخاب فیلترهای دیگر می‌توانید سوابق پیشین را مشاهده کنید.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead className="bg-[#F8F9FA] dark:bg-[#151D2A] text-[#202A5A] dark:text-white font-black border-b-2 border-[#202A5A] dark:border-[#59BBAF]/30">
                  <tr>
                    <th className="p-4">دانش‌آموز</th>
                    <th className="p-4">پایه و کلاس</th>
                    <th className="p-4">عنوان فعالیت</th>
                    <th className="p-4">تاریخ ثبت</th>
                    <th className="p-4">وضعیت</th>
                    <th className="p-4 text-center">امتیاز</th>
                    <th className="p-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {requests.map((item) => (
                    <tr
                      key={item.id || item._id}
                      className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4 font-bold text-[#202A5A] dark:text-white">
                        {item.studentName}
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-400">
                        پایه {item.studentGrade || '—'} • کلاس {toPersianDigits(item.studentClass || '')}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-[#202A5A] dark:text-white block">
                          {item.activityName || item.activityTitle}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {item.activityParent}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-400">
                        {formatToJalali(item.submissionDate || item.createdAt)}
                      </td>
                      <td className="p-4">{getStatusBadge(item.status)}</td>
                      <td className="p-4 text-center font-black text-[#59BBAF]">
                        {item.scoreAwarded > 0 ? `+${toPersianDigits(item.scoreAwarded)}` : toPersianDigits(item.scoreAwarded ?? 0)}
                      </td>
                      <td className="p-4 text-center">
                        <RokadButton
                          onClick={() => {
                            setSelectedRequest(item);
                            setIsModalOpen(true);
                          }}
                          variant={item.status === 'pending' ? 'primary' : 'outline'}
                          size="sm"
                        >
                          {item.status === 'pending' ? 'بررسی و تصمیم' : 'مشاهده جزئیات'}
                        </RokadButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-white/5">
              {requests.map((item) => (
                <div key={item.id || item._id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#202A5A] dark:text-white">
                        {item.studentName}
                      </h4>
                      <span className="text-xs text-gray-400">
                        پایه {item.studentGrade} • کلاس {toPersianDigits(item.studentClass)}
                      </span>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 text-xs">
                    <span className="font-bold text-[#202A5A] dark:text-white block">
                      {item.activityName || item.activityTitle}
                    </span>
                    <span className="text-gray-400 text-[11px]">
                      {item.activityParent}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-gray-400">
                      {formatToJalali(item.submissionDate || item.createdAt)}
                    </span>
                    <RokadButton
                      onClick={() => {
                        setSelectedRequest(item);
                        setIsModalOpen(true);
                      }}
                      variant={item.status === 'pending' ? 'primary' : 'outline'}
                      size="sm"
                    >
                      {item.status === 'pending' ? 'بررسی و ثبت نظر' : 'مشاهده'}
                    </RokadButton>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs">
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

      {/* Approval / Review Modal */}
      <RequestApprovalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        requestData={selectedRequest}
        onApprove={handleApprove}
        onReject={handleReject}
        submitting={submittingAction}
      />
    </div>
  );
}