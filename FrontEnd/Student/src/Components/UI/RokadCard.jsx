import React from 'react';
import { cn } from '../../Utils/utils';

export default function RokadCard({ children, className = '', hover = true, onClick, ...props }) {
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
      {children}
    </div>
  );
}
