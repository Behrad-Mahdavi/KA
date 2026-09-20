import React, { useContext, useState } from 'react';
import useFormFields from '../../Utils/useFormFields';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Utils/AuthContext';
import { useTheme } from '../../Utils/ThemeContext';
import fetchData from '../../Utils/fetchData';
import RokadCard from '../../Components/UI/RokadCard';
import RokadButton from '../../Components/UI/RokadButton';
import {
  GraduationCap,
  Sparkles,
  Lock,
  User,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ArrowLeft
} from 'lucide-react';

export default function StudentLogin() {
  const [fields, handleChange] = useFormFields();
  const { handleAuth } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetchData('auth', {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(fields)
      });

      if (res?.data?.user?.role !== "student") {
        toast.error("این پنل مختص ورود دانش‌آموزان است.");
        return;
      }

      if (res.success && res?.data?.token) {
        toast.success(res.message || "ورود با موفقیت انجام شد");
        handleAuth(res.data.token, res.data.user);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate('/');
      } else {
        toast.error(res.message || "کد ملی یا رمز عبور اشتباه است");
      }
    } catch (error) {
      toast.error("خطا در برقراری ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F8F9FA] dark:bg-[#0B0F17] transition-colors relative">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-1/4 -right-20 w-72 h-72 bg-[#59BBAF]/15 dark:bg-[#59BBAF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-[#202A5A]/10 dark:bg-[#202A5A]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Theme Switch Floating */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 left-4 p-2.5 rounded-xl bg-white dark:bg-[#151C28] border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 shadow-[2px_2px_0_#202A5A] dark:shadow-[2px_2px_0_#59BBAF] hover:scale-105 transition-all cursor-pointer z-10"
        aria-label="تغییر حالت شب و روز"
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-gray-700" />
        )}
      </button>

      {/* Main Login Card */}
      <div className="w-full max-w-md z-10">
        <RokadCard className="p-6 sm:p-8 border-2 border-gray-200 dark:border-gray-700 shadow-[4px_4px_0_#202A5A] dark:shadow-[4px_4px_0_#59BBAF]">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#59BBAF] to-[#438C83] flex items-center justify-center text-white shadow-[2.5px_2.5px_0_#1F413D]">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF8F7] dark:bg-[#1F413D]/40 text-[#438C83] dark:text-[#59BBAF] border border-[#59BBAF]/30 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>هنرستان استارتاپی رُکاد</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#202A5A] dark:text-white">
              ورود به پنل دانش‌آموز
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              جهت مشاهده امتیازات و ثبت فعالیت‌ها وارد شوید
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#202A5A] dark:text-gray-300 mb-1.5">
                کد ملی
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="idCode"
                  onChange={handleChange}
                  required
                  placeholder="مثلاً: 0021345678"
                  className="rokad-input pr-10 text-left font-mono"
                  dir="ltr"
                />
                <User className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#202A5A] dark:text-gray-300 mb-1.5">
                کلمه عبور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  onChange={handleChange}
                  required
                  placeholder="رمز عبور خود را وارد کنید"
                  className="rokad-input pr-10 pl-10 text-left font-mono"
                  dir="ltr"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <RokadButton
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full text-sm font-black"
                size="lg"
              >
                <span>ورود به حساب کاربری</span>
                <ArrowLeft className="w-4 h-4" />
              </RokadButton>
            </div>
          </form>

          {/* Footer Note */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
            رمز عبور پیش‌فرض: حرف s همراه با کد ملی
          </div>
        </RokadCard>
      </div>
    </div>
  );
}
