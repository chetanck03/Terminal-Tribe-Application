import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8", className)}>
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient animate-slide-in">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-2 text-lg md:text-xl animate-slide-in" style={{ animationDelay: '100ms' }}>{description}</p>
        )}
      </div>
      {children && <div className="flex-shrink-0 w-full md:w-auto animate-slide-in" style={{ animationDelay: '200ms' }}>{children}</div>}
    </div>
  );
}
