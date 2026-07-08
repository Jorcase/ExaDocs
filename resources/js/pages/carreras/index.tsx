import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { DataTable } from '@/components/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, FileSpreadsheet, FileText } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useMemo, useState, useEffect } from 'react';
import { ListLayout } from '@/components/list-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Carreras',
        href: route('carreras.index'),
    },
];

interface Tipo {
    id: number;
    nombre: string;
}

interface Carrera {
    id: number;
    nombre: string;
    codigo: string;
    descripcion?: string | null;
    estado: 'activa' | 'inactiva';
    tipo_carrera_id: number | null;
    tipo_carrera?: Tipo | null;
}

interface CarrerasPaginated {
    data: Carrera[];
    links: Url[];
}

interface Filters {
    search?: string;
    codigo?: string;
    estado?: string[];
    tipo_carrera_ids?: number[];
    sort?: string;
    direction?: 'asc' | 'desc';
}

export default function Index({
    carreras,
    filters,
    tipos,
    codigos,
}: {
    carreras: CarrerasPaginated;
    filters?: Filters;
    tipos?: Tipo[];
    codigos?: string[];
}) {
    const { processing, delete: destroy } = useForm();
    const [open, setOpen] = useState(false);
    const [sort, setSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({
        column: filters?.sort ?? 'id',
        direction: (filters?.direction as 'asc' | 'desc') ?? 'desc',
    });

    const [localFilters, setLocalFilters] = useState({
        search: filters?.search ?? '',
        codigo: filters?.codigo ?? '',
        estado: filters?.estado ?? [],
        tipo_carrera_ids: filters?.tipo_carrera_ids ?? [],
    });

    const buildParams = (state: typeof localFilters, customSort?: { column: string; direction: 'asc' | 'desc' }) => ({
        search: state.search || undefined,
        codigo: state.codigo || undefined,
        estado: state.estado ?? [],
        tipo_carrera_ids: state.tipo_carrera_ids ?? [],
        sort: customSort?.column ?? sort.column,
        direction: customSort?.direction ?? sort.direction,
    });

    const applyFilters = (state: typeof localFilters) => {
        router.get(route('carreras.index'), buildParams(state), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    useEffect(() => {
        setLocalFilters({
            search: filters?.search ?? '',
            codigo: filters?.codigo ?? '',
            estado: filters?.estado ?? [],
            tipo_carrera_ids: filters?.tipo_carrera_ids ?? [],
        });
        setSort({
            column: filters?.sort ?? 'id',
            direction: (filters?.direction as 'asc' | 'desc') ?? 'desc',
        });
    }, [filters]);

    const filteredCodigos = useMemo(() => {
        if (!codigos || !localFilters.codigo) return [];
        return codigos
            .filter((c) => c.toLowerCase().includes(localFilters.codigo.toLowerCase()))
            .slice(0, 8);
    }, [codigos, localFilters.codigo]);

    const columns: ColumnDef<Carrera>[] = useMemo(
        () => [
            {
                accessorKey: 'id',
                header: () => (
                    <Button
                        variant="ghost"
                        className="px-0 font-semibold"
                        onClick={() => handleSort('id')}
                    >
                        ID
                        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                    </Button>
                ),
                cell: ({ getValue }) => <span className="font-medium">{getValue<number>()}</span>,
            },
            {
                accessorKey: 'nombre',
                header: () => (
                    <Button
                        variant="ghost"
                        className="px-0 font-semibold"
                        onClick={() => handleSort('nombre')}
                    >
                        Nombre
                        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="space-y-0.5">
                        <p className="font-semibold leading-tight text-slate-900 dark:text-slate-100">{row.original.nombre}</p>
                        {row.original.descripcion && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {row.original.descripcion}
                            </p>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: 'codigo',
                header: () => (
                    <Button
                        variant="ghost"
                        className="px-0 font-semibold"
                        onClick={() => handleSort('codigo')}
                    >
                        Código
                        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                    </Button>
                ),
                cell: ({ getValue }) => (
                    <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md border border-border/60">
                        {getValue<string>()}
                    </span>
                ),
            },
            {
                id: 'tipo',
                accessorFn: (row) => row.tipo_carrera?.nombre ?? '',
                header: () => (
                    <Button
                        variant="ghost"
                        className="px-0 font-semibold"
                        onClick={() => handleSort('tipo')}
                    >
                        Tipo
                        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                    </Button>
                ),
                cell: ({ getValue }) => getValue<string>() || '—',
            },
            {
                accessorKey: 'estado',
                header: () => (
                    <Button
                        variant="ghost"
                        className="px-0 font-semibold"
                        onClick={() => handleSort('estado')}
                    >
                        Estado
                        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                    </Button>
                ),
                cell: ({ getValue }) => <span className="capitalize text-xs font-semibold">{getValue<string>()}</span>,
            },
            {
                id: 'actions',
                header: 'Acciones',
                enableSorting: false,
                cell: ({ row }) => {
                    const carrera = row.original;
                    return (
                        <div className="flex w-full justify-end gap-2">
                            <Link href={route('carreras.edit', carrera.id)}>
                                <Button size="sm" variant="secondary" className="rounded-lg">
                                    Editar
                                </Button>
                            </Link>
                            <ConfirmDelete
                                description="La carrera se eliminará definitivamente de la base de datos."
                                disabled={processing}
                                onConfirm={() => destroy(route('carreras.destroy', carrera.id))}
                            >
                                <Button size="sm" variant="destructive" className="rounded-lg" disabled={processing}>
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

    const handleSort = (columnId: string, direction?: 'asc' | 'desc') => {
        const nextDirection =
            direction ??
            (sort.column === columnId && sort.direction === 'asc' ? 'desc' : 'asc');
        setSort({ column: columnId, direction: nextDirection });
        router.get(route('carreras.index'), buildParams(localFilters, { column: columnId, direction: nextDirection }), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Carreras | Gestión" />
            <ListLayout
                title="Gestión de Carreras"
                createHref={route('carreras.create')}
                createLabel="Crear carrera"
                paginationLinks={carreras.links}
                actions={
                    <>
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="rounded-lg">Filtros</Button>
                            </SheetTrigger>
                            <SheetContent className="space-y-6 sm:w-[420px]">
                                <SheetHeader>
                                    <SheetTitle>Filtrar carreras</SheetTitle>
                                </SheetHeader>
                                <div className="space-y-4 px-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="search">Nombre</Label>
                                        <Input
                                            id="search"
                                            value={localFilters.search}
                                            onChange={(e) =>
                                                setLocalFilters((prev) => ({
                                                    ...prev,
                                                    search: e.target.value,
                                                }))
                                            }
                                            placeholder="Buscar por nombre..."
                                            className="rounded-lg"
                                        />
                                    </div>
                                    <div className="space-y-2 relative">
                                        <Label htmlFor="codigo">Código</Label>
                                        <Input
                                            id="codigo"
                                            autoComplete="off"
                                            value={localFilters.codigo}
                                            onChange={(e) =>
                                                setLocalFilters((prev) => ({
                                                    ...prev,
                                                    codigo: e.target.value,
                                                }))
                                            }
                                            placeholder="Ej: ING-101"
                                            className="rounded-lg"
                                        />
                                        {localFilters.codigo && filteredCodigos.length > 0 && (
                                            <div className="absolute left-0 top-full z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border border-input bg-popover text-sm shadow-sm">
                                                {filteredCodigos.map((cod) => (
                                                    <button
                                                        key={cod}
                                                        type="button"
                                                        className="flex w-full items-center px-3 py-2 text-left hover:bg-muted"
                                                        onClick={() =>
                                                            setLocalFilters((prev) => ({
                                                                ...prev,
                                                                codigo: cod,
                                                            }))
                                                        }
                                                    >
                                                        {cod}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2 relative">
                                        <Label className="text-sm font-medium">Tipo de carrera</Label>
                                        <div className="grid grid-cols-1 gap-3 mt-1">
                                            {tipos?.map((tipo) => (
                                                <label
                                                    key={tipo.id}
                                                    className="flex items-center gap-2 text-sm cursor-pointer select-none"
                                                >
                                                    <Checkbox
                                                        checked={localFilters.tipo_carrera_ids?.includes(tipo.id)}
                                                        onCheckedChange={(checked) =>
                                                            setLocalFilters((prev) => {
                                                                const current = prev.tipo_carrera_ids ?? [];
                                                                return {
                                                                    ...prev,
                                                                    tipo_carrera_ids: checked
                                                                        ? [...current, tipo.id]
                                                                        : current.filter((t) => t !== tipo.id),
                                                                };
                                                            })
                                                        }
                                                    />
                                                    <span className="font-medium">{tipo.nombre}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Estado</Label>
                                        <div className="grid grid-cols-1 gap-3 mt-1">
                                            {[
                                                { value: 'activa', label: 'Activa' },
                                                { value: 'inactiva', label: 'Inactiva' },
                                            ].map((estado) => (
                                                <label
                                                    key={estado.value}
                                                    className="flex items-center gap-2 text-sm cursor-pointer select-none"
                                                >
                                                    <Checkbox
                                                        checked={localFilters.estado?.includes(estado.value)}
                                                        onCheckedChange={(checked) => {
                                                            setLocalFilters((prev) => {
                                                                const current = prev.estado ?? [];
                                                                return {
                                                                    ...prev,
                                                                    estado: checked
                                                                        ? [...current, estado.value]
                                                                        : current.filter((e) => e !== estado.value),
                                                                };
                                                            });
                                                        }}
                                                    />
                                                    <span className="font-medium">{estado.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <SheetFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                                    <SheetClose asChild>
                                        <Button
                                            variant="ghost"
                                            type="button"
                                            className="rounded-lg"
                                            onClick={() => {
                                                const cleaned = {
                                                    search: '',
                                                    codigo: '',
                                                    estado: [],
                                                    tipo_carrera_ids: [],
                                                };
                                                setLocalFilters(cleaned);
                                                applyFilters(cleaned);
                                            }}
                                        >
                                            Limpiar
                                        </Button>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Button
                                            type="button"
                                            className="rounded-lg"
                                            onClick={() => {
                                                applyFilters(localFilters);
                                            }}
                                        >
                                            Aplicar filtros
                                        </Button>
                                    </SheetClose>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                        {open || localFilters.search || localFilters.codigo || localFilters.estado.length > 0 || localFilters.tipo_carrera_ids.length > 0 ? (
                            <Button
                                variant="secondary"
                                className="rounded-lg"
                                type="button"
                                onClick={() => {
                                    const cleaned = {
                                        search: '',
                                        codigo: '',
                                        estado: [],
                                        tipo_carrera_ids: [],
                                    };
                                    setLocalFilters(cleaned);
                                    applyFilters(cleaned);
                                }}
                            >
                                Limpiar Filtros
                            </Button>
                        ) : null}
                        <a
                            href={route('carreras.report', buildParams(localFilters))}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Button
                                variant="outline"
                                size="icon"
                                className="border-red-500/20 bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:border-red-500/30 dark:bg-red-500/20 dark:text-red-400 rounded-lg"
                            >
                                <FileText className="h-4 w-4" />
                            </Button>
                        </a>
                        <a
                            href={route('carreras.export', buildParams(localFilters))}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Button
                                variant="outline"
                                size="icon"
                                className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-lg"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                            </Button>
                        </a>
                    </>
                }
            >
                <DataTable
                    columns={columns}
                    data={carreras.data}
                    filterKey="nombre"
                    placeholder="Buscar por nombre..."
                    externalSort={sort}
                    onSortChange={(col, dir) => {
                        if (!col || !dir) return;
                        handleSort(col, dir as 'asc' | 'desc');
                    }}
                />
            </ListLayout>
        </AppLayout>
    );
}
