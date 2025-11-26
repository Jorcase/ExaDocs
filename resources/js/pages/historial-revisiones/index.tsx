import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { Card, CardContent } from '@/components/ui/card';
import { ListSection } from '@/components/list-section';
import { DataTable } from '@/components/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import Pagination from '@/components/pagination';
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
import { FileText } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface RevisionRow {
  id: number;
  archivo?: { id: number; titulo: string };
  revisor?: { id: number; name: string };
  estado_previo: string;
  estado_nuevo: string;
  comentario?: string | null;
}

interface Paginated {
  data: RevisionRow[];
  links: Url[];
}

interface Filters {
  search?: string;
  revisor?: string;
  estado_previo?: string[];
  estado_nuevo?: string[];
  sort?: string;
  direction?: 'asc' | 'desc';
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Historial de revisiones', href: route('historial-revisiones.index') },
];

export default function Index({
  revisiones,
  filters,
  revisores = [],
  estados = [],
}: {
  revisiones: Paginated;
  filters?: Filters;
  revisores?: string[];
  estados?: string[];
}) {
  const { delete: destroy, processing } = useForm({});
  const [filtersState, setFiltersState] = useState({
    search: filters?.search ?? '',
    revisor: filters?.revisor ?? '',
    estado_previo: filters?.estado_previo ?? [],
    estado_nuevo: filters?.estado_nuevo ?? [],
  });
  const [sort, setSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({
    column: filters?.sort ?? 'id',
    direction: (filters?.direction as 'asc' | 'desc') ?? 'desc',
  });
  const [openFilter, setOpenFilter] = useState(false);

  useEffect(() => {
    setFiltersState({
      search: filters?.search ?? '',
      revisor: filters?.revisor ?? '',
      estado_previo: filters?.estado_previo ?? [],
      estado_nuevo: filters?.estado_nuevo ?? [],
    });
    setSort({
      column: filters?.sort ?? 'id',
      direction: (filters?.direction as 'asc' | 'desc') ?? 'desc',
    });
  }, [filters]);

  const applyFilters = (state: typeof filtersState, customSort?: { column: string; direction: 'asc' | 'desc' }) => {
    router.get(
      route('historial-revisiones.index'),
      {
        search: state.search || undefined,
        revisor: state.revisor || undefined,
        estado_previo: state.estado_previo?.length ? state.estado_previo : undefined,
        estado_nuevo: state.estado_nuevo?.length ? state.estado_nuevo : undefined,
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
    const cleaned = { search: '', revisor: '', estado_previo: [], estado_nuevo: [] as string[] };
    setFiltersState(cleaned);
    applyFilters(cleaned);
  };

  const columns: ColumnDef<RevisionRow>[] = useMemo(
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
        id: 'revisor',
        accessorFn: (row) => row.revisor?.name ?? '—',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Revisor
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
      },
      {
        accessorKey: 'estado_previo',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Estado previo
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
      },
      {
        accessorKey: 'estado_nuevo',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Estado nuevo
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
      },
      {
        accessorKey: 'comentario',
        header: 'Comentario',
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground whitespace-pre-wrap">
            {getValue<string>() ?? '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: <div className="text-right">Acciones</div>,
        enableSorting: false,
        cell: ({ row }) => {
          const rev = row.original;
          return (
            <div className="flex w-full justify-end gap-2 pr-1">
              <Link href={route('historial-revisiones.edit', rev.id)}>
                <Button size="sm" variant="secondary">
                  Editar
                </Button>
              </Link>
              <ConfirmDelete
                disabled={processing}
                onConfirm={() => destroy(route('historial-revisiones.destroy', rev.id))}
                description="La revisión se eliminará definitivamente."
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
      <Head title="Historial de revisiones" />
      <div className="m-4 space-y-4">
        <section className="rounded-2xl border border-border/60 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
          <ListSection
            title="Historial de revisiones"
            description="Registra cuándo y quién modificó el estado de cada archivo."
            actions={
              <>
                <Link href={route('historial-revisiones.create')}>
                  <Button>Registrar revisión</Button>
                </Link>
              </>
            }
          />
        </section>
        <Card className="border-2 border-border/70 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-4 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
          <CardContent className="space-y-4">
            <DataTable
              columns={columns}
              data={revisiones.data}
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
                        <SheetTitle>Filtrar revisiones</SheetTitle>
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
                            placeholder="Archivo, revisor o estado"
                          />
                        </div>
                        <div className="space-y-2 relative">
                          <Label htmlFor="revisor">Revisor</Label>
                          <Input
                            id="revisor"
                            value={filtersState.revisor}
                            onChange={(e) =>
                              setFiltersState((prev) => ({
                                ...prev,
                                revisor: e.target.value,
                              }))
                            }
                            placeholder="Escribí un revisor..."
                            autoComplete="off"
                          />
                          {filtersState.revisor && revisores.length > 0 && (
                            <div className="absolute left-0 top-full z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border border-input bg-popover text-sm shadow-sm">
                              {revisores
                                .filter((r) => r.toLowerCase().includes(filtersState.revisor.toLowerCase()))
                                .slice(0, 8)
                                .map((rev) => (
                                  <button
                                    key={rev}
                                    type="button"
                                    className="flex w-full items-center px-3 py-2 text-left hover:bg-muted"
                                    onClick={() =>
                                      setFiltersState((prev) => ({
                                        ...prev,
                                        revisor: rev,
                                      }))
                                    }
                                  >
                                    {rev}
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="estados-previo">Estado previo</Label>
                          <div className="grid grid-cols-1 gap-3">
                            {estados.map((estado) => (
                              <label key={`prev-${estado}`} className="flex items-center gap-2 text-sm">
                                <Checkbox
                                  checked={filtersState.estado_previo.includes(estado)}
                                  onCheckedChange={(checked) => {
                                    setFiltersState((prev) => {
                                      const current = prev.estado_previo;
                                      return {
                                        ...prev,
                                        estado_previo: checked
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
                        <div className="space-y-2">
                          <Label htmlFor="estados-nuevo">Estado nuevo</Label>
                          <div className="grid grid-cols-1 gap-3">
                            {estados.map((estado) => (
                              <label key={`nuevo-${estado}`} className="flex items-center gap-2 text-sm">
                                <Checkbox
                                  checked={filtersState.estado_nuevo.includes(estado)}
                                  onCheckedChange={(checked) => {
                                    setFiltersState((prev) => {
                                      const current = prev.estado_nuevo;
                                      return {
                                        ...prev,
                                        estado_nuevo: checked
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
                  <a href="/historial-revisiones/report" target="_blank" rel="noreferrer">
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
              <Pagination links={revisiones.links} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
