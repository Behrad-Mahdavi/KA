import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import fetchData from '../../../Utils/fetchData';
import { toPersianDigits } from '../../../Utils/utils';
import { toast } from 'sonner';
import RokadCard from '../../../Components/UI/RokadCard';
import RokadButton from '../../../Components/UI/RokadButton';
import {
  ArrowRight,
  UserCheck,
  FileSpreadsheet,
  PlusCircle,
  Upload,
  ChevronDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function CreateNewData() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('individual'); // 'individual' or 'group'

  // Individual Form State
  const [grade, setGrade] = useState('');
  const [classNum, setClassNum] = useState('');
  const [studentId, setStudentId] = useState('');
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [category, setCategory] = useState('');
  const [activityId, setActivityId] = useState('');
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const [details, setDetails] = useState('');
  const [scoreAwarded, setScoreAwarded] = useState('');
  const [description, setDescription] = useState('');
  const [submittingIndividual, setSubmittingIndividual] = useState(false);

  // Group Excel Form State
  const [excelFile, setExcelFile] = useState(null);
  const [submittingGroup, setSubmittingGroup] = useState(false);

  const baseOptions = ["دهم", "یازدهم", "دوازدهم"];
  const classOptions = {
    "دهم": [101, 102, 103],
    "یازدهم": [201, 202],
    "دوازدهم": [301, 302],
  };

  const categories = [
    'فعالیت‌های آموزشی',
    'فعالیت‌های شغلی',
    'فعالیت‌های داوطلبانه و توسعه فردی',
    'موارد کسر امتیاز',
  ];

  // Fetch students when grade or classNum changes
  useEffect(() => {
    if (!token || !grade) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        let query = `users/students-for-selection?grade=${encodeURIComponent(grade)}`;
        const res = await fetchData(query, {
          headers: { authorization: `Bearer ${token}` }
        });
        if (res?.success && Array.isArray(res.data)) {
          let list = res.data;
          if (classNum) {
            list = list.filter(s => String(s.rawData?.class) === String(classNum));
          }
          setStudents(list);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [grade, classNum]);

  // Fetch activities when category changes
  useEffect(() => {
    if (!token || !category) {
      setActivities([]);
      return;
    }

    const fetchActivities = async () => {
      setLoadingActivities(true);
      try {
        const res = await fetchData(`activity/by-parent/${encodeURIComponent(category)}`, {
          headers: { authorization: `Bearer ${token}` }
        });
        if (res?.success && Array.isArray(res.data)) {
          setActivities(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [category]);

  const handleActivitySelect = (actId) => {
    setActivityId(actId);
    const act = activities.find(a => (a.id || a._id) === actId);
    setSelectedActivity(act || null);
    setDetails('');
    setScoreAwarded('');
  };

  const handleIndividualSubmit = async (e) => {
    e.preventDefault();
    if (!studentId || !activityId) {
      toast.error('لطفاً دانش‌آموز و فعالیت را انتخاب کنید.');
      return;
    }

    setSubmittingIndividual(true);

    const payload = {
      activityId,
      details,
      scoreAwarded: scoreAwarded !== '' ? parseFloat(scoreAwarded) : undefined,
      description,
    };

    try {
      const res = await fetchData(`admin-activity/user/${studentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res?.success) {
        toast.success("فعالیت با موفقیت برای دانش‌آموز ثبت و امتیاز اضافه گردید.");
        navigate('/add-data');
      } else {
        toast.error(res?.message || "خطا در ثبت فعالیت.");
      }
    } catch (err) {
      toast.error("خطای شبکه یا سرور");
    } finally {
      setSubmittingIndividual(false);
    }
  };

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      toast.error('لطفاً فایل اکسل را انتخاب نمایید.');
      return;
    }

    setSubmittingGroup(true);
    const formData = new FormData();
    formData.append('excelFile', excelFile);

    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL || 'http://localhost:5005/api/'}admin-activity/bulk-excel`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (data?.success) {
        toast.success(data.message || "فعالیت‌های گروهی با موفقیت ثبت شدند.");
        navigate('/add-data');
      } else {
        toast.error(data?.message || "خطا در پردازش فایل اکسل.");
      }
    } catch (err) {
      toast.error("خطا در ارسال فایل");
    } finally {
      setSubmittingGroup(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      {/* 1. Header & Back */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/add-data"
            className="text-xs font-bold text-gray-500 hover:text-[#59BBAF] flex items-center gap-1 mb-1 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>بازگشت به لیست فعالیت‌ها</span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-black text-[#202A5A] dark:text-white">
            ثبت مستقیم فعالیت و امتیاز
          </h2>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 rounded-2xl bg-white dark:bg-[#151C28] border border-gray-200 dark:border-gray-800 shadow-[2px_2px_0_#202A5A] dark:shadow-[2px_2px_0_#59BBAF]">
          <button
            type="button"
            onClick={() => setActiveTab('individual')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'individual'
                ? 'bg-[#59BBAF] text-white shadow-[2px_2px_0_#1F413D]'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            ثبت فردی
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('group')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'group'
                ? 'bg-[#59BBAF] text-white shadow-[2px_2px_0_#1F413D]'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            ثبت گروهی (اکسل)
          </button>
        </div>
      </div>

      {/* 2. Individual Form */}
      {activeTab === 'individual' && (
        <RokadCard className="p-6 sm:p-8">
          <form onSubmit={handleIndividualSubmit} className="space-y-5">
            {/* Step 1: Select Student */}
            <div className="space-y-3 pb-5 border-b border-gray-100 dark:border-gray-800">
              <span className="text-xs font-black text-[#59BBAF] uppercase tracking-wider block">
                مرحله ۱: انتخاب دانش‌آموز
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Grade */}
                <div>
                  <label className="block text-xs font-bold text-[#202A5A] dark:text-gray-300 mb-1">
                    پایه تحصیلی <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={grade}
                      onChange={(e) => {
                        setGrade(e.target.value);
                        setClassNum('');
                        setStudentId('');
                      }}
                      required
                      className="rokad-input pr-3 pl-8 appearance-none cursor-pointer"
                    >
                      <option value="" disabled>انتخاب پایه...</option>
                      {baseOptions.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Class */}
                <div>
                  <label className="block text-xs font-bold text-[#202A5A] dark:text-gray-300 mb-1">
                    کلاس
                  </label>
                  <div className="relative">
                    <select
                      value={classNum}
                      onChange={(e) => {
                        setClassNum(e.target.value);
                        setStudentId('');
                      }}
                      disabled={!grade}
                      className="rokad-input pr-3 pl-8 appearance-none cursor-pointer"
                    >
                      <option value="">همه کلاس‌های این پایه</option>
                      {grade && classOptions[grade]?.map(c => (
                        <option key={c} value={c}>کلاس {toPersianDigits(c)}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Student */}
                <div>
                  <label className="block text-xs font-bold text-[#202A5A] dark:text-gray-300 mb-1">
                    نام دانش‌آموز <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                      disabled={!grade || loadingStudents}
                      className="rokad-input pr-3 pl-8 appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        {loadingStudents ? "در حال دریافت دانش‌آموزان..." : !grade ? "ابتدا پایه را انتخاب کنید" : "انتخاب دانش‌آموز..."}
                      </option>
                      {students.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Select Activity */}
            <div className="space-y-3 pb-5 border-b border-gray-100 dark:border-gray-800">
              <span className="text-xs font-black text-[#59BBAF] uppercase tracking-wider block">
                مرحله ۲: انتخاب فعالیت و نمره/امتیاز
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-[#202A5A] dark:text-gray-300 mb-1">
                    دسته‌بندی فعالیت <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setActivityId('');
                        setSelectedActivity(null);
                      }}
                      required
                      className="rokad-input pr-3 pl-8 appearance-none cursor-pointer"
                    >
                      <option value="" disabled>انتخاب دسته‌بندی...</option>
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Activity Name */}
                <div>
                  <label className="block text-xs font-bold text-[#202A5A] dark:text-gray-300 mb-1">
                    عنوان فعالیت <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={activityId}
                      onChange={(e) => handleActivitySelect(e.target.value)}
                      required
                      disabled={!category || loadingActivities}
                      className="rokad-input pr-3 pl-8 appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        {loadingActivities ? "در حال دریافت عناوین..." : !category ? "ابتدا دسته‌بندی را انتخاب کنید" : "انتخاب عنوان فعالیت..."}
                      </option>
                      {activities.map(a => (
                        <option key={a.id || a._id} value={a.id || a._id}>{a.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Dynamic Value Input & Score Input */}
              {selectedActivity && (
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1C2536] border border-gray-200 dark:border-gray-700 space-y-3 mt-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedActivity.description || 'توضیحی برای این فعالیت ثبت نشده است.'}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Details input */}
                    {selectedActivity.scoreDefinition?.inputType === 'select_from_enum' ? (
                      <div>
                        <label className="block text-xs font-bold text-[#202A5A] dark:text-gray-300 mb-1">
                          سطح / گزینه انتخابی
                        </label>
                        <div className="relative">
                          <select
                            value={details}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDetails(val);
                              const opt = selectedActivity.scoreDefinition.enumOptions?.find(o => o.label === val);
                              if (opt) setScoreAwarded(String(opt.value));
                            }}
                            required
                            className="rokad-input pr-3 pl-8 appearance-none cursor-pointer"
                          >
                            <option value="" disabled>-- انتخاب گزینه --</option>
                            {selectedActivity.scoreDefinition.enumOptions?.map((o, idx) => (
                              <option key={idx} value={o.label}>
                                {o.label} ({toPersianDigits(o.value)} امتیاز)
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-[#202A5A] dark:text-gray-300 mb-1">
                          {selectedActivity.valueInput?.label || 'مقدار / نمره کارنامه'}
                        </label>
                        <input
                          type={selectedActivity.valueInput?.type === 'number' ? 'number' : 'text'}
                          value={details}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDetails(val);
                            if (selectedActivity.scoreDefinition?.inputType === 'calculated_from_value') {
                              const mult = selectedActivity.scoreDefinition.multiplier || 1;
                              const calc = parseFloat(val) * mult;
                              if (!isNaN(calc)) setScoreAwarded(String(calc));
                            }
                          }}
                          placeholder="مثلاً: 19.5"
                          className="rokad-input"
                        />
                      </div>
                    )}

                    {/* Final Score Input */}
                    <div>
                      <label className="block text-xs font-bold text-[#202A5A] dark:text-gray-300 mb-1">
                        امتیاز نهایی اعطایی <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={scoreAwarded}
                        onChange={(e) => setScoreAwarded(e.target.value)}
                        required
                        placeholder="مثلاً: 50"
                        className="rokad-input text-center font-black text-base"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Admin Notes */}
            <div>
              <label className="block text-xs font-bold text-[#202A5A] dark:text-gray-300 mb-1">
                توضیحات دبیر / معاونت (اختیاری)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="توضیحات تکمیلی پیرامون نحوه کسب این امتیاز..."
                className="rokad-input resize-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <RokadButton
                type="submit"
                variant="primary"
                loading={submittingIndividual}
                icon={PlusCircle}
                className="w-full text-sm font-black"
                size="lg"
              >
                {submittingIndividual ? "در حال ثبت اطلاعات..." : "ثبت و اعمال امتیاز در کارنامه دانش‌آموز"}
              </RokadButton>
            </div>
          </form>
        </RokadCard>
      )}

      {/* 3. Group Form (Excel) */}
      {activeTab === 'group' && (
        <RokadCard className="p-6 sm:p-8">
          <form onSubmit={handleGroupSubmit} className="space-y-5">
            <div className="text-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl bg-gray-50 dark:bg-[#1C2536]">
              <FileSpreadsheet className="w-12 h-12 text-[#59BBAF] mx-auto mb-3" />
              <h4 className="text-sm font-bold text-[#202A5A] dark:text-white mb-1">
                بارگذاری فایل اکسل فعالیت‌های گروهی
              </h4>
              <p className="text-xs text-gray-400 max-w-md mx-auto mb-4">
                فایل اکسل باید شامل ستون‌های کد ملی (`idCode`)، نام فعالیت (`activityName`)، و امتیاز (`score`) باشد.
              </p>

              <input
                type="file"
                accept=".xlsx, .xls"
                id="excelFileInput"
                onChange={(e) => setExcelFile(e.target.files[0] || null)}
                className="hidden"
              />
              <label
                htmlFor="excelFileInput"
                className="rokad-btn-outline px-4 py-2 text-xs cursor-pointer inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>{excelFile ? excelFile.name : "انتخاب فایل اکسل..."}</span>
              </label>
            </div>

            <div className="pt-2">
              <RokadButton
                type="submit"
                variant="primary"
                loading={submittingGroup}
                disabled={!excelFile}
                icon={Upload}
                className="w-full text-sm font-black"
                size="lg"
              >
                {submittingGroup ? "در حال پردازش و ثبت گروهی..." : "شروع پردازش و ثبت گروهی فعالیت‌ها"}
              </RokadButton>
            </div>
          </form>
        </RokadCard>
      )}
    </div>
  );
}