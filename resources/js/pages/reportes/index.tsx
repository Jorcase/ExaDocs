import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, FileText } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ListLayout } from '@/components/list-layout';

interface SimpleUser {
  id: number;
  name: string;
}

interface SimpleArchivo {
  id: number;
  titulo: string;
}

interface ReporteRow {
  id: number;
  archivo?: SimpleArchivo | null;
  reportante?: SimpleUser | null;
  moderador?: SimpleUser | null;
  motivo: string;
  detalle?: string | null;
  estado: string;
}

interface Paginated {
  data: ReporteRow[];
  links: Url[];
}

interface Filters {
  search?: string;
  reportante?: string;
  motivo?: string[];
  estado?: string[];
  sort?: string;
  direction?: 'asc' | 'desc';
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Reportes de contenido', href: route('reportes.index') },
];

const estadoVariant = (estado?: string) => {
  if (!estado) return 'secondary';
  const value = estado.toLowerCase();
  if (value.includes('pend')) return 'outline';
  if (value.includes('rev')) return 'secondary';
  if (value.includes('res')) return 'success';
  return 'secondary';
};

export default function Index({
  reportes,
  filters,
  reportantes = [],
  motivos = [],
  estados = [],
}: {
  reportes: Paginated;
  filters?: Filters;
  reportantes?: string[];
  motivos?: string[];
  estados?: string[];
}) {
  const { delete: destroy, processing } = useForm({});
  const [filtersState, setFiltersState] = useState({
    search: filters?.search ?? '',
    reportante: filters?.reportante ?? '',
    motivo: filters?.motivo ?? [],
    estado: filters?.estado ?? [],
  });
  const [sort, setSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({
    column: filters?.sort ?? 'id',
    direction: (filters?.direction as 'asc' | 'desc') ?? 'desc',
  });
  const [openFilter, setOpenFilter] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters?.search ?? '');

  useEffect(() => {
    setFiltersState({
      search: filters?.search ?? '',
      reportante: filters?.reportante ?? '',
      motivo: filters?.motivo ?? [],
      estado: filters?.estado ?? [],
    });
    setSort({
      column: filters?.sort ?? 'id',
      direction: (filters?.direction as 'asc' | 'desc') ?? 'desc',
    });
    setLocalSearch(filters?.search ?? '');
  }, [filters]);

  // Búsqueda con debounce
  useEffect(() => {
    if (localSearch === (filters?.search ?? '')) {
      return;
    }
    const handler = setTimeout(() => {
      applyFilters({ ...filtersState, search: localSearch });
    }, 350);
    return () => clearTimeout(handler);
  }, [localSearch]);

  const applyFilters = (state: typeof filtersState, customSort?: { column: string; direction: 'asc' | 'desc' }) => {
    router.get(
      route('reportes.index'),
      {
        search: state.search || undefined,
        reportante: state.reportante || undefined,
        motivo: state.motivo?.length ? state.motivo : undefined,
        estado: state.estado?.length ? state.estado : undefined,
        sort: customSort?.column ?? sort.column,
        direction: customSort?.direction ?? sort.direction,
      },
      { preserveState: true, preserveScroll: true, replace: true },
    );
  };

  const handleSort = (columnId: string, direction: 'asc' | 'desc') => {
    setSort({ column: columnId, direction });
    applyFilters(filtersState, { column: columnId, direction });
  };

  const clearFilters = () => {
    setLocalSearch('');
    const cleaned = { search: '', reportante: '', motivo: [] as string[], estado: [] as string[] };
    setFiltersState(cleaned);
    applyFilters(cleaned);
  };

  const columns: ColumnDef<ReporteRow>[] = useMemo(
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
        id: 'archivo',
        accessorFn: (row) => row.archivo?.titulo ?? '—',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Archivo
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ getValue }) => <span className="font-semibold text-slate-900 dark:text-slate-100">{getValue<string>()}</span>,
      },
      {
        id: 'reportante',
        accessorFn: (row) => row.reportante?.name ?? '—',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Reportante
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
      },
      {
        accessorKey: 'motivo',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Motivo
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ getValue }) => <span className="capitalize text-xs bg-muted px-2 py-0.5 rounded border border-border/60">{getValue<string>()?.replace('_', ' ') ?? '—'}</span>,
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
        cell: ({ getValue }) => <Badge variant={estadoVariant(getValue<string>()) as any} className="capitalize">{getValue<string>()}</Badge>,
      },
      {
        id: 'actions',
        header: <div className="text-right">Acciones</div>,
        enableSorting: false,
        cell: ({ row }) => {
          const rep = row.original;
          return (
            <div className="flex w-full justify-end gap-2 pr-1">
              <Link href={route('reportes.edit', rep.id)}>
                <Button size="sm" variant="secondary" className="rounded-lg">
                  Editar
                </Button>
              </Link>
              <ConfirmDelete
                disabled={processing}
                onConfirm={() => destroy(route('reportes.destroy', rep.id))}
                description="El reporte se eliminará definitivamente de la base de datos."
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
      <Head title="Reportes | Gestión" />
      <ListLayout
        title="Gestión de Reportes de contenido"
        paginationLinks={reportes.links}
        actions={
          <>
            <Sheet open={openFilter} onOpenChange={setOpenFilter}>
              <SheetTrigger asChild>
                <Button variant="outline" className="rounded-lg">Filtros</Button>
              </SheetTrigger>
              <SheetContent className="space-y-6 sm:w-[420px]">
                <SheetHeader>
                  <SheetTitle>Filtrar reportes</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 px-2">
                  <div className="space-y-2">
                    <Label htmlFor="search">Buscar</Label>
                    <Input
                      id="search"
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      placeholder="Archivo, reportante, motivo, estado..."
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2 relative">
                    <Label htmlFor="reportante">Reportante</Label>
                    <Input
                      id="reportante"
                      value={filtersState.reportante}
                      onChange={(e) =>
                        setFiltersState((prev) => ({
                          ...prev,
                          reportante: e.target.value,
                        }))
                      }
                      placeholder="Escribí un usuario..."
                      autoComplete="off"
                      className="rounded-lg"
                    />
                    {filtersState.reportante && reportantes.length > 0 && (
                      <div className="absolute left-0 top-full z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border border-input bg-popover text-sm shadow-sm">
                        {reportantes
                          .filter((r) => r.toLowerCase().includes(filtersState.reportante.toLowerCase()))
                          .slice(0, 8)
                          .map((rep) => (
                            <button
                              key={rep}
                              type="button"
                              className="flex w-full items-center px-3 py-2 text-left hover:bg-muted"
                              onClick={() =>
                                setFiltersState((prev) => ({
                                  ...prev,
                                  reportante: rep,
                                }))
                              }
                            >
                              {rep}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Motivo</Label>
                    <div className="grid grid-cols-1 gap-3 mt-1">
                      {motivos.map((motivo) => (
                        <label key={`motivo-${motivo}`} className="flex items-center gap-2 text-sm capitalize cursor-pointer select-none">
                          <Checkbox
                            checked={filtersState.motivo.includes(motivo)}
                            onCheckedChange={(checked) => {
                              setFiltersState((prev) => {
                                const current = prev.motivo;
                                return {
                                  ...prev,
                                  motivo: checked
                                    ? [...current, motivo]
                                    : current.filter((item) => item !== motivo),
                                };
                              });
                            }}
                          />
                          <span>{motivo.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Estado</Label>
                    <div className="grid grid-cols-1 gap-3 mt-1">
                      {estados.map((estado) => (
                        <label key={`estado-${estado}`} className="flex items-center gap-2 text-sm capitalize cursor-pointer select-none">
                          <Checkbox
                            checked={filtersState.estado.includes(estado)}
                            onCheckedChange={(checked) => {
                              setFiltersState((prev) => {
                                const current = prev.estado;
                                return {
                                  ...prev,
                                  estado: checked
                                    ? [...current, estado]
                                    : current.filter((item) => item !== estado),
                                };
                              });
                            }}
                          />
                          <span>{estado}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <SheetFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <SheetClose asChild>
                    <Button variant="ghost" type="button" className="rounded-lg" onClick={clearFilters}>
                      Limpiar
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      type="button"
                      className="rounded-lg"
                      onClick={() => {
                        applyFilters(filtersState);
                      }}
                    >
                      Aplicar filtros
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            {openFilter || filtersState.search || filtersState.reportante || filtersState.motivo.length > 0 || filtersState.estado.length > 0 ? (
              <Button
                variant="secondary"
                className="rounded-lg"
                type="button"
                onClick={clearFilters}
              >
                Limpiar Filtros
              </Button>
            ) : null}

          </>
        }
      >
        <DataTable
          columns={columns}
          data={reportes.data}
          search={localSearch}
          onSearchChange={setLocalSearch}
          searchPlaceholder="Buscar por archivo, reportante, motivo..."
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
