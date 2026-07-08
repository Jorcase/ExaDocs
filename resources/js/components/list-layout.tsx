import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Pagination from '@/components/pagination';
import { type Url } from '@/types';
import { type ReactNode } from 'react';

interface ListLayoutProps {
    title: string;
    createHref?: string;
    createLabel?: string;
    actions?: ReactNode;
    children: ReactNode;
    paginationLinks?: Url[];
}

export function ListLayout({
    title,
    createHref,
    createLabel,
    actions,
    children,
    paginationLinks,
}: ListLayoutProps) {
    return (
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 space-y-6 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">{title}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {actions}
                    {createHref && createLabel && (
                        <Link href={createHref}>
                            <Button className="rounded-lg">{createLabel}</Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Table Content Card */}
            <Card className="rounded-xl border border-border/80 bg-card text-card-foreground shadow-xs p-6">
                <div className="space-y-4">
                    {children}
                    
                    {paginationLinks && paginationLinks.length > 0 && (
                        <div className="flex justify-end pt-4 border-t border-border/40">
                            <Pagination links={paginationLinks} />
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
