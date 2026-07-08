import React from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50 leading-tight">
                    {title}
                </h1>
                {description && (
                    <p className="text-sm text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
            </div>
            {action && <div className="flex items-center gap-3">{action}</div>}
        </div>
    );
}
