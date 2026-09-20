import React from 'react';
import { cn, toPersianDigits } from '../../Utils/utils';

const themeConfig = {
  ecosystem: {
    bgLight: 'bg-[#EEF8F7] dark:bg-[#1F413D]/40',
    iconColor: 'text-[#59BBAF]',
    borderColor: 'border-[#59BBAF]/30',
    valueColor: 'text-[#1F413D] dark:text-[#EEF8F7]',
  },
  male: {
    bgLight: 'bg-[#E9EAEF] dark:bg-[#0B0F1F]/60',
    iconColor: 'text-[#202A5A] dark:text-[#A0AEC0]',
    borderColor: 'border-[#202A5A]/30',
    valueColor: 'text-[#202A5A] dark:text-white',
  },
  female: {
    bgLight: 'bg-[#FCE8EF] dark:bg-[#4E0920]/40',
    iconColor: 'text-[#E0195B]',
    borderColor: 'border-[#E0195B]/30',
    valueColor: 'text-[#E0195B] dark:text-[#FCE8EF]',
  },
  college: {
    bgLight: 'bg-[#FEF6E8] dark:bg-[#57390A]/40',
    iconColor: 'text-[#F8A41D]',
    borderColor: 'border-[#F8A41D]/30',
    valueColor: 'text-[#BA7B16] dark:text-[#FEF6E8]',
  },
  club: {
    bgLight: 'bg-[#F0EAF4] dark:bg-[#231032]/40',
    iconColor: 'text-[#652D90] dark:text-[#CFBEDD]',
    borderColor: 'border-[#652D90]/30',
    valueColor: 'text-[#652D90] dark:text-[#F0EAF4]',
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  theme = 'ecosystem',
  trend,
  className = '',
  onClick,
}) {
  const currentTheme = themeConfig[theme] || themeConfig.ecosystem;

  return (
    <div
      onClick={onClick}
      className={cn(
        'rokad-card p-4 sm:p-5 flex flex-col justify-between cursor-default relative overflow-hidden',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 block mb-1">
            {title}
          </span>
          <div className={cn('text-2xl sm:text-3xl font-black tracking-tight', currentTheme.valueColor)}>
            {typeof value === 'number' || !isNaN(Number(value)) ? toPersianDigits(value) : value}
          </div>
        </div>

        {Icon && (
          <div
            className={cn(
              'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border',
              currentTheme.bgLight,
              currentTheme.borderColor
            )}
          >
            <Icon className={cn('w-6 h-6', currentTheme.iconColor)} />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-gray-400 dark:text-gray-400 font-medium truncate">
              {subtitle}
            </span>
          )}
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[11px]',
                trend.isPositive
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
