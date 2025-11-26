import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { resolveUrl } from '@/lib/utils';
import { type NavGroup, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';

interface Props {
    items?: NavItem[];
    groups?: NavGroup[];
    primarySize?: 'md' | 'lg';
}

export function NavMain({ items = [], groups, primarySize = 'md' }: Props) {
    const page = usePage();
    const storageKey = 'sidebar:groups-open';
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const { can } = usePermissions();

    const filteredItems = useMemo(
        () => items.filter((item) => !item.permission || can(item.permission)),
        [items, can],
    );

    const filteredGroups = useMemo(() => {
        if (!groups) return [];
        return groups
            .map((g) => ({
                ...g,
                items: g.items.filter((item) => !item.permission || can(item.permission)),
            }))
            .filter((g) => g.items.length > 0);
    }, [groups, can]);

    useEffect(() => {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) {
            try {
                setOpenGroups(JSON.parse(saved));
            } catch {
                setOpenGroups({});
            }
        }
    }, []);

    const handleToggle = (title: string, value: boolean) => {
        setOpenGroups((prev) => {
            const next = { ...prev, [title]: value };
            sessionStorage.setItem(storageKey, JSON.stringify(next));
            return next;
        });
    };

    const primaryClasses =
        primarySize === 'lg'
            ? 'h-12 text-[15px] font-semibold [&_svg]:h-5 [&_svg]:w-5 [&_span]:truncate data-[active=true]:bg-[#bdd8f5] data-[active=true]:text-[#0b1930] dark:data-[active=true]:bg-[#1f2b3f] dark:data-[active=true]:text-white data-[active=true]:shadow-sm'
            : undefined;
    const subActiveClasses =
        'data-[active=true]:bg-[#bdd8f5] data-[active=true]:text-[#0b1930] dark:data-[active=true]:bg-[#1f2b3f] dark:data-[active=true]:text-white';

    const normalizePath = (raw: string): string => {
        try {
            const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
            return raw.startsWith('http') ? new URL(raw).pathname : new URL(raw, base).pathname;
        } catch {
            return raw.split('?')[0].split('#')[0];
        }
    };

    const isActiveHref = (href: NavItem['href']): boolean => {
        const targetPath = normalizePath(resolveUrl(href));
        const currPath = normalizePath(page.url || '');
        if (targetPath === '/') return currPath === '/';
        return currPath === targetPath || currPath.startsWith(targetPath.endsWith('/') ? targetPath : `${targetPath}/`);
    };

    return (
        <div className="space-y-1">
            {filteredItems.length > 0 && (
                <SidebarMenu className="px-2 py-0">
                    {filteredItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                className={primaryClasses}
                                asChild
                                isActive={isActiveHref(item.href)}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href} prefetch preserveScroll>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            )}

            {filteredGroups.length > 0 && (
                <>
                    {filteredGroups.map((group) => (
                        <SidebarMenu key={group.title} className="px-2 py-0">
                            <Collapsible
                                className="group/collapsible"
                                open={openGroups[group.title] ?? true}
                                onOpenChange={(val) => handleToggle(group.title, val)}
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            className={primaryClasses}
                                            isActive={group.items.some((g) => isActiveHref(g.href))}
                                        >
                                            <div className="flex items-center gap-2">
                                                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
                                                <span className="font-semibold">{group.title}</span>
                                            </div>
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {group.items.map((item) => (
                                                <SidebarMenuSubItem key={item.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        className={subActiveClasses}
                                                        isActive={isActiveHref(item.href)}
                                                    >
                                                        <Link href={item.href} prefetch preserveScroll>
                                                            {item.icon && <item.icon />}
                                                            <span>{item.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        </SidebarMenu>
                    ))}
                </>
            )}
        </div>
    );
}
