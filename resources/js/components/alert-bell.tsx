import { Link } from '@inertiajs/react';
import { Bell, Check, Cog } from 'lucide-react';
import { useMemo } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

type NotificationItem = {
    id: number;
    titulo: string;
    mensaje?: string | null;
    created_at?: string;
    leido?: boolean;
};

type Props = {
    items?: NotificationItem[];
    total?: number;
};

export function AlertBell({ items = [], total }: Props) {
    const unreadCount = useMemo(() => {
        if (total !== undefined) return total;
        return items.filter((n) => !n.leido).length;
    }, [items, total]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 relative"
                    title="Notificaciones"
                >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between px-3 py-2">
                    <DropdownMenuLabel className="p-0 text-sm font-semibold">Notificaciones</DropdownMenuLabel>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Check className="h-4 w-4" />
                        <Cog className="h-4 w-4" />
                    </div>
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                    {items.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-muted-foreground">Sin notificaciones nuevas</div>
                    ) : (
                        items.map((n) => (
                            <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1">
                                <span className="text-sm font-medium">{n.titulo}</span>
                                {n.mensaje && <span className="text-xs text-muted-foreground line-clamp-2">{n.mensaje}</span>}
                                {n.created_at && (
                                    <span className="text-[11px] text-muted-foreground">Hace un momento</span>
                                )}
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="justify-center">
                    <Link href="/notificaciones" prefetch preserveScroll className="text-sm font-medium">
                        Ver todo
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
