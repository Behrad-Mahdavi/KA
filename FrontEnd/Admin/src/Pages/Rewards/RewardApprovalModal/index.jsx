import React, { useMemo } from 'react';
import RokadModal from '../../../Components/UI/RokadModal';
import RokadButton from '../../../Components/UI/RokadButton';
import { formatToJalali, toPersianDigits } from '../../../Utils/utils';
import { CheckCircle2, XCircle, Gift, Coins, Calendar, User } from 'lucide-react';

export default function RewardApprovalModal({ isOpen, onClose, rewardData, onConfirm, submitting = false }) {
  const paymentApprovalDate = useMemo(() => formatToJalali(new Date(), { showMonthName: true, includeDayName: true }), [isOpen]);

  if (!isOpen || !rewardData) return null;

  return (
    <RokadModal
      isOpen={isOpen}
      onClose={onClose}
      title="بررسی و تایید تحویل پاداش"
      subtitle={rewardData.rewardTitle || rewardData.title}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Info Grid */}
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1C2536] border border-gray-100 dark:border-gray-800 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">دانش‌آموز:</span>
            <span className="font-bold text-[#202A5A] dark:text-white">
              {rewardData.userName || rewardData.name} ({rewardData.userGrade ? `پایه ${rewardData.userGrade}` : 'دانش‌آموز'})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">پاداش انتخابی:</span>
            <span className="font-bold text-[#59BBAF]">
              {rewardData.rewardTitle || rewardData.title}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">ارزش توکن:</span>
            <span className="font-black text-amber-600 dark:text-amber-400">
              {toPersianDigits(rewardData.tokenAmountRequired || rewardData.tokenAmount || 0)} توکن
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 dark:border-gray-700">
            <span className="text-gray-500">تاریخ ثبت درخواست:</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {rewardData.submissionDate || 'نامشخص'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">تاریخ بررسی (امروز):</span>
            <span className="font-bold text-[#202A5A] dark:text-white">
              {paymentApprovalDate}
            </span>
          </div>
        </div>

        {/* Note */}
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
          تایید این درخواست به منزله تحویل فیزیکی یا فعال‌سازی جایزه برای دانش‌آموز است. در صورت رد، توکن‌های کسر شده بلافاصله به حساب دانش‌آموز مسترد خواهد شد.
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center gap-3">
          <RokadButton
            variant="primary"
            onClick={() => onConfirm(rewardData.studentRewardId || rewardData.id, 'approved')}
            loading={submitting}
            icon={CheckCircle2}
            className="flex-1"
          >
            تایید و ثبت تحویل پاداش
          </RokadButton>

          <RokadButton
            variant="danger"
            onClick={() => onConfirm(rewardData.studentRewardId || rewardData.id, 'rejected')}
            loading={submitting}
            icon={XCircle}
          >
            رد و بازگشت توکن
          </RokadButton>
        </div>
      </div>
    </RokadModal>
  );
}