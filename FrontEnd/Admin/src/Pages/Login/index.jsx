import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ShieldCheck, User, Lock, ArrowLeft, Sun, Moon } from 'lucide-react';
import { AuthContext } from '../../Utils/AuthContext';
import { useTheme } from '../../Utils/ThemeContext';
import fetchData from '../../Utils/fetchData';
import useFormFields from '../../Utils/useFormFields';
import RokadButton from '../../Components/UI/RokadButton';

export default function Login() {
  const [fields, handleChange] = useFormFields();
  const { handleAuth } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fields.idCode || !fields.password) {
      toast.error('لطفاً نام کاربری و رمز عبور را وارد فرمایید');
      return;
    }

    setLoading(true);
    try {
      const res = await fetchData('auth', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(fields),
      });

      if (res?.data?.user?.role === 'student') {
        toast.error('دسترسی مجاز نیست. این پرتال مخصوص مدیران و مربیان است.');
        setLoading(false);
        return;
      }

      if (res.success && res?.data?.token) {
        toast.success(res.message || 'ورود با موفقیت انجام شد');
        handleAuth(res.data.token, res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/');
      } else {
        toast.error(res.message || 'اطلاعات ورود نامعتبر است');
      }
    } catch (error) {
      console.error(error);
      toast.error('خطا در برقراری ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F8F9FA] dark:bg-[#0B0F17] transition-colors relative">
      {/* Floating Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 left-4 p-2.5 rounded-xl border-2 border-[#202A5A] dark:border-[#59BBAF]/40 bg-white dark:bg-[#1E2640] rokad-shadow text-gray-700 dark:text-gray-300 hover:border-[#59BBAF] transition"
        title="تغییر پوسته"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-[#202A5A]" />}
      </button>

      <div className="w-full max-w-md bg-white dark:bg-[#1E2640] rounded-2xl border-2 border-[#202A5A] dark:border-[#59BBAF]/30 p-6 sm:p-8 rokad-shadow space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img
            src="/KALogoLoginPage.png"
            alt="پلتفرم کا"
            className="h-16 mx-auto object-contain drop-shadow-xs"
          />
          <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-[#202A5A] text-[#59BBAF] border border-[#59BBAF]/30">
            سامانه مدیریت هنرستان رُکاد
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#202A5A] dark:text-white">
            ورود به کارتابل ادمین
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            جهت تایید درخواست‌ها و پایش فعالیت‌های دانش‌آموزان وارد شوید
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 text-right">
              نام کاربری / کد ملی
            </label>
            <div className="relative">
              <input
                type="text"
                name="idCode"
                value={fields.idCode || ''}
                onChange={handleChange}
                placeholder="مثلاً: 0920000000"
                className="w-full rokad-input rounded-xl pr-10 text-xs sm:text-sm bg-white dark:bg-[#151D2A]"
                required
              />
              <User className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 text-right">
              رمز عبور
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                value={fields.password || ''}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rokad-input rounded-xl pr-10 text-xs sm:text-sm bg-white dark:bg-[#151D2A]"
                required
              />
              <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="pt-2">
            <RokadButton
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full py-3.5 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'در حال ورود...' : 'ورود به پنل مدیریت'}</span>
              <ArrowLeft className="w-4 h-4" />
            </RokadButton>
          </div>
        </form>

        <div className="pt-4 border-t border-gray-100 dark:border-white/5 text-center">
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            هنرستان استارتاپی رُکاد &bull; پلتفرم ارزیابی مهارت و فعالیت‌ها
          </p>
        </div>
      </div>
    </div>
  );
}
