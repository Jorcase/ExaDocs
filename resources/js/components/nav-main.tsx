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
}

export function NavMain({ items = [], groups }: Props) {
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

    const renderItems = (list: NavItem[]) => (
        <SidebarMenu>
            {list.map((item) => (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                        asChild
                        isActive={page.url.startsWith(resolveUrl(item.href))}
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
    );

    return (
        <div className="space-y-1">
            {filteredItems.length > 0 && (
                <SidebarMenu className="px-2 py-0">
                    {filteredItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={page.url.startsWith(resolveUrl(item.href))}
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
                                        <SidebarMenuButton>
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
                                                        isActive={page.url.startsWith(resolveUrl(item.href))}
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
