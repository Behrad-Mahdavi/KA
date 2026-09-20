import React from 'react';
import { cn } from '../../Utils/utils';
import RokadBadge from './RokadBadge';

export default function RokadCard({
  title,
  subtitle,
  badge,
  action,
  persona = 'ecosystem',
  children,
  className = '',
  hover = true,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rokad-card p-4 sm:p-5 md:p-6',
        !hover && 'hover:transform-none hover:shadow-[2.75px_2.75px_0_#202A5A] dark:hover:shadow-[2.75px_2.75px_0_#59BBAF]',
        className
      )}
      {...props}
    >
      {(title || subtitle || action || badge) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-gray-100 dark:border-white/5 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              {title && (
                <h3 className="text-base sm:text-lg font-black text-[#202A5A] dark:text-white">
                  {title}
                </h3>
              )}
              {badge && <RokadBadge variant={persona}>{badge}</RokadBadge>}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
