import React from 'react';
import RokadModal from '../../../Components/UI/RokadModal';
import RokadBadge from '../../../Components/UI/RokadBadge';
import { formatToJalali, toPersianDigits } from '../../../Utils/utils';
import { Calendar, Award, MessageSquare, Tag } from 'lucide-react';

export default function ActivityDetailsModal({ isOpen, onClose, activity }) {
  if (!isOpen || !activity) return null;

  const renderField = (label, value, icon = null) => (
    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#1C2536] border border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-xs sm:text-sm font-bold text-[#202A5A] dark:text-white whitespace-pre-wrap">
        {value || <span className="text-gray-400 font-normal italic">ثبت نشده</span>}
      </div>
    </div>
  );

  const getBadgeVariant = (status) => {
    if (status === 'approved' || status === 'ثبت توسط ادمین') return 'approved';
    if (status === 'pending') return 'pending';
    return 'rejected';
  };

  return (
    <RokadModal
      isOpen={isOpen}
      onClose={onClose}
      title="جزئیات فعالیت ثبت‌شده"
      subtitle={activity.activityName}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Status and Score Row */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EEF8F7] dark:bg-[#1F413D]/30 border border-[#59BBAF]/30">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">وضعیت تایید:</span>
            <RokadBadge
              variant={getBadgeVariant(activity.status)}
              label={activity.status === 'ثبت توسط ادمین' ? 'ثبت توسط دبیر/ادمین' : undefined}
            />
          </div>
          <div className="text-left">
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">امتیاز کسب‌شده:</span>
            <span className="text-lg font-black text-[#59BBAF]">
              +{toPersianDigits(activity.scoreAwarded || 0)} امتیاز
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {renderField("عنوان فعالیت", activity.activityName, <Tag className="w-3.5 h-3.5" />)}
          {renderField("تاریخ ثبت", formatToJalali(activity.submissionDate), <Calendar className="w-3.5 h-3.5" />)}
        </div>

        {/* Input Details */}
        {renderField("جزئیات / مقدار وارد شده", activity.details)}

        {/* Student Description if exists */}
        {activity.description && renderField("توضیحات دانش‌آموز", activity.description)}

        {/* Admin Feedback / Comment */}
        {activity.adminComment && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400 mb-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>نظر و بازخورد ادمین / مدرسه:</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 font-medium">
              {activity.adminComment}
            </p>
          </div>
        )}
      </div>
    </RokadModal>
  );
}