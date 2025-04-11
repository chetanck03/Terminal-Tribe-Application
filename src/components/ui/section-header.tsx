import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-6", className)}>
      <div className="flex items-center">
        <div className="w-1 h-6 bg-gradient-to-b from-campus-blue to-campus-purple rounded-full mr-2"></div>
        <h2 className="text-xl font-semibold tracking-tight text-campus-blue">{title}</h2>
      </div>
      {action && <div className="animate-fade-in">{action}</div>}
    </div>
  );
}
