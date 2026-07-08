import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn, isSameUrl, resolveUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage, router } from '@inertiajs/react';
import { BookOpen, LayoutGrid, Menu, Search, Layers, Bell } from 'lucide-react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';
import { CarreraSelector } from './carrera-selector';
import { AlertBell } from './alert-bell';

const mainNavItems: NavItem[] = [
    {
        title: 'Inicio',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Archivos',
        href: '/archivos',
        icon: BookOpen,
    },
    {
        title: 'Mis Cosas',
        href: '/mis-cosas',
        icon: Layers,
    },
];

const activeItemStyles =
    'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();

    const notifications = page.props.notifications;
    const bellItems = notifications?.items?.map((n: any) => ({
        id: n.id,
        titulo: n.titulo,
        mensaje: n.mensaje,
        created_at: n.created_at,
        leido: !!n.leido_en,
    })) ?? [];
    const bellUnread = notifications?.total_unread ?? 0;
    return (
        <div className="sticky top-0 z-50 w-full shadow-xs">
            <div className="border-b border-[#002b5c] bg-[#002045] text-white dark:bg-[#0b121f] dark:text-foreground dark:border-outline-variant/40">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 h-[34px] w-[34px] text-white/80 hover:text-white hover:bg-white/10 dark:text-foreground"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar"
                            >
                                <SheetTitle className="sr-only">
                                    Navigation Menu
                                </SheetTitle>
                                <SheetHeader className="sr-only">
                                    <SheetHeader>Menu Móvil</SheetHeader>
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-4">
                                            {mainNavItems.map((item) => (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    className="flex items-center space-x-2 font-medium"
                                                >
                                                    {item.icon && (
                                                        <Icon
                                                            iconNode={item.icon}
                                                            className="h-5 w-5"
                                                        />
                                                    )}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={dashboard()}
                            prefetch
                            className="flex items-center space-x-2 shrink-0 text-white"
                        >
                            <AppLogo />
                        </Link>
                        <div className="hidden sm:block">
                            <CarreraSelector />
                        </div>
                    </div>

                    {/* Global Search Input in the center */}
                    <div className="flex-1 max-w-sm mx-6 hidden md:block">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60 dark:text-muted-foreground pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Buscar archivos..."
                                className="w-full h-9 pl-9 pr-4 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 hover:bg-white/15 dark:border-border dark:bg-neutral-900/50 dark:hover:bg-neutral-900 dark:text-foreground dark:placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-blue-500/20 transition"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const val = e.currentTarget.value.trim();
                                        if (val) {
                                            router.get('/archivos', { search: val });
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="ml-auto hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        className="relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                'h-9 cursor-pointer px-3 rounded-lg text-sm font-semibold inline-flex items-center transition',
                                                isSameUrl(page.url, item.href)
                                                    ? 'bg-white/15 text-white dark:bg-white/15 dark:text-white'
                                                    : 'text-white/80 hover:text-white hover:bg-white/5 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10'
                                            )}
                                        >
                                            {item.icon && (
                                                <Icon
                                                    iconNode={item.icon}
                                                    className="mr-2 h-4 w-4"
                                                />
                                            )}
                                            {item.title}
                                        </Link>
                                        {isSameUrl(page.url, item.href) && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-white dark:bg-blue-400"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-4 flex items-center space-x-2">
                        {/* Mobile Search Button (visible only on mobile) */}
                        <div className="md:hidden">
                            <Link href="/archivos">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10"
                                >
                                    <Search className="h-5 w-5 opacity-80" />
                                </Button>
                            </Link>
                        </div>

                        {/* Notification Bell */}
                        <AlertBell
                            items={bellItems}
                            total={bellUnread}
                            className="h-9 w-9 rounded-lg text-white/80 hover:text-white hover:bg-white/10 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10"
                        />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-10 rounded-full p-1"
                                >
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={auth.user.avatar}
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70 bg-background/95 backdrop-blur-md">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </div>
    );
}
