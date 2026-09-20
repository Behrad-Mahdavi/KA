import React, { useState, useEffect, useMemo } from 'react';
import fetchData from '../../../Utils/fetchData';
import RokadModal from '../../../Components/UI/RokadModal';
import RokadButton from '../../../Components/UI/RokadButton';
import { formatToJalali } from '../../../Utils/utils';
import { ChevronDown, Plus } from 'lucide-react';

const INITIAL_FORM_DATA = {
  activityCategory: '',
  activityTitle: '',
  details: '',
  studentDescription: '',
};

export default function AddActivityModal({ isOpen, onClose, onSubmit, token }) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [internalActivityCategories, setInternalActivityCategories] = useState([]);
  const [loadingInternalCategories, setLoadingInternalCategories] = useState(false);
  const [availableActivityTitles, setAvailableActivityTitles] = useState([]);
  const [loadingActivityTitles, setLoadingActivityTitles] = useState(false);
  const [selectedActivityFullDetails, setSelectedActivityFullDetails] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submissionDate = useMemo(() => formatToJalali(new Date(), { showMonthName: true, includeDayName: true }), []);

  useEffect(() => {
    const fetchAndFilterCategories = async () => {
      if (isOpen && token && internalActivityCategories.length === 0) {
        setLoadingInternalCategories(true);
        setError('');
        try {
          const response = await fetchData('admin-activity/distinct/parents', {
            headers: { authorization: `Bearer ${token}` }
          });
          if (response.success && Array.isArray(response.data)) {
            const allowedCategories = [
              "فعالیت‌های شغلی",
              "فعالیت‌های داوطلبانه و توسعه فردی"
            ];
            const filteredCategories = response.data.filter(cat => allowedCategories.includes(cat));
            setInternalActivityCategories(filteredCategories);
          } else {
            setError(response.message || "خطا در دریافت دسته‌بندی‌ها");
          }
        } catch (err) {
          setError("خطای ارتباط با سرور: " + (err.message || "خطای ناشناخته"));
        } finally {
          setLoadingInternalCategories(false);
        }
      }
    };
    fetchAndFilterCategories();
  }, [isOpen, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'activityCategory') {
      setFormData(prev => ({ ...prev, activityTitle: '', details: '', studentDescription: '' }));
      setSelectedActivityFullDetails(null);
      setAvailableActivityTitles([]);

      if (value) {
        setLoadingActivityTitles(true);
        fetchData(`activity/by-parent/${encodeURIComponent(value)}`, {
          headers: { authorization: `Bearer ${token}` }
        })
          .then(res => {
            if (res.success && Array.isArray(res.data)) {
              setAvailableActivityTitles(res.data);
            }
          })
          .catch(err => console.error(err))
          .finally(() => setLoadingActivityTitles(false));
      }
    }

    if (name === 'activityTitle') {
      const selected = availableActivityTitles.find(a => (a.id || a._id) === value);
      setSelectedActivityFullDetails(selected || null);
      setFormData(prev => ({ ...prev, details: '' }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.activityCategory || !formData.activityTitle) {
      setError('لطفاً دسته‌بندی و عنوان فعالیت را انتخاب کنید.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      activityId: formData.activityTitle,
      details: formData.details,
      description: formData.studentDescription,
    };

    try {
      const response = await fetchData('student-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (response.success) {
        if (onSubmit) onSubmit(response.data);
        onClose();
        setFormData(INITIAL_FORM_DATA);
      } else {
        setError(response.message || "خطا در ثبت فعالیت.");
      }
    } catch (err) {
      setError("خطای سرور: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderDynamicValueInput = () => {
    if (!selectedActivityFullDetails || !selectedActivityFullDetails.valueInput || selectedActivityFullDetails.valueInput.type === 'none') {
      return null;
    }

    const { type, label, required, numberMin, numberMax } = selectedActivityFullDetails.valueInput;
    const optionsForSelect = selectedActivityFullDetails.scoreDefinition?.inputType === 'select_from_enum'
      ? selectedActivityFullDetails.scoreDefinition.enumOptions
      : [];

    return (
      <div>
        <label className="block text-xs font-bold text-[#202A5A] dark:text-gray-300 mb-1.5">
          {label || 'جزئیات/مقدار'} {required && <span className="text-rose-500">*</span>}
        </label>
        {type === 'select' ? (
          <div className="relative">
            <select
              name="details"
              value={formData.details}
              onChange={handleChange}
              required={required}
              className="rokad-input pr-3 pl-8 appearance-none cursor-pointer"
            >
              <option value="" disabled>-- {label || "یک گزینه انتخاب کنید"} --</option>
              {Array.isArray(optionsForSelect) && optionsForSelect.map((opt, idx) => (
                <option key={idx} value={opt.label}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        ) : (
          <input
            type={type === 'number' ? 'number' : 'text'}
            name="details"
            value={formData.details}
            onChange={handleChange}
            placeholder={label || "مقدار را وارد کنید..."}
            required={required}
            min={type === 'number' && numberMin !== undefined ? numberMin : undefined}
            max={type === 'number' && numberMax !== undefined ? numberMax : undefined}
            className="rokad-input"
          />
        )}
        {selectedActivityFullDetails.description && (
          <p className="mt-1 text-xs text-gray-400">{selectedActivityFullDetails.description}</p>
        )}
      </div>
    );
  };

  return (
    <RokadModal
      isOpen={isOpen}
      onClose={onClose}
      title="ثبت فعالیت و دستاورد جدید"
      subtitle="فعالیت مورد نظر را انتخاب و مشخصات را تکمیل کنید"
      maxWidth="max-w-lg"
    >
      {error && (
        <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-600 dark:text-rose-400 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Date Display */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
            تاریخ ثبت درخواست
          </label>
          <div className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1C2536] border border-gray-200 dark:border-gray-700 text-xs font-bold text-[#202A5A] dark:text-gray-300">
            {submissionDate}
          </div>
        </div>

        {/* Category Select */}
        <div>
          <label className="block text-xs font-bold text-[#202A5A] dark:text-gray-300 mb-1.5">
            دسته‌بندی فعالیت <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              name="activityCategory"
              value={formData.activityCategory}
              onChange={handleChange}
              required
              disabled={loadingInternalCategories}
              className="rokad-input pr-3 pl-8 appearance-none cursor-pointer"
            >
              <option value="" disabled>{loadingInternalCategories ? "در حال دریافت..." : "انتخاب دسته‌بندی..."}</option>
              {internalActivityCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Activity Title Select */}
        <div>
          <label className="block text-xs font-bold text-[#202A5A] dark:text-gray-300 mb-1.5">
            عنوان فعالیت <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              name="activityTitle"
              value={formData.activityTitle}
              onChange={handleChange}
              required
              disabled={!formData.activityCategory || loadingActivityTitles}
              className="rokad-input pr-3 pl-8 appearance-none cursor-pointer"
            >
              <option value="" disabled>
                {loadingActivityTitles ? "در حال دریافت عناوین..." : !formData.activityCategory ? "ابتدا دسته‌بندی را انتخاب کنید" : "انتخاب عنوان فعالیت..."}
              </option>
              {availableActivityTitles.map(act => (
                <option key={act.id || act._id} value={act.id || act._id}>{act.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Dynamic Value Input */}
        {renderDynamicValueInput()}

        {/* Student Description */}
        <div>
          <label className="block text-xs font-bold text-[#202A5A] dark:text-gray-300 mb-1.5">
            توضیحات تکمیلی (اختیاری)
          </label>
          <textarea
            name="studentDescription"
            value={formData.studentDescription}
            onChange={handleChange}
            rows={3}
            placeholder="در صورت وجود لینک پروژه، توضیحات تکمیلی و..."
            className="rokad-input resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <RokadButton
            type="submit"
            variant="primary"
            loading={submitting}
            icon={Plus}
            className="w-full"
          >
            {submitting ? "در حال ارسال..." : "ثبت و ارسال فعالیت"}
          </RokadButton>
        </div>
      </form>
    </RokadModal>
  );
}