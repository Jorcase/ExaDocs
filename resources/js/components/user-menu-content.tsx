import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import { type User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { LogOut, Settings, ShieldAlert, Sun, Moon, Monitor, User as UserIcon } from 'lucide-react';
import { route } from 'ziggy-js';
import { useAppearance } from '@/hooks/use-appearance';
import { usePermissions } from '@/hooks/use-permissions';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const { appearance, updateAppearance } = useAppearance();
    const { can } = usePermissions();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    const getCurrentIcon = () => {
        switch (appearance) {
            case 'dark':
                return <Moon className="mr-2 h-4 w-4" />;
            case 'light':
                return <Sun className="mr-2 h-4 w-4" />;
            default:
                return <Monitor className="mr-2 h-4 w-4" />;
        }
    };

    const showAdmin = can('view_catalogos') || can('view_moderacion') || can('view_usuarios') || can('view_roles') || can('view_permisos');

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={route('perfil.show')}
                        onClick={cleanup}
                    >
                        <UserIcon className="mr-2 h-4 w-4" />
                        Mi Perfil
                    </Link>
                </DropdownMenuItem>
                {showAdmin && (
                    <DropdownMenuItem asChild>
                        <Link
                            className="block w-full cursor-pointer"
                            href="/carrera"
                            onClick={cleanup}
                        >
                            <ShieldAlert className="mr-2 h-4 w-4 text-primary dark:text-sky-400" />
                            Panel de Administración
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={edit()}
                        as="button"
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2 h-4 w-4" />
                        Configuración
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="cursor-pointer">
                        {getCurrentIcon()}
                        <span>Apariencia</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent className="w-40">
                            <DropdownMenuItem onClick={() => updateAppearance('light')} className="cursor-pointer">
                                <Sun className="mr-2 h-4 w-4" />
                                <span>Modo Claro</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateAppearance('dark')} className="cursor-pointer">
                                <Moon className="mr-2 h-4 w-4" />
                                <span>Modo Oscuro</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateAppearance('system')} className="cursor-pointer">
                                <Monitor className="mr-2 h-4 w-4" />
                                <span>Sistema</span>
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full cursor-pointer"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                </Link>
            </DropdownMenuItem>
        </>
    );
}
