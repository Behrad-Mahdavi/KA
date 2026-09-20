import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../Utils/utils';

export default function RokadModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  className = '',
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div
        className={cn(
          'relative w-full bg-white dark:bg-[#151C28] rounded-3xl border-2 border-[#59BBAF]/40 shadow-[4px_4px_0_#202A5A] dark:shadow-[4px_4px_0_#59BBAF] p-5 sm:p-6 z-10 transition-all transform scale-100',
          maxWidth,
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            {title && (
              <h3 className="text-base sm:text-lg font-black text-[#202A5A] dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 transition-all cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
