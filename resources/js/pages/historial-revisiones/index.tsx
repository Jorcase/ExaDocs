import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { DataTable } from '@/components/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, FileText } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ListLayout } from '@/components/list-layout';
import { useMemo, useState, useEffect } from 'react';

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
  const [localSearch, setLocalSearch] = useState(filters?.search ?? '');

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
    setLocalSearch('');
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
        cell: ({ getValue }) => <span className="font-semibold text-slate-900 dark:text-slate-100">{getValue<string>()}</span>,
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
        cell: ({ getValue }) => <span className="text-xs font-semibold capitalize bg-muted px-2 py-0.5 rounded border">{getValue<string>()}</span>,
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
        cell: ({ getValue }) => <span className="text-xs font-semibold capitalize bg-muted px-2 py-0.5 rounded border">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'comentario',
        header: 'Comentario',
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-2">
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
                <Button size="sm" variant="secondary" className="rounded-lg">
                  Editar
                </Button>
              </Link>
              <ConfirmDelete
                disabled={processing}
                onConfirm={() => destroy(route('historial-revisiones.destroy', rev.id))}
                description="La revisión se eliminará definitivamente de la base de datos."
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
      <Head title="Historial de revisiones | Gestión" />
      <ListLayout
        title="Historial de revisiones"
        createHref={route('historial-revisiones.create')}
        createLabel="Registrar revisión"
        paginationLinks={revisiones.links}
        actions={
          <>
            <Sheet open={openFilter} onOpenChange={setOpenFilter}>
              <SheetTrigger asChild>
                <Button variant="outline" className="rounded-lg">Filtros</Button>
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
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      placeholder="Archivo, revisor o estado"
                      className="rounded-lg"
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
                      className="rounded-lg"
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
                    <Label className="text-sm font-medium">Estado previo</Label>
                    <div className="grid grid-cols-1 gap-3 mt-1">
                      {estados.map((estado) => (
                        <label key={`prev-${estado}`} className="flex items-center gap-2 text-sm cursor-pointer select-none">
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
                          <span className="capitalize">{estado}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Estado nuevo</Label>
                    <div className="grid grid-cols-1 gap-3 mt-1">
                      {estados.map((estado) => (
                        <label key={`nuevo-${estado}`} className="flex items-center gap-2 text-sm cursor-pointer select-none">
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
                          <span className="capitalize">{estado}</span>
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
            {openFilter || filtersState.search || filtersState.revisor || filtersState.estado_previo.length > 0 || filtersState.estado_nuevo.length > 0 ? (
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
          data={revisiones.data}
          search={localSearch}
          onSearchChange={setLocalSearch}
          searchPlaceholder="Buscar por archivo, revisor..."
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
