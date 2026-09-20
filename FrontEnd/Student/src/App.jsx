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
import Activities from './Pages/Activities';
import Rewards from './Pages/Rewards';
import RequestRewardPage from './Pages/Rewards/RewardOptionData';
import Result from './Pages/Results';

const AppContent = () => {
  const { token, user } = useContext(AuthContext);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isStudent = token && user?.role === 'student';
  const isLoginPage = location.pathname === '/login';
  const showAppShell = isStudent && !isLoginPage;

  // Title based on path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'میز کار و داشبورد دانش‌آموز';
      case '/activities':
        return 'مدیریت و ثبت فعالیت‌ها';
      case '/rewards':
      case '/request-reward':
        return 'فروشگاه و دریافت پاداش‌ها';
      case '/results':
        return 'جدول جامع رتبه‌بندی و امتیازات';
      default:
        return 'هنرستان استارتاپی رُکاد';
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
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {showAppShell && (
          <Header
            title={getPageTitle()}
            onMenuClick={() => setMobileMenuOpen(true)}
          />
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route
              path="/login"
              element={isStudent ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
              path="/"
              element={!isStudent ? <Navigate to="/login" replace /> : <Home />}
            />
            <Route
              path="/activities"
              element={!isStudent ? <Navigate to="/login" replace /> : <Activities />}
            />
            <Route
              path="/rewards"
              element={!isStudent ? <Navigate to="/login" replace /> : <Rewards />}
            />
            <Route
              path="/request-reward"
              element={!isStudent ? <Navigate to="/login" replace /> : <RequestRewardPage />}
            />
            <Route
              path="/results"
              element={!isStudent ? <Navigate to="/login" replace /> : <Result />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  );
}