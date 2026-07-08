import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { DataTable } from '@/components/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetClose,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ListLayout } from '@/components/list-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Planes de estudio',
        href: route('planes-estudio.index'),
    },
];

interface Plan {
    id: number;
    nombre: string;
    anio_plan: number;
    estado: 'vigente' | 'no_vigente' | 'discontinuado';
    optativas_requeridas?: number;
    carrera?: {
        id: number;
        nombre: string;
    };
}

interface PlanesPaginated {
    data: Plan[];
    links: Url[];
}

interface Filters {
    search?: string;
    anio?: number | string | null;
    estado?: string[];
    carrera_id?: number | null;
    carrera_nombre?: string | null;
    sort?: string;
    direction?: 'asc' | 'desc';
}

interface CarreraOption {
    id: number;
    nombre: string;
}

export default function Index({
    planes,
    filters,
    carreras,
}: {
    planes: PlanesPaginated;
    filters?: Filters;
    carreras?: CarreraOption[];
}) {
    const { processing, delete: destroy } = useForm();
    const [open, setOpen] = useState(false);
    const [sort, setSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({
        column: filters?.sort ?? 'id',
        direction: (filters?.direction as 'asc' | 'desc') ?? 'desc',
    });
    const [showCarreraSuggestions, setShowCarreraSuggestions] = useState(false);

    const [localFilters, setLocalFilters] = useState({
        search: filters?.search ?? '',
        anio: filters?.anio ?? '',
        estado: filters?.estado ?? [],
        carrera_id: filters?.carrera_id ?? null,
        carrera_nombre: filters?.carrera_nombre ?? '',
    });

    const buildParams = (state: typeof localFilters, customSort?: { column: string; direction: 'asc' | 'desc' }) => ({
        search: state.search || undefined,
        anio: state.anio || undefined,
        carrera_id: state.carrera_id ?? undefined,
        estado: state.estado ?? [],
        sort: customSort?.column ?? sort.column,
        direction: customSort?.direction ?? sort.direction,
    });

    const applyFilters = (state: typeof localFilters) => {
        router.get(route('planes-estudio.index'), buildParams(state), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    useEffect(() => {
        setLocalFilters((prev) => ({
            ...prev,
            search: filters?.search ?? '',
            anio: filters?.anio ?? '',
            estado: filters?.estado ?? [],
            carrera_id: filters?.carrera_id ?? null,
            carrera_nombre: filters?.carrera_nombre ?? '',
        }));
        setSort({
            column: filters?.sort ?? 'id',
            direction: (filters?.direction as 'asc' | 'desc') ?? 'desc',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const handleSort = (columnId: string, direction: 'asc' | 'desc') => {
        setSort({ column: columnId, direction });
        router.get(
            route('planes-estudio.index'),
            buildParams(localFilters, { column: columnId, direction }),
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const filteredCarreras = useMemo(() => {
        if (!carreras) return [];
        if (!localFilters.carrera_nombre?.trim()) return [];
        return carreras
            .filter((c) =>
                c.nombre.toLowerCase().includes(localFilters.carrera_nombre.toLowerCase())
            )
            .slice(0, 8);
    }, [carreras, localFilters.carrera_nombre]);

    const hideSuggestions =
        filteredCarreras.length === 1 &&
        localFilters.carrera_id &&
        filteredCarreras[0].id === localFilters.carrera_id &&
        filteredCarreras[0].nombre.toLowerCase() === localFilters.carrera_nombre.trim().toLowerCase();

    const columns: ColumnDef<Plan>[] = useMemo(
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
                cell: ({ getValue }) => <span className="font-semibold text-slate-900 dark:text-slate-100">{getValue<string>()}</span>,
            },
            {
                accessorKey: 'anio_plan',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        className="px-0 font-semibold"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Año
                        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                    </Button>
                ),
            },
            {
                accessorKey: 'optativas_requeridas',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        className="px-0 font-semibold"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Optativas
                        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                    </Button>
                ),
                cell: ({ getValue }) => <span className="font-medium">{getValue<number>() ?? 0}</span>,
            },
            {
                accessorKey: 'estado',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        className="px-0 font-semibold"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Estado
                        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                    </Button>
                ),
                cell: ({ getValue }) => <span className="capitalize text-xs font-semibold">{getValue<string>()}</span>,
            },
            {
                id: 'carrera',
                accessorFn: (row) => row.carrera?.nombre ?? '',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        className="px-0 font-semibold"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Carrera
                        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                    </Button>
                ),
                cell: ({ getValue }) => getValue<string>() || '—',
            },
            {
                id: 'actions',
                header: 'Acciones',
                enableSorting: false,
                cell: ({ row }) => {
                    const plan = row.original;
                    return (
                        <div className="flex w-full justify-end gap-2">
                            <Link href={route('planes-estudio.edit', plan.id)}>
                                <Button size="sm" variant="secondary" className="rounded-lg">
                                    Editar
                                </Button>
                            </Link>
                            <ConfirmDelete
                                disabled={processing}
                                onConfirm={() => destroy(route('planes-estudio.destroy', plan.id))}
                                description="El plan de estudio se eliminará definitivamente de la base de datos."
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Planes de estudio | Gestión" />
            <ListLayout
                title="Gestión de Planes de estudio"
                createHref={route('planes-estudio.create')}
                createLabel="Crear plan"
                paginationLinks={planes.links}
                actions={
                    <>
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="rounded-lg">Filtros</Button>
                            </SheetTrigger>
                            <SheetContent className="space-y-6 sm:w-[420px]">
                                <SheetHeader>
                                    <SheetTitle>Filtrar planes</SheetTitle>
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
                                    <div className="space-y-2">
                                        <Label htmlFor="anio">Año</Label>
                                        <Input
                                            id="anio"
                                            type="number"
                                            value={localFilters.anio ?? ''}
                                            onChange={(e) =>
                                                setLocalFilters((prev) => ({
                                                    ...prev,
                                                    anio: e.target.value,
                                                }))
                                            }
                                            placeholder="Ej: 2024"
                                            className="rounded-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Estado</Label>
                                        <div className="grid grid-cols-1 gap-3 mt-1">
                                            {[
                                                { value: 'vigente', label: 'Vigente' },
                                                { value: 'no_vigente', label: 'No vigente' },
                                                { value: 'discontinuado', label: 'Discontinuado' },
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
                                    <div className="space-y-2 relative overflow-visible">
                                        <Label htmlFor="carrera">Carrera</Label>
                                        <Input
                                            id="carrera"
                                            autoComplete="off"
                                            value={localFilters.carrera_nombre}
                                            onChange={(e) =>
                                                setLocalFilters((prev) => ({
                                                    ...prev,
                                                    carrera_nombre: e.target.value,
                                                    carrera_id: null,
                                                }))
                                            }
                                            onFocus={() => setShowCarreraSuggestions(true)}
                                            onBlur={() => {
                                                setTimeout(() => setShowCarreraSuggestions(false), 120);
                                            }}
                                            placeholder="Escribí una carrera..."
                                            className="rounded-lg"
                                        />
                                        {showCarreraSuggestions &&
                                            localFilters.carrera_nombre.trim().length > 0 &&
                                            filteredCarreras.length > 0 &&
                                            !hideSuggestions && (
                                            <div className="absolute left-0 top-full mt-1 z-50 w-full max-h-48 overflow-auto rounded-md border border-input bg-popover text-sm shadow-sm">
                                                {filteredCarreras.map((carrera) => (
                                                    <button
                                                        key={carrera.id}
                                                        type="button"
                                                        className="flex w-full items-center px-3 py-2 text-left hover:bg-muted"
                                                        onClick={() =>
                                                        {
                                                            setLocalFilters((prev) => ({
                                                                ...prev,
                                                                carrera_nombre: carrera.nombre,
                                                                carrera_id: carrera.id,
                                                            }));
                                                            setShowCarreraSuggestions(false);
                                                        }
                                                        }
                                                    >
                                                        {carrera.nombre}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
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
                                                    anio: '',
                                                    estado: [],
                                                    carrera_id: null,
                                                    carrera_nombre: '',
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
                        {open || localFilters.search || localFilters.anio || localFilters.estado.length > 0 || localFilters.carrera_id ? (
                            <Button
                                variant="secondary"
                                className="rounded-lg"
                                type="button"
                                onClick={() => {
                                    const cleaned = {
                                        search: '',
                                        anio: '',
                                        estado: [],
                                        carrera_id: null,
                                        carrera_nombre: '',
                                    };
                                    setLocalFilters(cleaned);
                                    applyFilters(cleaned);
                                }}
                            >
                                Limpiar Filtros
                            </Button>
                        ) : null}
                    </>
                }
            >
                <DataTable
                    columns={columns}
                    data={planes.data}
                    filterKey="nombre"
                    placeholder="Buscar por nombre..."
                    externalSort={sort}
                    onSortChange={(col, dir) => {
                        if (!col || !dir) {
                            handleSort('id', 'desc');
                            return;
                        }
                        handleSort(col, dir as 'asc' | 'desc');
                    }}
                />
            </ListLayout>
        </AppLayout>
    );
}
