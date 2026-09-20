import React, { useState, useEffect } from 'react';
import { Table, FileSpreadsheet, Download, Calendar, Filter, User, GraduationCap, AlertCircle } from 'lucide-react';
import GradeTable from './GradeTable';
import fetchData from '../../Utils/fetchData';
import RokadCard from '../../Components/UI/RokadCard';
import RokadButton from '../../Components/UI/RokadButton';
import { toPersianDigits } from '../../Utils/utils';

const GRADE_BUTTONS = [
  { label: "پایه دهم", value: "دهم" },
  { label: "پایه یازدهم", value: "یازدهم" },
  { label: "پایه دوازدهم", value: "دوازدهم" }
];

const REPORT_TYPES = [
  { label: "گزارش کلی همه فعالیت‌ها", value: "all_activities" },
  { label: "گزارش فعالیت‌های تایید شده (دانش‌آموز)", value: "approved_student_activities" },
  { label: "گزارش فعالیت‌های تایید شده (ادمین)", value: "admin_activities" },
  { label: "گزارش فعالیت‌های در انتظار بررسی", value: "pending_activities" },
  { label: "گزارش فعالیت‌های رد شده", value: "rejected_activities" },
  { label: "گزارش کلی همه پاداش‌ها", value: "all_rewards" },
  { label: "گزارش پاداش‌های تایید شده", value: "approved_rewards" },
  { label: "گزارش پاداش‌های در انتظار", value: "requested_rewards" },
  { label: "گزارش پاداش‌های رد شده", value: "rejected_rewards" },
];

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState('tables'); // 'tables' | 'reports'
  const [selectedGrade, setSelectedGrade] = useState('دهم');

  const [reportFilters, setReportFilters] = useState({
    reportType: '',
    grade: '',
    studentId: '',
    fromDate: '',
    toDate: '',
  });

  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [studentsForSelection, setStudentsForSelection] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true);
      let url = 'users/students-selection';
      if (reportFilters.grade) {
        url += `?grade=${encodeURIComponent(reportFilters.grade)}`;
      }
      try {
        const response = await fetchData(url, { headers: { authorization: `Bearer ${token}` } });
        if (response.success) {
          setStudentsForSelection(response.data.map(s => ({ value: s.value, label: s.label })));
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [reportFilters.grade, token]);

  const handleReportFilterChange = (e) => {
    const { name, value } = e.target;
    setReportFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      if (name === 'grade') newFilters.studentId = '';
      return newFilters;
    });
  };

  const handleGetReport = async (e) => {
    e.preventDefault();
    if (!reportFilters.reportType) {
      setReportError("لطفاً ابتدا نوع گزارش را مشخص کنید.");
      return;
    }
    setSubmittingReport(true);
    setReportError(null);

    const filtersToSend = { reportType: reportFilters.reportType };
    if (reportFilters.grade) filtersToSend.grade = reportFilters.grade;
    if (reportFilters.studentId) filtersToSend.students = [reportFilters.studentId];
    if (reportFilters.fromDate) filtersToSend.fromDate = reportFilters.fromDate;
    if (reportFilters.toDate) filtersToSend.toDate = reportFilters.toDate;

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5005/api/';
      const response = await fetch(`${baseUrl}reports/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(filtersToSend)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `خطای سرور: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;

      let filename = `report_${reportFilters.reportType}.xlsx`;
      const disposition = response.headers.get('content-disposition');
      if (disposition && disposition.includes('attachment')) {
        const filenameMatch = disposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?/);
        if (filenameMatch && filenameMatch[1]) {
          try {
            filename = decodeURIComponent(filenameMatch[1]);
          } catch (e) {
            filename = filenameMatch[1];
          }
        }
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Error generating report:", error);
      setReportError(error.message || "خطا در دریافت گزارش اکسل");
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Switch Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setActiveTab('tables')}
          className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all rokad-shadow text-right cursor-pointer ${
            activeTab === 'tables'
              ? 'bg-[#202A5A] text-white border-[#202A5A] shadow-[3px_3px_0_#59BBAF]'
              : 'bg-white dark:bg-[#1E2640] text-gray-700 dark:text-gray-200 border-[#202A5A] dark:border-[#59BBAF]/30 hover:border-[#59BBAF]'
          }`}
        >
          <div>
            <h2 className="font-black text-base sm:text-lg mb-1">جداول رتبه‌بندی</h2>
            <p className="text-xs opacity-80">مشاهده امتیازات و رتبه دانش‌آموزان به تفکیک پایه</p>
          </div>
          <div className={`p-3 rounded-xl ${activeTab === 'tables' ? 'bg-white/10' : 'bg-[#59BBAF]/15 text-[#59BBAF]'}`}>
            <Table className="w-6 h-6" />
          </div>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all rokad-shadow text-right cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-[#E0195B] text-white border-[#E0195B] shadow-[3px_3px_0_#202A5A]'
              : 'bg-white dark:bg-[#1E2640] text-gray-700 dark:text-gray-200 border-[#202A5A] dark:border-[#59BBAF]/30 hover:border-[#E0195B]'
          }`}
        >
          <div>
            <h2 className="font-black text-base sm:text-lg mb-1">تولید گزارش اکسل</h2>
            <p className="text-xs opacity-80">خروجی هوشمند اکسل از فعالیت‌ها و پاداش‌ها با فیلتر</p>
          </div>
          <div className={`p-3 rounded-xl ${activeTab === 'reports' ? 'bg-white/10' : 'bg-[#E0195B]/15 text-[#E0195B]'}`}>
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </button>
      </div>

      {/* Tab 1: Grade Tables */}
      {activeTab === 'tables' && (
        <RokadCard
          title="جدول رده‌بندی هنرآموزان"
          subtitle="بررسی امتیازات آموزشی، فردی و شغلی پایه‌ها"
          badge="رتبه‌بندی زنده"
          persona="male"
          action={
            <div className="flex flex-wrap gap-2">
              {GRADE_BUTTONS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setSelectedGrade(g.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                    selectedGrade === g.value
                      ? 'bg-[#59BBAF] text-[#202A5A] border-[#202A5A] font-black shadow-[2px_2px_0_#202A5A]'
                      : 'bg-white dark:bg-[#151D2A] text-gray-600 dark:text-gray-300 border-gray-300 dark:border-white/10 hover:border-[#59BBAF]'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          }
        >
          <div className="mt-4">
            <GradeTable key={selectedGrade} grade={selectedGrade} token={token} />
          </div>
        </RokadCard>
      )}

      {/* Tab 2: Excel Reports Generator */}
      {activeTab === 'reports' && (
        <RokadCard
          title="دریافت فایل گزارش تفصیلی اکسل"
          subtitle="فیلترگذاری دقیق بر اساس تاریخ، پایه، شخص و وضعیت فعالیت‌ها"
          badge="گزارش ساز"
          persona="female"
        >
          <form onSubmit={handleGetReport} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  نوع گزارش <span className="text-red-500">*</span>
                </label>
                <select
                  name="reportType"
                  value={reportFilters.reportType}
                  onChange={handleReportFilterChange}
                  required
                  className="w-full rokad-input rounded-xl text-xs sm:text-sm bg-white dark:bg-[#151D2A]"
                >
                  <option value="">انتخاب نوع گزارش...</option>
                  {REPORT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  فیلتر بر اساس پایه تحصیلی
                </label>
                <select
                  name="grade"
                  value={reportFilters.grade}
                  onChange={handleReportFilterChange}
                  className="w-full rokad-input rounded-xl text-xs sm:text-sm bg-white dark:bg-[#151D2A]"
                >
                  <option value="">همه پایه‌ها</option>
                  {GRADE_BUTTONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  دانش‌آموز خاص (اختیاری)
                </label>
                <select
                  name="studentId"
                  value={reportFilters.studentId}
                  onChange={handleReportFilterChange}
                  disabled={loadingStudents}
                  className="w-full rokad-input rounded-xl text-xs sm:text-sm bg-white dark:bg-[#151D2A] disabled:opacity-50"
                >
                  <option value="">همه دانش‌آموزان</option>
                  {studentsForSelection.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    از تاریخ (میلادی)
                  </label>
                  <input
                    type="date"
                    name="fromDate"
                    value={reportFilters.fromDate}
                    onChange={handleReportFilterChange}
                    className="w-full rokad-input rounded-xl text-xs bg-white dark:bg-[#151D2A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    تا تاریخ (میلادی)
                  </label>
                  <input
                    type="date"
                    name="toDate"
                    value={reportFilters.toDate}
                    onChange={handleReportFilterChange}
                    className="w-full rokad-input rounded-xl text-xs bg-white dark:bg-[#151D2A]"
                  />
                </div>
              </div>
            </div>

            {reportError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-400 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{reportError}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <RokadButton
                type="submit"
                disabled={submittingReport}
                variant="primary"
                className="w-full sm:w-auto px-8"
              >
                <Download className="w-4 h-4 ml-2" />
                {submittingReport ? 'در حال آماده‌سازی فایل...' : 'دریافت خروجی اکسل'}
              </RokadButton>
            </div>
          </form>
        </RokadCard>
      )}
    </div>
  );
}