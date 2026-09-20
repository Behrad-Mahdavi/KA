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
import AddData from './Pages/AddData';
import CreateNewData from './Pages/AddData/Create';
import Requests from './Pages/Requests';
import Rewards from './Pages/Rewards';
import Result from './Pages/Results';
import ExcelUpload from './Pages/ExelUploader';

const AppContent = () => {
  const { token, user } = useContext(AuthContext);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminOrSuper = token && user?.role !== 'student';
  const isLoginPage = location.pathname === '/login';
  const showAppShell = isAdminOrSuper && !isLoginPage;

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'میز مدیریت و آمار هنرستان';
      case '/add-data':
      case '/add-data/create':
        return 'ثبت داده‌ها و فعالیت‌های دانش‌آموزی';
      case '/requests':
        return 'کارتابل بررسی درخواست‌های فعالیت';
      case '/rewards':
        return 'مدیریت و تایید تحویل پاداش‌ها';
      case '/results':
        return 'گزارش‌ها و جداول رتبه‌بندی';
      case '/exel':
        return 'بارگذاری گروهی فایل اکسل';
      default:
        return 'پنل مدیریت هنرستان رُکاد';
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
              element={isAdminOrSuper ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
              path="/"
              element={!isAdminOrSuper ? <Navigate to="/login" replace /> : <Home />}
            />
            <Route path="/add-data">
              <Route
                index
                element={!isAdminOrSuper ? <Navigate to="/login" replace /> : <AddData />}
              />
              <Route
                path="create"
                element={!isAdminOrSuper ? <Navigate to="/login" replace /> : <CreateNewData />}
              />
            </Route>
            <Route
              path="/requests"
              element={!isAdminOrSuper ? <Navigate to="/login" replace /> : <Requests />}
            />
            <Route
              path="/rewards"
              element={!isAdminOrSuper ? <Navigate to="/login" replace /> : <Rewards />}
            />
            <Route
              path="/results"
              element={!isAdminOrSuper ? <Navigate to="/login" replace /> : <Result />}
            />
            <Route
              path="/exel"
              element={!isAdminOrSuper ? <Navigate to="/login" replace /> : <ExcelUpload />}
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