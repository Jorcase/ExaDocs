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
    Search,
} from 'lucide-react';
import AppLogo from './app-logo';
import { useEffect } from 'react';
import { Input } from './ui/input';
import { AlertBell } from './alert-bell';

const topItems: NavItem[] = [
    { title: 'Home', href: dashboard(), icon: LayoutGrid },
    { title: 'Archivos', href: '/archivos', icon: BookOpen },
    { title: 'Mis cosas', href: '/mis-cosas', icon: Layers },
    { title: 'Perfil', href: '/perfil', icon: Users },
];

const mainNavGroups = [
    {
        title: 'Catálogos',
        items: [
            { title: 'Carrera', href: '/carrera', icon: Building, permission: 'view_catalogos' },
            { title: 'Materia', href: '/materia', icon: BookOpen, permission: 'view_catalogos' },
            { title: 'Plan Estudio', href: '/planes-estudio', icon: Layers, permission: 'view_catalogos' },
            { title: 'Perfiles', href: '/perfiles', icon: Users, permission: 'view_catalogos' },
            { title: 'Tipo Archivo', href: '/tipo-archivos', icon: FileSignature, permission: 'view_catalogos' },
            { title: 'Tipo Carrera', href: '/tipo-carreras', icon: Award, permission: 'view_tipocarrera' },
            { title: 'Estado Archivo', href: '/estado-archivos', icon: FileCheck, permission: 'view_estadoarchivo' },

        ] satisfies NavItem[],
    },
            {
        title: 'Moderación',
        items: [
            { title: 'Historial revisiones', href: '/historial-revisiones', icon: Wand2 ,permission: 'view_moderacion'},
            { title: 'Reportes', href: '/reportes', icon: ShieldCheck ,permission: 'view_moderacion'},
            { title: 'Comentarios', href: '/comentarios', icon: ClipboardList ,permission: 'view_moderacion'},
            { title: 'Valoraciones', href: '/valoraciones', icon: Star ,permission: 'view_moderacion'},
            { title: 'Permisos', href: '/permissions', icon: ClipboardList ,permission: 'view_permisos'},
            { title: 'Roles', href: '/roles', icon: ShieldCheck ,permission: 'view_roles'},
            { title: 'Usuarios', href: '/users', icon: Users ,permission: 'view_usuarios'},
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
                <div className="flex items-center justify-between px-2">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href={dashboard()} prefetch preserveScroll>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    <AlertBell />
                </div>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="relative px-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar..."
                                className="h-9 pl-9 text-sm"
                                aria-label="Buscar"
                            />
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={topItems} groups={mainNavGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
