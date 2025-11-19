import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Award,
    Building,
    BookOpen,
    ClipboardList,
    FileCheck,
    FileSignature,
    FileText,
    Folder,
    Layers,
    LayoutGrid,
    ShieldCheck,
    Star,
    Users,
    Wand2,
} from 'lucide-react';
import AppLogo from './app-logo';
import { useEffect } from 'react';

const mainNavGroups = [
    {
        title: 'Operación',
        items: [
            { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
            { title: 'Archivos', href: '/archivos', icon: BookOpen },
        ] satisfies NavItem[],
    },
    {
        title: 'Catálogos',
        items: [
            { title: 'Carrera', href: '/carrera', icon: Building },
            { title: 'Materia', href: '/materia', icon: BookOpen },
            { title: 'Plan Estudio', href: '/planes-estudio', icon: Layers },
            { title: 'Perfiles', href: '/perfiles', icon: Users },
            { title: 'Tipo Carrera', href: '/tipo-carreras', icon: Award },
            { title: 'Tipo Archivo', href: '/tipo-archivos', icon: FileSignature },
            { title: 'Estado Archivo', href: '/estado-archivos', icon: FileCheck },

        ] satisfies NavItem[],
    },
            {
                title: 'Moderación',
                items: [
                    { title: 'Historial revisiones', href: '/historial-revisiones', icon: Wand2 },
                    { title: 'Reportes', href: '/reportes', icon: ShieldCheck },
                    { title: 'Comentarios', href: '/comentarios', icon: ClipboardList },
                    { title: 'Valoraciones', href: '/valoraciones', icon: Star },
                    { title: 'Roles', href: '/roles', icon: ShieldCheck },
                    { title: 'Permisos', href: '/permissions', icon: ClipboardList },
                ] satisfies NavItem[],
            },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/Jorcase/ExaDocs',
        icon: Folder,
    },
];

export function AppSidebar() {
    const scrollKey = 'sidebar:scrollTop';

    useEffect(() => {
        const el = document.querySelector<HTMLElement>('[data-sidebar=content]');
        if (!el) return;

        const saved = sessionStorage.getItem(scrollKey);
        if (saved) {
            el.scrollTop = Number(saved) || 0;
        }

        const onScroll = () => {
            sessionStorage.setItem(scrollKey, String(el.scrollTop));
        };

        el.addEventListener('scroll', onScroll);
        return () => el.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch preserveScroll>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={mainNavGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
