import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import Pagination from '@/components/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { route } from 'ziggy-js';
import { ListSection } from '@/components/list-section';
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
                    <div>
                        <p className="font-semibold leading-tight">{row.original.nombre}</p>
                        {row.original.descripcion && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
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
                cell: ({ getValue }) => <span className="capitalize">{getValue<string>()}</span>,
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
                                <Button size="sm" variant="secondary">
                                    Editar
                                </Button>
                            </Link>
                            <ConfirmDelete
                                description="La carrera se eliminará definitivamente."
                                disabled={processing}
                                onConfirm={() => destroy(route('carreras.destroy', carrera.id))}
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
            <Head title="Carreras | Listado" />
            <div className="m-4 space-y-4">
                <section className="rounded-2xl border border-border/60 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
                    <ListSection
                        title="Carreras"
                        description="Controla las carreras habilitadas, su tipo y estado."
                        actions={
                            <Link href={route('carreras.create')}>
                                <Button>Crear carrera</Button>
                            </Link>
                        }
                    />
                </section>
                <Card className="border-2 border-border/70 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-4 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
                    <CardContent className="space-y-4">
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
                            endActions={
                                <>
                                    <Sheet open={open} onOpenChange={setOpen}>
                                        <SheetTrigger asChild>
                                            <Button variant="outline">Filtros</Button>
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
                                                    <Label>Tipo de carrera</Label>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {tipos?.map((tipo) => (
                                                            <label
                                                                key={tipo.id}
                                                                className="flex items-center gap-2 text-sm"
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
                                                                {tipo.nombre}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Estado</Label>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {[
                                                            { value: 'activa', label: 'Activa' },
                                                            { value: 'inactiva', label: 'Inactiva' },
                                                        ].map((estado) => (
                                                            <label
                                                                key={estado.value}
                                                                className="flex items-center gap-2 text-sm"
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
                                                                {estado.label}
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
                                    <Button
                                        variant="secondary"
                                        className="bg-white text-slate-900 hover:bg-muted"
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
                                        Limpiar
                                    </Button>
                                    <a
                                        href={route('carreras.report', buildParams(localFilters))}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
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
                                            className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                                        >
                                            <FileSpreadsheet className="h-4 w-4" />
                                        </Button>
                                    </a>
                                </>
                            }
                        />
                        <div className="flex justify-end">
                            <Pagination links={carreras.links} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
