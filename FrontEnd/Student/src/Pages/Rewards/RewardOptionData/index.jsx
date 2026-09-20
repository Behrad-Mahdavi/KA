import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import fetchData from '../../../Utils/fetchData';
import { toPersianDigits, formatToJalali } from '../../../Utils/utils';
import RokadCard from '../../../Components/UI/RokadCard';
import StatCard from '../../../Components/UI/StatCard';
import RokadButton from '../../../Components/UI/RokadButton';
import RokadBadge from '../../../Components/UI/RokadBadge';
import RokadModal from '../../../Components/UI/RokadModal';
import {
  Gift,
  Coins,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  HeartHandshake
} from 'lucide-react';

export default function RewardOptionData() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();

  const [rewardsByCategory, setRewardsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserTokens, setCurrentUserTokens] = useState(user?.token || 0);

  // Modal State
  const [selectedReward, setSelectedReward] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalMessage, setModalMessage] = useState(null);

  // Fetch student's latest balance
  const fetchBalance = async () => {
    if (!token) return;
    try {
      const res = await fetchData('users/my-profile', {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res?.success && res.data) {
        setCurrentUserTokens(res.data.token || 0);
        // update local user
        localStorage.setItem("user", JSON.stringify(res.data));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch available rewards catalog
  const fetchCatalog = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetchData('reward', {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res?.success && Array.isArray(res.data)) {
        // Group rewards by parent
        const grouped = res.data.reduce((acc, reward) => {
          const parent = reward.parent || 'پاداش‌های عمومی';
          if (!acc[parent]) acc[parent] = [];
          acc[parent].push(reward);
          return acc;
        }, {});
        setRewardsByCategory(grouped);
      } else {
        setError(res?.message || 'خطا در دریافت لیست پاداش‌ها');
      }
    } catch (err) {
      setError(err.message || 'خطای شبکه');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchCatalog();
  }, []);

  const handleOpenClaimModal = (reward) => {
    setSelectedReward(reward);
    setTokenInput(reward.minToken ? String(reward.minToken) : '10');
    setModalMessage(null);
    setIsModalOpen(true);
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReward) return;

    const requestedAmount = parseInt(tokenInput, 10);
    if (isNaN(requestedAmount) || requestedAmount < selectedReward.minToken) {
      setModalMessage({ type: 'error', text: `حداقل توکن مورد نیاز ${toPersianDigits(selectedReward.minToken)} است.` });
      return;
    }
    if (selectedReward.maxToken && requestedAmount > selectedReward.maxToken) {
      setModalMessage({ type: 'error', text: `حداکثر توکن مجاز ${toPersianDigits(selectedReward.maxToken)} است.` });
      return;
    }
    if (requestedAmount > currentUserTokens) {
      setModalMessage({ type: 'error', text: 'موجودی توکن شما برای دریافت این پاداش کافی نیست.' });
      return;
    }

    setSubmitting(true);
    setModalMessage(null);

    try {
      const res = await fetchData('student-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({
          rewardId: selectedReward.id || selectedReward._id,
          token: requestedAmount
        })
      });

      if (res?.success) {
        setModalMessage({ type: 'success', text: 'درخواست شما با موفقیت ثبت شد و توکن کسر گردید.' });
        setCurrentUserTokens(prev => Math.max(0, prev - requestedAmount));
        setTimeout(() => {
          setIsModalOpen(false);
          navigate('/rewards');
        }, 1500);
      } else {
        setModalMessage({ type: 'error', text: res?.message || 'خطا در ثبت درخواست.' });
      }
    } catch (err) {
      setModalMessage({ type: 'error', text: 'خطای سرور: ' + err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/rewards"
              className="text-xs font-bold text-gray-500 hover:text-[#59BBAF] flex items-center gap-1 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>بازگشت به سوابق پاداش‌ها</span>
            </Link>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#202A5A] dark:text-white">
            ویترین جوایز و پاداش‌ها
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            توکن‌های کسب‌شده خود را برای دریافت جوایز ارزنده خرج کنید
          </p>
        </div>

        {/* Current Balance Pill */}
        <div className="flex items-center gap-3 p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-amber-50 dark:bg-[#57390A]/30 border-2 border-amber-300 dark:border-amber-700/60 shadow-[2px_2px_0_#F8A41D]">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">
              موجودی توکن شما
            </span>
            <span className="text-base sm:text-lg font-black text-amber-900 dark:text-amber-100">
              {toPersianDigits(currentUserTokens)} توکن
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-56 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <RokadCard className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-[#202A5A] dark:text-white mb-2">{error}</h4>
          <RokadButton onClick={fetchCatalog} variant="primary" size="sm">تلاش مجدد</RokadButton>
        </RokadCard>
      ) : (
        <div className="space-y-8">
          {Object.entries(rewardsByCategory).map(([categoryName, items]) => (
            <div key={categoryName} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-800">
                <Gift className="w-5 h-5 text-[#59BBAF]" />
                <h3 className="text-base sm:text-lg font-black text-[#202A5A] dark:text-white">
                  {categoryName}
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                  {toPersianDigits(items.length)} پاداش
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((reward) => {
                  const hasEnough = currentUserTokens >= (reward.minToken || 0);

                  return (
                    <RokadCard
                      key={reward.id || reward._id}
                      className="flex flex-col justify-between p-5 space-y-4 relative overflow-hidden"
                    >
                      <div className="space-y-2.5">
                        {/* Token Tag & Icon */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="w-12 h-12 rounded-2xl bg-[#EEF8F7] dark:bg-[#1F413D]/40 border border-[#59BBAF]/30 flex items-center justify-center text-[#59BBAF]">
                            {categoryName.includes('نیکوکارانه') ? (
                              <HeartHandshake className="w-6 h-6 text-rose-500" />
                            ) : (
                              <Gift className="w-6 h-6" />
                            )}
                          </div>

                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-[#57390A]/40 text-amber-700 dark:text-amber-300 border border-amber-300/40 text-xs font-black">
                            <Coins className="w-3.5 h-3.5 text-amber-500" />
                            <span>
                              {reward.minToken === reward.maxToken
                                ? `${toPersianDigits(reward.minToken)} توکن`
                                : `${toPersianDigits(reward.minToken)} تا ${toPersianDigits(reward.maxToken)} توکن`}
                            </span>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="text-sm sm:text-base font-black text-[#202A5A] dark:text-white line-clamp-1">
                            {reward.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {reward.description || 'پاداش ارزشمند ثبت‌شده در سامانه هنرستان.'}
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <span className={`text-[11px] font-bold ${hasEnough ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                          {hasEnough ? 'موجودی کافی' : 'کسری توکن'}
                        </span>
                        <RokadButton
                          onClick={() => handleOpenClaimModal(reward)}
                          variant={hasEnough ? 'primary' : 'outline'}
                          size="sm"
                          disabled={!hasEnough}
                        >
                          دریافت این پاداش
                        </RokadButton>
                      </div>
                    </RokadCard>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claim Confirmation Modal */}
      <RokadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="دریافت پاداش"
        subtitle={selectedReward?.name}
        maxWidth="max-w-md"
      >
        {modalMessage && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs font-bold text-center border ${
              modalMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {modalMessage.text}
          </div>
        )}

        <form onSubmit={handleClaimSubmit} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#1C2536] border border-gray-200 dark:border-gray-700 space-y-2 text-xs">
            <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
              <span>موجودی فعلی شما:</span>
              <span className="font-bold text-[#202A5A] dark:text-white">
                {toPersianDigits(currentUserTokens)} توکن
              </span>
            </div>
            <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
              <span>حداقل توکن پاداش:</span>
              <span className="font-bold text-amber-600">
                {toPersianDigits(selectedReward?.minToken || 0)} توکن
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#202A5A] dark:text-gray-300 mb-1.5">
              تعداد توکن پرداختی <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              min={selectedReward?.minToken || 1}
              max={selectedReward?.maxToken || currentUserTokens}
              required
              className="rokad-input text-center text-base font-black"
            />
            {selectedReward?.minToken !== selectedReward?.maxToken && (
              <p className="mt-1 text-[11px] text-gray-400">
                می‌توانید بین {toPersianDigits(selectedReward?.minToken || 0)} تا {toPersianDigits(selectedReward?.maxToken || 0)} توکن اختصاص دهید.
              </p>
            )}
          </div>

          <div className="pt-2 flex gap-3">
            <RokadButton
              type="submit"
              variant="primary"
              loading={submitting}
              className="flex-1"
            >
              تایید و دریافت پاداش
            </RokadButton>
            <RokadButton
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              انصراف
            </RokadButton>
          </div>
        </form>
      </RokadModal>
    </div>
  );
}