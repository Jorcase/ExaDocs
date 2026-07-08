import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { type ReactNode, useMemo } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Link, usePage } from '@inertiajs/react';
import {
    Award,
    Building,
    BookOpen,
    ClipboardList,
    FileCheck,
    FileSignature,
    Layers,
    ShieldCheck,
    Star,
    Users,
    Wand2,
    Bell,
    ImageIcon,
    BarChart3,
} from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    navMenu?: ReactNode;
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    const page = usePage<SharedData>();
    const currentUrl = page.url;
    const { can } = usePermissions();

    const menuGroups = useMemo(() => {
        const groups = [
            {
                title: 'Catálogos',
                items: [
                    { title: 'Carreras', href: '/carrera', icon: Building, permission: 'view_catalogos' },
                    { title: 'Materias', href: '/materia', icon: BookOpen, permission: 'view_catalogos' },
                    { title: 'Planes de Estudio', href: '/planes-estudio', icon: Layers, permission: 'view_catalogos' },
                    { title: 'Perfiles', href: '/perfiles', icon: Users, permission: 'view_perfiles' },
                    { title: 'Estadísticas', href: '/estadisticas', icon: BarChart3, permission: 'view_estadisticas' },
                    { title: 'Tipos de Archivo', href: '/tipo-archivos', icon: FileSignature, permission: 'view_catalogos' },
                    { title: 'Tipos de Carrera', href: '/tipo-carreras', icon: Award, permission: 'view_tipocarrera' },
                    { title: 'Estados de Archivo', href: '/estado-archivos', icon: FileCheck, permission: 'view_estadoarchivo' },
                ],
            },
            {
                title: 'Moderación y Roles',
                items: [
                    { title: 'Revisiones', href: '/historial-revisiones', icon: Wand2, permission: 'view_moderacion' },
                    { title: 'Reportes', href: '/reportes', icon: ShieldCheck, permission: 'view_moderacion' },
                    { title: 'Comentarios', href: '/comentarios', icon: ClipboardList, permission: 'view_moderacion' },
                    { title: 'Valoraciones', href: '/valoraciones', icon: Star, permission: 'view_moderacion' },
                    { title: 'Notificaciones', href: '/admin/notificaciones', icon: Bell, permission: 'view_notificaciones' },
                    { title: 'Carrusel', href: '/carousel', icon: ImageIcon, permission: 'view_catalogos' },
                    { title: 'Permisos', href: '/permissions', icon: ClipboardList, permission: 'view_permisos' },
                    { title: 'Roles', href: '/roles', icon: ShieldCheck, permission: 'view_roles' },
                    { title: 'Usuarios', href: '/users', icon: Users, permission: 'view_usuarios' },
                ],
            },
        ];

        // Filtrar items según permisos del usuario
        return groups.map(group => ({
            ...group,
            items: group.items.filter(item => !item.permission || can(item.permission))
        })).filter(group => group.items.length > 0);
    }, [can]);

    const isLinkActive = (href: string) => {
        return currentUrl === href || currentUrl.startsWith(href + '/') || currentUrl.startsWith(href + '?');
    };

    // Detectar si la URL actual corresponde al panel administrativo
    const isAdminUrl = useMemo(() => {
        const adminPaths = [
            '/carrera',
            '/carreras',
            '/materia',
            '/materias',
            '/planes-estudio',
            '/perfiles',
            '/estadisticas',
            '/tipo-archivos',
            '/tipo-carreras',
            '/estado-archivos',
            '/historial-revisiones',
            '/reportes',
            '/comentarios',
            '/valoraciones',
            '/admin/notificaciones',
            '/carousel',
            '/permissions',
            '/roles',
            '/users',
        ];
        return adminPaths.some(prefix => currentUrl === prefix || currentUrl.startsWith(prefix + '/') || currentUrl.startsWith(prefix + '?'));
    }, [currentUrl]);

    if (isAdminUrl) {
        return (
            <AppHeaderLayout breadcrumbs={undefined} {...props}>
                <div className="mx-auto flex w-full max-w-7xl items-stretch gap-6 px-4 py-6 md:px-6">
                    {/* Left Admin Sidebar */}
                    <aside className="w-64 shrink-0 space-y-6 border-r border-border/60 pr-6 hidden md:block">
                        {menuGroups.map((group, groupIdx) => (
                            <div key={groupIdx} className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 px-3">
                                    {group.title}
                                </h4>
                                <ul className="space-y-1">
                                    {group.items.map((item, itemIdx) => {
                                        const IconComponent = item.icon;
                                        const active = isLinkActive(item.href);
                                        return (
                                            <li key={itemIdx}>
                                                <Link
                                                    href={item.href}
                                                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                                                        active
                                                            ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-sky-300 font-semibold'
                                                            : 'text-foreground/75 hover:bg-muted hover:text-foreground'
                                                    }`}
                                                >
                                                    <IconComponent className="h-4 w-4" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </aside>

                    {/* Right Content */}
                    <main className="flex-1 min-w-0 space-y-6">
                        {breadcrumbs && breadcrumbs.length > 1 && (
                            <div className="flex h-10 items-center justify-start text-neutral-500 border-b border-border/60 pb-3 mb-2 animate-in fade-in">
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>
                        )}
                        {children}
                    </main>
                </div>
            </AppHeaderLayout>
        );
    }

    return (
        <AppHeaderLayout breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppHeaderLayout>
    );
}
