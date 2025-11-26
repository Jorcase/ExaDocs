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
import { Link, router, usePage } from '@inertiajs/react';
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
    Bell,
    ImageIcon,
    BarChart3,
} from 'lucide-react';
import AppLogo from './app-logo';
import { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { AlertBell } from './alert-bell';
import { route } from 'ziggy-js';
import { usePermissions } from '@/hooks/use-permissions';
import { useSidebar } from './ui/sidebar';

const topItems: NavItem[] = [
    { title: 'Home', href: dashboard(), icon: LayoutGrid },
    { title: 'Archivos', href: '/archivos', icon: BookOpen },
    { title: 'Mis cosas', href: '/mis-cosas', icon: Layers, permission: 'view_cosasuser' },
    { title: 'Perfil', href: route('perfil.show'), icon: Users },
    { title: 'Notificaciones', href: route('notificaciones.index'), icon: Bell, permission: 'view_notifipersonal' },
];

const mainNavGroups = [
    {
        title: 'Catálogos',
        items: [
            { title: 'Carrera', href: '/carrera', icon: Building, permission: 'view_catalogos' },
            { title: 'Materia', href: '/materia', icon: BookOpen, permission: 'view_catalogos' },
            { title: 'Plan Estudio', href: '/planes-estudio', icon: Layers, permission: 'view_catalogos' },
            { title: 'Perfiles', href: '/perfiles', icon: Users, permission: 'view_perfiles' },
            { title: 'Estadísticas', href: '/estadisticas', icon: BarChart3, permission: 'view_estadisticas' },
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
            { title: 'Notificaciones', href: route('admin.notificaciones.index'), icon: Bell ,permission: 'view_notificaciones'},
            { title: 'Carrusel', href: '/carousel', icon: ImageIcon ,permission: 'view_catalogos'},
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
    const [searchTerm, setSearchTerm] = useState('');
    const page = usePage();
    const { can } = usePermissions();
    const { state, toggleSidebar } = useSidebar();
    const notifications = (page.props as any).notifications;
    const bellItems = notifications?.items?.map((n: any) => ({
        id: n.id,
        titulo: n.titulo,
        mensaje: n.mensaje,
        created_at: n.created_at,
        leido: !!n.leido_en,
    })) ?? [];
    const bellUnread = notifications?.total_unread ?? 0;

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
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <div className="flex items-center justify-between px-2">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="lg"
                                asChild
                                className="bg-transparent hover:bg-sidebar-accent/40"
                            >
                                <Link href={dashboard()} prefetch preserveScroll>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    {state !== 'collapsed' && <AlertBell items={bellItems} total={bellUnread} />}
                </div>
                <SidebarMenu>
                    <SidebarMenuItem>
                        {state === 'collapsed' ? (
                            <SidebarMenuButton
                                size="lg"
                                className="h-10 w-10 items-center justify-center"
                                onClick={() => toggleSidebar()}
                                tooltip="Buscar"
                            >
                                <Search className="h-5 w-5" />
                            </SidebarMenuButton>
                        ) : (
                            <div className="relative px-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar archivo..."
                                    className="h-9 pl-9 text-sm focus-visible:ring-2 focus-visible:ring-[#bdd8f5] focus-visible:border-[#bdd8f5] dark:focus-visible:ring-[#1f2b3f] dark:focus-visible:border-[#1f2b3f]"
                                    aria-label="Buscar"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            router.get(route('archivos.index'), { search: searchTerm || undefined }, {
                                                preserveScroll: true,
                                            });
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {!can('view_cosasuser') && (
                    <div className="mx-3 mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 shadow-sm dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-50">
                        <p className="font-semibold leading-snug">Perfil incompleto</p>
                        <p className="leading-snug text-[11px] opacity-90">Completá tu perfil para desbloquear todo.</p>
                        <Link
                            href={route('perfil.edit')}
                            className="mt-2 inline-flex text-[11px] font-semibold text-amber-800 underline decoration-amber-500 hover:text-amber-900 dark:text-amber-200"
                            prefetch
                            preserveScroll
                        >
                            Ir a perfil
                        </Link>
                    </div>
                )}
                <NavMain items={topItems} groups={mainNavGroups} primarySize="lg" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
