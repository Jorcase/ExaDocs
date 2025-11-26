import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    navMenu?: ReactNode;
}

export default ({ children, breadcrumbs, navMenu, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} navMenu={navMenu} {...props}>
        {children}
    </AppLayoutTemplate>
);
