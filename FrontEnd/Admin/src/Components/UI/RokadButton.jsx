import React from 'react';
import { cn } from '../../Utils/utils';

export default function RokadButton({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg min-h-[36px]',
    md: 'px-4 py-2.5 text-xs sm:text-sm rounded-xl min-h-[44px]',
    lg: 'px-5 py-3 text-sm sm:text-base rounded-xl min-h-[48px]',
  };

  const variantClasses = {
    primary: 'rokad-btn-primary',
    secondary: 'rokad-btn-sec',
    sec: 'rokad-btn-sec',
    outline: 'rokad-btn-outline',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white font-bold border-1.5 border-rose-800 rounded-xl shadow-[2.5px_2.5px_0_#4C0519] active:translate-x-0.5 active:translate-y-0.5 transition-all inline-flex items-center justify-center gap-2 cursor-pointer',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer transition-all',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size],
        (disabled || loading) && 'opacity-60 cursor-not-allowed transform-none shadow-none',
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
