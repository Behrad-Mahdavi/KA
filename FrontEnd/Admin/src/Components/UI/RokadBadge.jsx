import React from 'react';
import { cn } from '../../Utils/utils';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Info } from 'lucide-react';

const badgeStyles = {
  approved: {
    classes: 'bg-[#EEF8F7] dark:bg-[#1F413D]/40 text-[#1F413D] dark:text-[#59BBAF] border-[#59BBAF]/40',
    icon: CheckCircle2,
    defaultLabel: 'تایید شده',
  },
  pending: {
    classes: 'bg-[#FEF6E8] dark:bg-[#57390A]/40 text-[#BA7B16] dark:text-[#F8A41D] border-[#F8A41D]/40',
    icon: Clock,
    defaultLabel: 'در انتظار بررسی',
  },
  rejected: {
    classes: 'bg-[#FCE8EF] dark:bg-[#4E0920]/40 text-[#A81344] dark:text-[#E0195B] border-[#E0195B]/40',
    icon: XCircle,
    defaultLabel: 'رد شده',
  },
  male: {
    classes: 'bg-[#E9EAEF] dark:bg-[#0B0F1F]/60 text-[#202A5A] dark:text-[#A0AEC0] border-[#202A5A]/30',
    icon: Info,
    defaultLabel: 'اطلاعات',
  },
  club: {
    classes: 'bg-[#F0EAF4] dark:bg-[#231032]/40 text-[#652D90] dark:text-[#CFBEDD] border-[#652D90]/30',
    icon: Info,
    defaultLabel: 'ویژه',
  },
};

export default function RokadBadge({
  variant = 'approved',
  label,
  children,
  showIcon = true,
  className = '',
}) {
  const config = badgeStyles[variant] || badgeStyles.approved;
  const Icon = config.icon;
  const content = children || label || config.defaultLabel;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs border',
        config.classes,
        className
      )}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
      <span>{content}</span>
    </span>
  );
}
