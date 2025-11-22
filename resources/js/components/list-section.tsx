import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { type ReactNode } from 'react';

interface ListSectionProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function ListSection({ title, description, actions }: ListSectionProps) {
  return (
    <Card>
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
