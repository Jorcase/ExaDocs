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
import { ChevronDown } from 'lucide-react';

interface Props {
    items?: NavItem[];
    groups?: NavGroup[];
}

export function NavMain({ items = [], groups }: Props) {
    const page = usePage();

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

    if (groups && groups.length > 0) {
        return (
            <div className="space-y-1">
                {groups.map((group) => (
                    <SidebarMenu key={group.title} className="px-2 py-0">
                        <Collapsible defaultOpen className="group/collapsible">
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
            </div>
        );
    }

    return (
        <SidebarMenu className="px-2 py-0">
            {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                        asChild
                        isActive={page.url.startsWith(resolveUrl(item.href))}
                        tooltip={{ children: item.title }}
                    >
                        <Link href={item.href} prefetch>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );
}
