import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
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
    SheetClose,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useMemo, useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Materias',
        href: route('materias.index'),
    },
];

interface Materia {
    id: number;
    nombre: string;
    codigo: string;
    descripcion?: string | null;
    tipo: 'obligatoria' | 'optativa' | 'taller';
}

interface MateriasPaginated {
    data: Materia[];
    links: Url[];
}

interface Filters {
    search?: string;
    codigo?: string;
    tipo?: string[];
    sort?: string;
    direction?: 'asc' | 'desc';
    carrera_id?: number | null;
    carrera_nombre?: string | null;
}

export default function Index({
    materias,
    filters,
    codigos,
    carreras,
}: {
    materias: MateriasPaginated;
    filters?: Filters;
    codigos?: string[];
    carreras?: { id: number; nombre: string }[];
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
        tipo: filters?.tipo ?? [],
        carrera_id: filters?.carrera_id ?? null,
        carrera_nombre: filters?.carrera_nombre ?? '',
    });
    const [showCarreraSuggestions, setShowCarreraSuggestions] = useState(false);

    const buildParams = (state: typeof localFilters, customSort?: { column: string; direction: 'asc' | 'desc' }) => ({
        search: state.search || undefined,
        codigo: state.codigo || undefined,
        tipo: state.tipo ?? [],
        carrera_id: state.carrera_id ?? undefined,
        sort: customSort?.column ?? sort.column,
        direction: customSort?.direction ?? sort.direction,
    });

    useEffect(() => {
        setLocalFilters({
            search: filters?.search ?? '',
            codigo: filters?.codigo ?? '',
            tipo: filters?.tipo ?? [],
            carrera_id: filters?.carrera_id ?? null,
            carrera_nombre: filters?.carrera_nombre ?? '',
        });
        setSort({
            column: filters?.sort ?? 'id',
            direction: (filters?.direction as 'asc' | 'desc') ?? 'desc',
        });
    }, [filters]);

    const handleSort = (columnId: string, direction: 'asc' | 'desc') => {
        setSort({ column: columnId, direction });
        router.get(route('materias.index'), buildParams(localFilters, { column: columnId, direction }), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const filteredCodigos = useMemo(() => {
        if (!codigos || !localFilters.codigo.trim()) return [];
        return codigos
            .filter((c) => c.toLowerCase().includes(localFilters.codigo.toLowerCase()))
            .slice(0, 8);
    }, [codigos, localFilters.codigo]);

    const filteredCarreras = useMemo(() => {
        if (!carreras) return [];
        if (!localFilters.carrera_nombre?.trim()) return [];
        return carreras
            .filter((c) =>
                c.nombre.toLowerCase().includes(localFilters.carrera_nombre.toLowerCase())
            )
            .slice(0, 8);
    }, [carreras, localFilters.carrera_nombre]);

    const columns: ColumnDef<Materia>[] = useMemo(
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
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        className="px-0 font-semibold"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Código
                        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                    </Button>
                ),
            },
            {
                accessorKey: 'tipo',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        className="px-0 font-semibold"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Tipo
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
                    const materia = row.original;
                    return (
                        <div className="flex w-full justify-end gap-2">
                            <Link href={route('materias.edit', materia.id)}>
                                <Button size="sm" variant="secondary">
                                    Editar
                                </Button>
                            </Link>
                            <ConfirmDelete
                                description="La materia se eliminará definitivamente."
                                disabled={processing}
                                onConfirm={() => destroy(route('materias.destroy', materia.id))}
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
            <Head title="Materias | Listado" />
            <div className="m-4 space-y-4">
                <section className="rounded-2xl border border-border/60 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
                    <ListSection
                        title="Materias"
                        description="Gestiona las materias y los tipos de curso disponibles."
                        actions={
                            <Link href={route('materias.create')}>
                                <Button>Crear materia</Button>
                            </Link>
                        }
                    />
                </section>

                <Card className="border-2 border-border/70 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-4 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">

                    <CardContent className="space-y-4">
                        <DataTable
                            columns={columns}
                            data={materias.data}
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
                            endActions={
                                <>
                                    <Sheet open={open} onOpenChange={setOpen}>
                                        <SheetTrigger asChild>
                                            <Button variant="outline">Filtros</Button>
                                        </SheetTrigger>
                                        <SheetContent className="space-y-6 sm:w-[420px]">
                                            <SheetHeader>
                                                <SheetTitle>Filtrar materias</SheetTitle>
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
                                                        placeholder="Ej: MAT-101"
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
                                                <div className="space-y-2">
                                                    <Label>Tipo</Label>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {[
                                                            { value: 'obligatoria', label: 'Obligatoria' },
                                                            { value: 'optativa', label: 'Optativa' },
                                                            { value: 'taller', label: 'Taller' },
                                                        ].map((tipo) => (
                                                            <label
                                                                key={tipo.value}
                                                                className="flex items-center gap-2 text-sm"
                                                            >
                                                                <Checkbox
                                                                    checked={localFilters.tipo?.includes(tipo.value)}
                                                                    onCheckedChange={(checked) => {
                                                                        setLocalFilters((prev) => {
                                                                            const current = prev.tipo ?? [];
                                                                            return {
                                                                                ...prev,
                                                                                tipo: checked
                                                                                    ? [...current, tipo.value]
                                                                                    : current.filter((t) => t !== tipo.value),
                                                                            };
                                                                        });
                                                                    }}
                                                                />
                                                                {tipo.label}
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
                                                    />
                                                    {showCarreraSuggestions &&
                                                        localFilters.carrera_nombre.trim().length > 0 &&
                                                        filteredCarreras.length > 0 && (
                                                        <div className="absolute left-0 top-full mt-1 z-50 w-full max-h-48 overflow-auto rounded-md border border-input bg-popover text-sm shadow-sm">
                                                            {filteredCarreras.map((carrera) => (
                                                                <button
                                                                    key={carrera.id}
                                                                    type="button"
                                                                    className="flex w-full items-center px-3 py-2 text-left hover:bg-muted"
                                                                    onClick={() => {
                                                                        setLocalFilters((prev) => ({
                                                                            ...prev,
                                                                            carrera_nombre: carrera.nombre,
                                                                            carrera_id: carrera.id,
                                                                        }));
                                                                        setShowCarreraSuggestions(false);
                                                                    }}
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
                                                        onClick={() => {
                                                            const cleaned = {
                                                                search: '',
                                                                codigo: '',
                                                                tipo: [],
                                                                carrera_id: null,
                                                                carrera_nombre: '',
                                                            };
                                                            setLocalFilters(cleaned);
                                                            router.get(route('materias.index'), buildParams(cleaned, { column: 'id', direction: 'desc' }), {
                                                                preserveState: true,
                                                                preserveScroll: true,
                                                                replace: true,
                                                            });
                                                        }}
                                                    >
                                                        Limpiar
                                                    </Button>
                                                </SheetClose>
                                                <SheetClose asChild>
                                                    <Button
                                                        type="button"
                                                        onClick={() => {
                                                            router.get(route('materias.index'), buildParams(localFilters), {
                                                                preserveState: true,
                                                                preserveScroll: true,
                                                                replace: true,
                                                            });
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
                                                tipo: [],
                                                carrera_id: null as number | null,
                                                carrera_nombre: '',
                                            };
                                            setLocalFilters(cleaned);
                                            router.get(route('materias.index'), buildParams(cleaned, { column: 'id', direction: 'desc' }), {
                                                preserveState: true,
                                                preserveScroll: true,
                                                replace: true,
                                            });
                                        }}
                                    >
                                        Limpiar
                                    </Button>
                                    <a
                                        href={route('materias.report', buildParams(localFilters))}
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
                                        href={route('materias.export', buildParams(localFilters))}
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
                            <Pagination links={materias.links} />
                        </div>
                  </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
