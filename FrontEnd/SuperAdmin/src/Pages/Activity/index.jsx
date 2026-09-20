import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, FileCheck, CheckCircle2, AlertTriangle, Info, ListPlus } from 'lucide-react';
import RokadCard from '../../Components/UI/RokadCard';
import RokadButton from '../../Components/UI/RokadButton';
import { toPersianDigits } from '../../Utils/utils';

export default function ActivityExcelUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      alert('لطفاً فقط فایل‌های اکسل (xlsx یا xls) را بارگذاری فرمایید.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('حجم فایل باید کمتر از ۱۰ مگابایت باشد.');
      return;
    }

    setFile(selectedFile);
    setResult(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('excelFile', file, file.name);

    try {
      setLoading(true);
      setUploadProgress(0);
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5005/api/';
      const response = await axios.post(`${baseUrl}exel/activity`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'X-Requested-With': 'XMLHttpRequest',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message);
      setResult({
        success: false,
        message:
          error.response?.data?.message ||
          'خطا در بارگذاری فایل فعالیت‌ها. لطفاً ستون‌ها و مقادیر را بازبینی فرمایید.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <RokadCard
        title="بارگذاری دسته‌جمعی تعاریف فعالیت‌ها"
        subtitle="ایجاد یا بروزرسانی انواع فعالیت‌های آموزشی، شغلی و داوطلبانه از طریق فایل اکسل"
        badge="فعالیت‌ها"
        persona="female"
      >
        {/* Guide Box */}
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 text-xs space-y-3 mb-6">
          <div className="flex items-center gap-2 font-bold text-[#202A5A] dark:text-[#59BBAF]">
            <Info className="w-4 h-4 text-[#E0195B]" />
            <span>راهنمای ساختار اکسل فعالیت‌ها:</span>
          </div>
          <div className="space-y-1.5 text-gray-600 dark:text-gray-300">
            <p>
              <strong className="text-gray-900 dark:text-white">ستون‌های ضروری:</strong>{' '}
              <code className="bg-gray-200 dark:bg-white/10 px-1 rounded text-[#E0195B]">parent</code> (دسته‌بندی والد) و{' '}
              <code className="bg-gray-200 dark:bg-white/10 px-1 rounded text-[#E0195B]">name</code> (عنوان فعالیت)
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">ستون اختیاری:</strong>{' '}
              <code className="bg-gray-200 dark:bg-white/10 px-1 rounded text-[#59BBAF]">description</code> (توضیحات تکمیلی)
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 pt-1">
              مقادیر مجاز ستون parent: «فعالیت‌های آموزشی»، «فعالیت‌های شغلی»، «فعالیت‌های داوطلبانه و توسعه فردی»
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 relative ${
              dragActive
                ? 'border-[#E0195B] bg-[#E0195B]/10 scale-[1.01]'
                : file
                ? 'border-[#202A5A] dark:border-[#59BBAF] bg-white dark:bg-[#151D2A]'
                : 'border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 hover:border-[#E0195B]'
            }`}
          >
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />

            <div className="w-14 h-14 rounded-2xl bg-[#E0195B]/15 text-[#E0195B] flex items-center justify-center rokad-shadow">
              {file ? <FileCheck className="w-7 h-7" /> : <UploadCloud className="w-7 h-7" />}
            </div>

            <div>
              <p className="font-bold text-sm text-gray-800 dark:text-white">
                {file ? file.name : 'فایل اکسل فعالیت‌ها را اینجا رها کنید یا کلیک کنید'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {file
                  ? `حجم فایل: ${toPersianDigits((file.size / 1024).toFixed(1))} کیلوبایت`
                  : 'پشتیبانی از فرمت‌های XLSX و XLS (حداکثر ۱۰ مگابایت)'}
              </p>
            </div>
          </div>

          {/* Upload Progress */}
          {loading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-300">
                <span>در حال بارگذاری فایل...</span>
                <span>%{toPersianDigits(uploadProgress)}</span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden border border-[#202A5A] dark:border-white/20">
                <div
                  className="h-full bg-[#E0195B] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <RokadButton
              type="submit"
              disabled={loading || !file}
              variant="primary"
              className="w-full sm:w-auto px-8"
            >
              {loading ? 'در حال پردازش...' : 'بارگذاری و ذخیره فعالیت‌ها'}
            </RokadButton>
          </div>
        </form>

        {/* Status Feedback */}
        {result && (
          <div
            className={`mt-6 p-5 rounded-xl border-2 rokad-shadow ${
              result.success
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-500 text-rose-900 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{result.message || (result.success ? 'فعالیت‌ها با موفقیت ثبت شدند' : 'خطا در ثبت داده‌ها')}</span>
            </div>
          </div>
        )}
      </RokadCard>
    </div>
  );
}