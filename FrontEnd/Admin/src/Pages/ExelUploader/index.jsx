import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, FileCheck, Info } from 'lucide-react';
import RokadCard from '../../Components/UI/RokadCard';
import RokadButton from '../../Components/UI/RokadButton';
import { toPersianDigits } from '../../Utils/utils';

function ExcelUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      alert('لطفاً فقط فایل‌های اکسل معتبر با پسوند xlsx یا xls را انتخاب کنید.');
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

    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('excelFile', file, file.name);

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5005/api/';
      const response = await axios.post(`${baseUrl}users/register/excel`, formData, {
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
          'خطا در آپلود فایل. لطفاً ساختار اکسل را بررسی کرده و مجدداً تلاش فرمایید.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <RokadCard
        title="ثبت‌نام گروهی هنرآموزان از طریق اکسل"
        subtitle="بارگذاری پرونده اکسل برای ایجاد سریع حساب‌های کاربری دانش‌آموزان"
        badge="ورود داده"
        persona="college"
      >
        {/* Instructions Alert */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F8A41D]/10 border-2 border-[#F8A41D] text-xs leading-relaxed text-[#202A5A] dark:text-[#F8A41D] mb-6">
          <Info className="w-5 h-5 shrink-0 text-[#F8A41D] mt-0.5" />
          <div>
            <p className="font-bold mb-1">راهنمای بارگذاری اکسل:</p>
            <p>
              فایل اکسل ارسالی باید شامل ستون‌های کد ملی، نام و نام‌خانوادگی، شماره تماس، پایه تحصیلی و کلاس باشد. حداکثر حجم مجاز ۱۰ مگابایت است.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drag & Drop Upload Box */}
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
              id="excel-file-input"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />

            <div className="w-14 h-14 rounded-2xl bg-[#59BBAF]/20 text-[#59BBAF] flex items-center justify-center rokad-shadow">
              {file ? <FileCheck className="w-7 h-7" /> : <UploadCloud className="w-7 h-7" />}
            </div>

            <div>
              <p className="font-bold text-sm text-gray-800 dark:text-white">
                {file ? file.name : 'فایل اکسل خود را اینجا بکشید یا کلیک کنید'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {file
                  ? `حجم فایل: ${toPersianDigits((file.size / 1024).toFixed(1))} کیلوبایت`
                  : 'پشتیبانی از فرمت‌های XLSX و XLS'}
              </p>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {loading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-300">
                <span>در حال ارسال فایل...</span>
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
              {loading ? 'در حال ثبت اطلاعات...' : 'شروع آپلود و ثبت‌نام گروهی'}
            </RokadButton>
          </div>
        </form>

        {/* Results Card */}
        {result && (
          <div
            className={`mt-6 p-5 rounded-xl border-2 rokad-shadow ${
              result.success
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-500 text-rose-900 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2 font-bold text-sm">
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{result.message}</span>
            </div>

            {result.insertedCount !== undefined && (
              <p className="text-xs font-semibold mt-1">
                تعداد کاربران با موفقیت افزوده شده:{' '}
                <span className="font-bold underline">{toPersianDigits(result.insertedCount)} نفر</span>
              </p>
            )}

            {result.errorCount > 0 && result.errors && (
              <div className="mt-3 pt-3 border-t border-rose-200 dark:border-rose-800 text-xs">
                <h4 className="font-bold mb-1.5 text-rose-700 dark:text-rose-400">
                  خطاهای شناسایی‌شده ({toPersianDigits(result.errorCount)} مورد):
                </h4>
                <ul className="list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
                  {result.errors.map((err, i) => (
                    <li key={i} className="text-rose-800 dark:text-rose-300 font-medium">
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </RokadCard>
    </div>
  );
}

export default ExcelUpload;