import { type Url } from '@/types';
import { Link } from '@inertiajs/react';

export default function Pagination({ links }: { links: Url[] }) {
    if (!links || links.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center justify-center gap-1">
            {links.map((link, index) => (
                <Link
                    key={`${link.label}-${index}`}
                    href={link.url ?? '#'}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`rounded border px-3 py-1 text-sm transition
                        ${link.active ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-muted'}
                        ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                />
            ))}
        </div>
    );
}
