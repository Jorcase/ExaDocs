import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ListSection } from '@/components/list-section';
import { DataTable } from '@/components/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, FileText } from 'lucide-react';
import Pagination from '@/components/pagination';
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
  }, [filters]);

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
        cell: ({ getValue }) => <span className="capitalize">{getValue<string>()?.replace('_', ' ') ?? '—'}</span>,
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
        cell: ({ getValue }) => <Badge variant={estadoVariant(getValue<string>()) as any}>{getValue<string>()}</Badge>,
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
                <Button size="sm" variant="secondary">
                  Editar
                </Button>
              </Link>
              <ConfirmDelete
                disabled={processing}
                onConfirm={() => destroy(route('reportes.destroy', rep.id))}
                description="El reporte se eliminará definitivamente."
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
      <Head title="Reportes de contenido" />
      <div className="m-4 space-y-4">
        <section className="rounded-2xl border border-border/60 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
            <ListSection
              title="Reportes de contenido"
              description="Supervisa los reportes de archivos y su seguimiento."
              actions={
                <Link href={route('reportes.create')}>
                  <Button>Crear reporte</Button>
                </Link>
              }
            />
        </section>
        <Card className="border-2 border-border/70 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-4 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
          <CardContent className="space-y-4">
            <DataTable
              columns={columns}
              data={reportes.data}
              filterKey="archivo"
              placeholder="Buscar por archivo"
              externalSort={sort}
              onSortChange={(col, dir) => {
                if (!col || !dir) return;
                handleSort(col, dir as 'asc' | 'desc');
              }}
              endActions={
                <>
                  <Sheet open={openFilter} onOpenChange={setOpenFilter}>
                    <SheetTrigger asChild>
                      <Button variant="outline">Filtros</Button>
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
                            value={filtersState.search}
                            onChange={(e) =>
                              setFiltersState((prev) => ({
                                ...prev,
                                search: e.target.value,
                              }))
                            }
                            placeholder="Archivo, reportante, motivo, estado..."
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
                          <Label>Motivo</Label>
                          <div className="grid grid-cols-1 gap-3">
                            {motivos.map((motivo) => (
                              <label key={`motivo-${motivo}`} className="flex items-center gap-2 text-sm capitalize">
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
                                {motivo.replace('_', ' ')}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Estado</Label>
                          <div className="grid grid-cols-1 gap-3">
                            {estados.map((estado) => (
                              <label key={`estado-${estado}`} className="flex items-center gap-2 text-sm capitalize">
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
                                {estado}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                      <SheetFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <SheetClose asChild>
                          <Button variant="ghost" type="button" onClick={clearFilters}>
                            Limpiar
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button
                            type="button"
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
                  <Button
                    variant="secondary"
                    className="bg-white text-slate-900 hover:bg-muted"
                    type="button"
                    onClick={clearFilters}
                  >
                    Limpiar
                  </Button>
                  <a href="/reportes/report" target="_blank" rel="noreferrer">
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </a>
                </>
              }
            />
            <div className="flex justify-end">
              <Pagination links={reportes.links} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
