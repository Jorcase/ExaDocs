import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import Pagination from '@/components/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { route } from 'ziggy-js';
import { DataTable } from '@/components/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { ListSection } from '@/components/list-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tipos de archivo',
        href: route('tipo-archivos.index'),
    },
];

interface TipoArchivo {
    id: number;
    nombre: string;
    descripcion?: string | null;
}

interface TiposPaginated {
    data: TipoArchivo[];
    links: Url[];
}

interface Filters {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
}

export default function Index({ tipos, filters }: { tipos: TiposPaginated; filters?: Filters }) {
    const { processing, delete: destroy } = useForm();
    const [sort, setSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({
        column: filters?.sort ?? 'id',
        direction: (filters?.direction as 'asc' | 'desc') ?? 'desc',
    });

    const buildParams = (customSort?: { column: string; direction: 'asc' | 'desc' }) => ({
        sort: customSort?.column ?? sort.column,
        direction: customSort?.direction ?? sort.direction,
    });

    useEffect(() => {
        setSort({
            column: filters?.sort ?? 'id',
            direction: (filters?.direction as 'asc' | 'desc') ?? 'desc',
        });
    }, [filters]);

    const handleSort = (columnId: string, direction: 'asc' | 'desc') => {
        setSort({ column: columnId, direction });
        router.get(
            route('tipo-archivos.index'),
            buildParams({ column: columnId, direction }),
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const columns: ColumnDef<TipoArchivo>[] = useMemo(
        () => [
            {
                accessorKey: 'id',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        className="px-0 font-semibold"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        ID
                        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                    </Button>
                ),
                cell: ({ getValue }) => <span className="font-medium">{getValue<number>()}</span>,
            },
            {
                accessorKey: 'nombre',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        className="px-0 font-semibold"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Nombre
                        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                    </Button>
                ),
            },
            {
                accessorKey: 'descripcion',
                header: <span className="pl-1">Descripción</span>,
                cell: ({ getValue }) => getValue<string>() ?? <span className="text-muted-foreground">Sin detalle</span>,
            },
            {
                id: 'actions',
                header: <div className="text-right">Acciones</div>,
                enableSorting: false,
                cell: ({ row }) => {
                    const tipo = row.original;
                    return (
                        <div className="flex w-full justify-end gap-2 pr-1">
                            <Link href={route('tipo-archivos.edit', tipo.id)}>
                                <Button size="sm" variant="secondary">
                                    Editar
                                </Button>
                            </Link>
                            <ConfirmDelete
                                disabled={processing}
                                onConfirm={() =>
                                    destroy(route('tipo-archivos.destroy', tipo.id))
                                }
                                description="El tipo de archivo se eliminará definitivamente."
                            >
                                <Button size="sm" variant="destructive" disabled={processing}>
                                    Eliminar
                                </Button>
                            </ConfirmDelete>
                        </div>
                    );
                },
            },
        ],
        [destroy, processing],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tipos de archivo | Listado" />
            <div className="m-4 space-y-4">
                <section className="rounded-2xl border border-border/60 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
                    <ListSection
                        title="Tipo de archivos"
                        description="Catálogo de formatos permitidos"
                        actions={
                            <Link href={route('tipo-archivos.create')}>
                                <Button>Crear tipo</Button>
                            </Link>
                        }
                    />
                </section>
                <Card className="border-2 border-border/70 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-4 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
                    <CardContent className="space-y-4">
                        <DataTable
                            columns={columns}
                            data={tipos.data}
                            filterKey="nombre"
                            placeholder="Buscar por nombre..."
                            externalSort={sort}
                            onSortChange={(col, dir) => {
                                if (!col || !dir) return;
                                handleSort(col, dir as 'asc' | 'desc');
                            }}
                        />
                        <div className="flex justify-end">
                            <Pagination links={tipos.links} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
