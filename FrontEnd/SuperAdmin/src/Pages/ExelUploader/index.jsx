import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, FileCheck, Info, UserPlus } from 'lucide-react';
import RokadCard from '../../Components/UI/RokadCard';
import RokadButton from '../../Components/UI/RokadButton';
import { toPersianDigits } from '../../Utils/utils';

export default function ExcelUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      alert('لطفاً فقط فایل‌های اکسل با پسوند xlsx یا xls را انتخاب فرمایید.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('حجم فایل باید کمتر از ۱۰ مگابایت باشد.');
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setErrors([]);
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
    if (!file) {
      setErrors(['لطفاً ابتدا یک فایل اکسل انتخاب کنید.']);
      return;
    }

    const formData = new FormData();
    formData.append('excelFile', file, file.name);

    try {
      setLoading(true);
      setErrors([]);
      setUploadProgress(0);
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5005/api/';
      const response = await axios.post(`${baseUrl}exel/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
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

      if (response.data && response.data.success) {
        setResult(response.data);
      } else {
        setErrors([response.data?.message || 'خطای نامشخص از سمت سرور']);
      }
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setErrors([error.response.data.message]);
      } else {
        setErrors(['خطا در آپلود فایل اکسل. لطفاً ساختار داده‌ها را بررسی فرمایید.']);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <RokadCard
        title="ثبت‌نام گروهی کاربران (هنرآموزان و مدیران)"
        subtitle="ایجاد خودکار حساب‌های کاربری، کلاس‌بندی و تخصیص نقش‌ها با اکسل"
        badge="کاربران"
        persona="college"
      >
        {/* Format guide box */}
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 text-xs space-y-3 mb-6">
          <div className="flex items-center gap-2 font-bold text-[#202A5A] dark:text-[#59BBAF]">
            <Info className="w-4 h-4 text-[#F8A41D]" />
            <span>راهنمای ساختار و نام ستون‌های فایل اکسل:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 dark:text-gray-300">
            <div>
              <p className="font-bold">ستون‌های اجباری:</p>
              <p className="font-mono text-[11px] text-[#E0195B]">idCode , fullName , role</p>
            </div>
            <div>
              <p className="font-bold">ستون‌های اختیاری:</p>
              <p className="font-mono text-[11px] text-[#59BBAF]">fieldOfStudy , grade , class , score</p>
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-[11px]">
            * رمز عبور پیش‌فرض برای دانش‌آموز <code className="bg-gray-200 dark:bg-white/10 px-1 rounded">s+کدملی</code> و برای مدیر <code className="bg-gray-200 dark:bg-white/10 px-1 rounded">a+کدملی</code> تنظیم می‌شود.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drag & Drop File Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 relative ${
              dragActive
                ? 'border-[#59BBAF] bg-[#59BBAF]/10 scale-[1.01]'
                : file
                ? 'border-[#202A5A] dark:border-[#59BBAF] bg-white dark:bg-[#151D2A]'
                : 'border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 hover:border-[#202A5A] dark:hover:border-[#59BBAF]'
            }`}
          >
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />

            <div className="w-14 h-14 rounded-2xl bg-[#F8A41D]/15 text-[#F8A41D] flex items-center justify-center rokad-shadow">
              {file ? <FileCheck className="w-7 h-7" /> : <UploadCloud className="w-7 h-7" />}
            </div>

            <div>
              <p className="font-bold text-sm text-gray-800 dark:text-white">
                {file ? file.name : 'فایل اکسل کاربران را اینجا رها کنید یا کلیک کنید'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {file
                  ? `حجم فایل: ${toPersianDigits((file.size / 1024).toFixed(1))} کیلوبایت`
                  : 'پشتیبانی از فرمت‌های استاندارد اکسل (XLSX, XLS)'}
              </p>
            </div>
          </div>

          {/* Upload Progress */}
          {loading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-300">
                <span>در حال بارگذاری و بررسی ساختار...</span>
                <span>%{toPersianDigits(uploadProgress)}</span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden border border-[#202A5A] dark:border-white/20">
                <div
                  className="h-full bg-[#59BBAF] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex justify-end">
            <RokadButton
              type="submit"
              disabled={loading || !file}
              variant="primary"
              className="w-full sm:w-auto px-8"
            >
              {loading ? 'در حال ثبت کاربران...' : 'بارگذاری و شروع ثبت‌نام'}
            </RokadButton>
          </div>
        </form>

        {/* Success Results Card */}
        {result && (
          <div className="mt-6 p-5 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 rokad-shadow space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{result.message || 'عملیات با موفقیت انجام شد'}</span>
            </div>
            {result.insertedCount !== undefined && (
              <p className="text-xs font-bold">
                تعداد رکوردهای افزوده شده: {toPersianDigits(result.insertedCount)} نفر
              </p>
            )}
          </div>
        )}

        {/* Error List */}
        {errors.length > 0 && (
          <div className="mt-6 p-5 rounded-xl border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300 rokad-shadow space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>خطا در ثبت اطلاعات ({toPersianDigits(errors.length)} مورد):</span>
            </div>
            <ul className="list-disc list-inside text-xs space-y-1 max-h-48 overflow-y-auto">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </RokadCard>
    </div>
  );
}