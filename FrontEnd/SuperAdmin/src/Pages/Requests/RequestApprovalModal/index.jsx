import React, { useState, useEffect } from 'react';
import RokadModal from '../../../Components/UI/RokadModal';
import RokadButton from '../../../Components/UI/RokadButton';
import { formatToJalali, toPersianDigits } from '../../../Utils/utils';
import { CheckCircle2, XCircle, ChevronDown, User, Tag } from 'lucide-react';

export default function RequestApprovalModal({
  isOpen,
  onClose,
  requestData,
  onApprove,
  onReject,
  submitting = false
}) {
  const [points, setPoints] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [error, setError] = useState('');
  const [selectedDetails, setSelectedDetails] = useState('');

  useEffect(() => {
    if (isOpen && requestData) {
      const scoreDef = requestData.activityDefinition?.scoreDefinition;
      let initialPoints = '';
      let initialDetails = requestData.details || '';

      if (scoreDef?.inputType === 'select_from_enum' && requestData.details) {
        const matchingOption = scoreDef.enumOptions?.find(opt => opt.label === requestData.details);
        if (matchingOption) {
          initialPoints = String(matchingOption.value);
        }
      } else if (requestData.scoreAwarded != null) {
        initialPoints = String(requestData.scoreAwarded);
      }

      setPoints(initialPoints);
      setSelectedDetails(initialDetails);
      setAdminComment(requestData.adminComment || '');
      setError('');
    }
  }, [isOpen, requestData]);

  if (!isOpen || !requestData) return null;

  const handleApproveClick = () => {
    setError('');
    const scoreToAward = parseFloat(points);
    if (points === '' || isNaN(scoreToAward)) {
      setError('لطفاً امتیاز معتبری را وارد یا انتخاب کنید.');
      return;
    }
    onApprove(requestData.id || requestData._id, scoreToAward, adminComment, selectedDetails);
  };

  const handleRejectClick = () => {
    setError('');
    if (!adminComment.trim()) {
      setError('لطفاً دلیل رد درخواست را در بخش توضیحات بنویسید تا به اطلاع دانش‌آموز برسد.');
      return;
    }
    onReject(requestData.id || requestData._id, adminComment);
  };

  const scoreDef = requestData.activityDefinition?.scoreDefinition;
  const isEnum = scoreDef?.inputType === 'select_from_enum' && Array.isArray(scoreDef.enumOptions);

  return (
    <RokadModal
      isOpen={isOpen}
      onClose={onClose}
      title="بررسی درخواست فعالیت"
      subtitle={`${requestData.studentName} • ${requestData.activityName || requestData.activityTitle}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-600 dark:text-rose-400 text-center">
            {error}
          </div>
        )}

        {/* Student & Activity Info Box */}
        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#1C2536] border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">دانش‌آموز:</span>
            <span className="font-bold text-[#202A5A] dark:text-white">
              {requestData.studentName} (کلاس {toPersianDigits(requestData.studentClass || '')})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">دسته‌بندی:</span>
            <span className="font-bold text-[#59BBAF]">
              {requestData.activityParent || requestData.activityDefinition?.parent}
            </span>
          </div>
          {requestData.details && (
            <div className="pt-2 border-t border-gray-200/60 dark:border-gray-700">
              <span className="text-gray-500 block mb-0.5">مقدار / جزئیات ارسالی:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {requestData.details}
              </span>
            </div>
          )}
          {requestData.description && (
            <div className="pt-2 border-t border-gray-200/60 dark:border-gray-700">
              <span className="text-gray-500 block mb-0.5">توضیحات دانش‌آموز:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {requestData.description}
              </span>
            </div>
          )}
        </div>

        {/* Score Selection or Manual Entry */}
        {isEnum ? (
          <div>
            <label className="block text-xs font-bold text-[#202A5A] dark:text-gray-300 mb-1.5">
              انتخاب سطح و امتیاز <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedDetails}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedDetails(val);
                  const opt = scoreDef.enumOptions.find(o => o.label === val);
                  if (opt) setPoints(String(opt.value));
                }}
                className="rokad-input pr-3 pl-8 appearance-none cursor-pointer"
              >
                <option value="" disabled>-- انتخاب سطح فعالیت --</option>
                {scoreDef.enumOptions.map((opt, i) => (
                  <option key={i} value={opt.label}>
                    {opt.label} ({toPersianDigits(opt.value)} امتیاز)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-[#202A5A] dark:text-gray-300 mb-1.5">
              امتیاز اعطایی <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="مثلاً: 25"
              className="rokad-input text-center text-base font-black"
            />
          </div>
        )}

        {/* Admin Feedback */}
        <div>
          <label className="block text-xs font-bold text-[#202A5A] dark:text-gray-300 mb-1.5">
            بازخورد و توضیحات دبیر / معاونت
          </label>
          <textarea
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            rows={2}
            placeholder="در صورت تایید تشویق، یا در صورت رد دلیل را ذکر کنید..."
            className="rokad-input resize-none"
          />
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center gap-3">
          <RokadButton
            variant="primary"
            onClick={handleApproveClick}
            loading={submitting}
            icon={CheckCircle2}
            className="flex-1"
          >
            تایید و ثبت امتیاز
          </RokadButton>

          <RokadButton
            variant="danger"
            onClick={handleRejectClick}
            loading={submitting}
            icon={XCircle}
          >
            رد درخواست
          </RokadButton>
        </div>
      </div>
    </RokadModal>
  );
}