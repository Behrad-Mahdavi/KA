import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import fetchData from '../../Utils/fetchData';
import { toPersianDigits, formatToJalali } from '../../Utils/utils';
import StatCard from '../../Components/UI/StatCard';
import RokadCard from '../../Components/UI/RokadCard';
import RokadButton from '../../Components/UI/RokadButton';
import RokadBadge from '../../Components/UI/RokadBadge';
import RewardDetailsModal from './RewardDetailsModal';
import {
  Gift,
  Coins,
  CheckCircle2,
  Clock,
  Eye,
  Plus,
  ShoppingBag,
  AlertCircle
} from 'lucide-react';

export default function Rewards() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [rewardsList, setRewardsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [currentUserTokens, setCurrentUserTokens] = useState(user?.token || 0);
  const [selectedReward, setSelectedReward] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchBalanceAndList = async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      // 1. Fetch balance
      try {
        const profileRes = await fetchData('users/my-profile', {
          headers: { authorization: `Bearer ${token}` }
        });
        if (profileRes?.success && profileRes.data) {
          setCurrentUserTokens(profileRes.data.token || 0);
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (storedUser) {
            storedUser.token = profileRes.data.token || 0;
            storedUser.score = profileRes.data.score || 0;
            localStorage.setItem('user', JSON.stringify(storedUser));
          }
        }
      } catch (profileErr) {
        console.warn('Profile fetch warning:', profileErr);
      }

      // 2. Fetch rewards list
      let query = 'student-reward/my-list?limit=50';
      if (statusFilter !== 'all') {
        query += `&status=${statusFilter}`;
      }

      const res = await fetchData(query, {
        headers: { authorization: `Bearer ${token}` }
      });

      if (res?.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.rewards || []);
        setRewardsList(list);
        setError('');
      } else {
        setError(res?.message || 'خطا در دریافت سوابق پاداش‌ها');
      }
    } catch (err) {
      setError(err.message || 'خطای شبکه');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalanceAndList();
  }, [statusFilter]);

  const approvedCount = rewardsList.filter(r => r.status === 'approved').length;
  const pendingCount = rewardsList.filter(r => r.status === 'pending').length;

  const getStatusBadge = (status) => {
    if (status === 'approved') return <RokadBadge variant="approved" label="تحویل داده شده" />;
    if (status === 'pending') return <RokadBadge variant="pending" label="در انتظار بررسی" />;
    return <RokadBadge variant="rejected" label="رد شده" />;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#202A5A] dark:text-white">
            مدیریت و سوابق پاداش‌ها
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            مشاهده موجودی توکن و پیگیری هدایای درخواست‌شده
          </p>
        </div>

        <Link to="/request-reward">
          <RokadButton variant="primary" icon={ShoppingBag} size="md">
            ورود به ویترین و دریافت پاداش
          </RokadButton>
        </Link>
      </div>

      {/* 2. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          title="موجودی توکن شما"
          value={currentUserTokens}
          subtitle="آماده برای خرج در ویترین"
          icon={Coins}
          theme="college"
          trend={{ value: "فعال", isPositive: true }}
        />
        <StatCard
          title="پاداش‌های دریافت شده"
          value={approvedCount}
          subtitle="تایید و تحویل داده شده"
          icon={CheckCircle2}
          theme="ecosystem"
        />
        <StatCard
          title="درخواست‌های در انتظار"
          value={pendingCount}
          subtitle="در حال هماهنگی توسط مدرسه"
          icon={Clock}
          theme="male"
        />
      </div>

      {/* 3. Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#151C28] border border-gray-200 dark:border-gray-800 shadow-[2px_2px_0_#202A5A] dark:shadow-[2px_2px_0_#59BBAF]">
        {[
          { id: 'all', label: 'همه درخواست‌ها' },
          { id: 'approved', label: 'تحویل داده شده' },
          { id: 'pending', label: 'در انتظار' },
          { id: 'rejected', label: 'رد شده' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              statusFilter === tab.id
                ? 'bg-[#59BBAF] text-white shadow-[2px_2px_0_#1F413D]'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Requests List / Table */}
      <RokadCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">
            در حال بارگذاری سوابق...
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-[#202A5A] dark:text-white mb-2">{error}</h4>
            <RokadButton onClick={fetchBalanceAndList} variant="primary" size="sm">
              تلاش مجدد
            </RokadButton>
          </div>
        ) : rewardsList.length === 0 ? (
          <div className="p-12 text-center">
            <Gift className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-[#202A5A] dark:text-white mb-1">
              هنوز درخواستی ثبت نکرده‌اید
            </h4>
            <p className="text-xs text-gray-400 mb-4">
              از موجودی توکن‌های خود برای انتخاب و دریافت پاداش از ویترین استفاده کنید.
            </p>
            <Link to="/request-reward">
              <RokadButton variant="primary" size="sm" icon={ShoppingBag}>
                مشاهده ویترین جوایز
              </RokadButton>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead className="bg-[#F8F9FA] dark:bg-[#1C2536] text-[#202A5A] dark:text-white font-black border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="p-4">عنوان پاداش</th>
                    <th className="p-4">دسته‌بندی</th>
                    <th className="p-4">توکن پرداختی</th>
                    <th className="p-4">تاریخ درخواست</th>
                    <th className="p-4">وضعیت</th>
                    <th className="p-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rewardsList.map((reward) => (
                    <tr
                      key={reward.id || reward._id}
                      className="hover:bg-gray-50/80 dark:hover:bg-[#1C2536]/50 transition-colors"
                    >
                      <td className="p-4 font-bold text-[#202A5A] dark:text-white">
                        {reward.title || reward.name}
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-400">
                        {reward.parent || reward.category || 'پاداش‌های عمومی'}
                      </td>
                      <td className="p-4 font-black text-amber-600 dark:text-amber-400">
                        {toPersianDigits(reward.token || reward.points || 0)} توکن
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-400">
                        {formatToJalali(reward.submissionDate || reward.createdAt)}
                      </td>
                      <td className="p-4">{getStatusBadge(reward.status)}</td>
                      <td className="p-4 text-center">
                        <RokadButton
                          onClick={() => {
                            setSelectedReward(reward);
                            setIsDetailsOpen(true);
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

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {rewardsList.map((reward) => (
                <div key={reward.id || reward._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-[#202A5A] dark:text-white">
                      {reward.title || reward.name}
                    </h4>
                    {getStatusBadge(reward.status)}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{reward.parent || 'پاداش‌های عمومی'}</span>
                    <span className="font-black text-amber-600">
                      {toPersianDigits(reward.token || reward.points || 0)} توکن
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs border-t border-gray-100 dark:border-gray-800">
                    <span className="text-gray-400">
                      {formatToJalali(reward.submissionDate || reward.createdAt)}
                    </span>
                    <RokadButton
                      onClick={() => {
                        setSelectedReward(reward);
                        setIsDetailsOpen(true);
                      }}
                      variant="outline"
                      size="sm"
                      icon={Eye}
                    >
                      جزئیات
                    </RokadButton>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </RokadCard>

      {/* Details Modal */}
      <RewardDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        reward={selectedReward}
      />
    </div>
  );
}