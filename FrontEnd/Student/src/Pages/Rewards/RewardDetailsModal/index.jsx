import React from 'react';
import RokadModal from '../../../Components/UI/RokadModal';
import RokadBadge from '../../../Components/UI/RokadBadge';
import { formatToJalali, toPersianDigits } from '../../../Utils/utils';
import { Coins, Calendar, Gift, Tag } from 'lucide-react';

export default function RewardDetailsModal({ isOpen, onClose, reward }) {
  if (!isOpen || !reward) return null;

  const renderField = (label, value, icon = null) => (
    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#1C2536] border border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-xs sm:text-sm font-bold text-[#202A5A] dark:text-white break-words">
        {value || <span className="text-gray-400 font-normal italic">ثبت نشده</span>}
      </div>
    </div>
  );

  const getStatusBadge = (status) => {
    if (status === 'approved' || status === 'پرداخت شده') return <RokadBadge variant="approved" label="تحویل داده شده" />;
    if (status === 'pending' || status === 'در انتظار پرداخت') return <RokadBadge variant="pending" label="در انتظار بررسی/تحویل" />;
    return <RokadBadge variant="rejected" label="رد شده" />;
  };

  return (
    <RokadModal
      isOpen={isOpen}
      onClose={onClose}
      title="جزئیات درخواست پاداش"
      subtitle={reward.title || reward.name}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Status and Token Row */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FEF6E8] dark:bg-[#57390A]/30 border border-[#F8A41D]/30">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">وضعیت درخواست:</span>
            {getStatusBadge(reward.status)}
          </div>
          <div className="text-left">
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">توکن کسر شده:</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">
              {toPersianDigits(reward.token || reward.points || 0)} توکن
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {renderField("عنوان پاداش", reward.title || reward.name, <Gift className="w-3.5 h-3.5" />)}
          {renderField("دسته‌بندی", reward.parent || reward.category || 'پاداش‌های عمومی', <Tag className="w-3.5 h-3.5" />)}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {renderField("تاریخ ثبت درخواست", formatToJalali(reward.submissionDate || reward.createdAt), <Calendar className="w-3.5 h-3.5" />)}
          {renderField("تاریخ بررسی", formatToJalali(reward.paymentDate || reward.updatedAt), <Calendar className="w-3.5 h-3.5" />)}
        </div>
      </div>
    </RokadModal>
  );
}