import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { type ReactNode } from 'react';

interface ListSectionProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function ListSection({ title, description, actions }: ListSectionProps) {
  return (
    <Card className="border-2 border-border/70 bg-gradient-to-r from-slate-100 via-slate-50 to-white text-slate-900 shadow-sm dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
      <CardContent className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </CardContent>
    </Card>
  );
}
