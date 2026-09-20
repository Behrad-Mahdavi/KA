import React, { useContext, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthContext } from './Utils/AuthContext';
import { ThemeProvider } from './Utils/ThemeContext';

// Components
import Sidebar from './Components/Sidebar';
import Header from './Components/Header';

// Pages
import Home from './Pages/Home';
import Login from './Pages/Login';
import ExcelUpload from './Pages/ExelUploader';
import ActivityExcelUpload from './Pages/Activity';
import RewardExcelUpload from './Pages/Rewards';
import Requests from './Pages/Requests';
import Result from './Pages/Results';

const AppContent = () => {
  const { token, user } = useContext(AuthContext);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSuperAdmin = token && user?.role !== 'student';
  const isLoginPage = location.pathname === '/login';
  const showAppShell = isSuperAdmin && !isLoginPage;

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'میز پایش و مدیریت عالی هنرستان';
      case '/add-users':
        return 'ثبت‌نام گروهی کاربران (اکسل)';
      case '/add-activity':
        return 'بارگذاری گروهی تعاریف فعالیت‌ها';
      case '/rewards':
        return 'بارگذاری کاتالوگ پاداش‌ها';
      case '/requests':
        return 'کارتابل درخواست‌های فعالیت دانش‌آموزان';
      case '/results':
        return 'جداول نتایج، امتیازات و گزارشات';
      default:
        return 'پنل مدیریت عالی رُکاد';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F17] text-[#292827] dark:text-[#F1F5F9] transition-colors flex">
      <Toaster position="top-right" richColors />

      {/* Sidebar Navigation */}
      {showAppShell && (
        <Sidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {showAppShell && (
          <Header
            onMenuClick={() => setMobileMenuOpen(true)}
            title={getPageTitle()}
          />
        )}

        <main className={`flex-1 ${showAppShell ? 'p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full' : ''}`}>
          <Routes>
            <Route
              path="/login"
              element={token && user?.role !== 'student' ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
              path="/"
              element={!token || user?.role === 'student' ? <Navigate to="/login" replace /> : <Home />}
            />
            <Route
              path="/add-users"
              element={!token || user?.role === 'student' ? <Navigate to="/login" replace /> : <ExcelUpload />}
            />
            <Route
              path="/add-activity"
              element={!token || user?.role === 'student' ? <Navigate to="/login" replace /> : <ActivityExcelUpload />}
            />
            <Route
              path="/rewards"
              element={!token || user?.role === 'student' ? <Navigate to="/login" replace /> : <RewardExcelUpload />}
            />
            <Route
              path="/requests"
              element={!token || user?.role === 'student' ? <Navigate to="/login" replace /> : <Requests />}
            />
            <Route
              path="/results"
              element={!token || user?.role === 'student' ? <Navigate to="/login" replace /> : <Result />}
            />
            <Route
              path="/exel"
              element={<Navigate to="/add-users" replace />}
            />
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}