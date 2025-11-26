import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { type ReactNode } from 'react';

export function AppSidebarHeader({
    breadcrumbs = [],
    navMenu,
}: {
    breadcrumbs?: BreadcrumbItemType[];
    navMenu?: ReactNode;
}) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 bg-[#edf1f7] px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 dark:bg-[#0b0c0f]/90">
            <div className="flex flex-1 items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            {navMenu && <div className="flex flex-1 justify-center">{navMenu}</div>}
            <div className="flex flex-1 justify-end" />
        </header>
    );
}
