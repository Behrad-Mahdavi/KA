import React, { useEffect, useState } from 'react';
import { IoClose, IoCheckmarkDoneCircleOutline, IoRefresh } from 'react-icons/io5';
import fetchData from '../Utils/fetchData';
import { useNavigate } from 'react-router-dom';
import {
  BsChatDotsFill,
  BsCheckCircleFill,
  BsXCircleFill,
  BsFileEarmarkPlusFill,
  BsGiftFill
} from 'react-icons/bs';
import { toPersianDigits, formatToJalali } from '../Utils/utils';

const adminIconMap = {
  'new_activity_submission': BsFileEarmarkPlusFill,
  'new_reward_request': BsGiftFill,
  'admin_general': BsChatDotsFill,
};

export default function NotificationPanel({ isOpen, onClose, token, userType = 'admin' }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchNotificationsList = async () => {
    if (!token) return;
    setLoading(true);
    setIsRefreshing(true);
    setError(null);

    try {
      const response = await fetchData('notifications?limit=10', {
        headers: { authorization: `Bearer ${token}` }
      });
      if (response.success && Array.isArray(response.data)) {
        setNotifications(response.data);
      } else {
        setError(response.message || 'خطا در دریافت اطلاعات.');
      }
    } catch (err) {
      setError(err.message || 'خطای شبکه.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotificationsList();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id, relatedLink) => {
    try {
      await fetchData(`notifications/${id}/read`, {
        method: 'PATCH',
        headers: { authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
      if (relatedLink) {
        navigate(relatedLink);
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAllAsRead(true);
    try {
      await fetchData('notifications/mark-all-read', {
        method: 'PATCH',
        headers: { authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute left-0 mt-3 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#151C28] rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-[4px_4px_0_#202A5A] dark:shadow-[4px_4px_0_#59BBAF] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between p-3.5 sm:p-4 bg-gray-50/80 dark:bg-[#1C2536] border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <h4 className="font-black text-sm text-[#202A5A] dark:text-white">اعلان‌های مدیریت</h4>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#59BBAF]/15 text-[#438C83] dark:text-[#59BBAF]">
            {toPersianDigits(notifications.filter(n => !n.isRead).length)} جدید
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={fetchNotificationsList}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer"
            title="بروزرسانی"
          >
            <IoRefresh className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleMarkAllAsRead}
            disabled={markingAllAsRead}
            className="p-1.5 rounded-lg text-gray-500 hover:text-[#59BBAF] dark:text-gray-400 dark:hover:text-[#59BBAF] hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer"
            title="خواندن همه"
          >
            <IoCheckmarkDoneCircleOutline className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer"
            title="بستن"
          >
            <IoClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
        {loading ? (
          <div className="py-8 text-center text-xs text-gray-400">در حال دریافت اعلان‌ها...</div>
        ) : error ? (
          <div className="p-4 text-center text-xs text-rose-500">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">اعلانی وجود ندارد.</div>
        ) : (
          notifications.map(item => {
            const Icon = adminIconMap[item.type] || BsChatDotsFill;
            return (
              <div
                key={item.id}
                onClick={() => handleMarkAsRead(item.id, item.relatedLink)}
                className={`p-3.5 sm:p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-[#1C2536]/60 transition-all cursor-pointer ${
                  !item.isRead ? 'bg-[#EEF8F7]/60 dark:bg-[#1F413D]/20' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-primary">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h5 className="text-xs font-bold text-[#202A5A] dark:text-white truncate">
                      {item.title}
                    </h5>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                      {formatToJalali(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                    {item.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}