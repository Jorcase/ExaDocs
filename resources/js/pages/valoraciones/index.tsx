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

interface ValoracionRow {
  id: number;
  archivo?: { id: number; titulo: string };
  autor?: { id: number; name: string };
  puntaje: number;
  comentario?: string | null;
}

interface Paginated {
  data: ValoracionRow[];
  links: Url[];
}

interface Filters {
  search?: string;
  autor?: string;
  puntaje?: number[];
  sort?: string;
  direction?: 'asc' | 'desc';
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Valoraciones', href: route('valoraciones.index') },
];

export default function Index({
  valoraciones,
  filters,
  autores = [],
}: {
  valoraciones: Paginated;
  filters?: Filters;
  autores?: string[];
}) {
  const { delete: destroy, processing } = useForm({});
  const [filtersState, setFiltersState] = useState({
    search: filters?.search ?? '',
    autor: filters?.autor ?? '',
    puntaje: filters?.puntaje ?? [],
  });
  const [sort, setSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({
    column: filters?.sort ?? 'id',
    direction: (filters?.direction as 'asc' | 'desc') ?? 'desc',
  });
  const [openFilter, setOpenFilter] = useState(false);

  useEffect(() => {
    setFiltersState({
      search: filters?.search ?? '',
      autor: filters?.autor ?? '',
      puntaje: filters?.puntaje ?? [],
    });
    setSort({
      column: filters?.sort ?? 'id',
      direction: (filters?.direction as 'asc' | 'desc') ?? 'desc',
    });
  }, [filters]);

  const applyFilters = (state: typeof filtersState, customSort?: { column: string; direction: 'asc' | 'desc' }) => {
    router.get(
      route('valoraciones.index'),
      {
        search: state.search || undefined,
        autor: state.autor || undefined,
        puntaje: state.puntaje?.length ? state.puntaje : undefined,
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
    const cleaned = { search: '', autor: '', puntaje: [] as number[] };
    setFiltersState(cleaned);
    applyFilters(cleaned);
  };

  const columns: ColumnDef<ValoracionRow>[] = useMemo(
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
        id: 'autor',
        accessorFn: (row) => row.autor?.name ?? '—',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Autor
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
      },
      {
        accessorKey: 'puntaje',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Puntaje
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ getValue }) => <Badge variant="secondary">{getValue<number>()} estrellas</Badge>,
      },
      {
        accessorKey: 'comentario',
        header: 'Comentario',
        cell: ({ getValue }) => <span className="max-w-md whitespace-pre-wrap text-sm line-clamp-2">{getValue<string>() ?? '—'}</span>,
      },
      {
        id: 'actions',
        header: <div className="text-right">Acciones</div>,
        enableSorting: false,
        cell: ({ row }) => {
          const v = row.original;
          return (
            <div className="flex w-full justify-end gap-2 pr-1">
              <Link href={route('valoraciones.edit', v.id)}>
                <Button size="sm" variant="secondary" className="rounded-lg">
                  Editar
                </Button>
              </Link>
              <ConfirmDelete
                disabled={processing}
                onConfirm={() => destroy(route('valoraciones.destroy', v.id))}
                description="La valoración se eliminará definitivamente de la base de datos."
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
      <Head title="Valoraciones | Gestión" />
      <ListLayout
        title="Gestión de Valoraciones"
        createHref={route('valoraciones.create')}
        createLabel="Crear valoración"
        paginationLinks={valoraciones.links}
        actions={
          <>
            <Sheet open={openFilter} onOpenChange={setOpenFilter}>
              <SheetTrigger asChild>
                <Button variant="outline" className="rounded-lg">Filtros</Button>
              </SheetTrigger>
              <SheetContent className="space-y-6 sm:w-[420px]">
                <SheetHeader>
                  <SheetTitle>Filtrar valoraciones</SheetTitle>
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
                      placeholder="Archivo, autor o comentario..."
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2 relative">
                    <Label htmlFor="autor">Autor</Label>
                    <Input
                      id="autor"
                      value={filtersState.autor}
                      onChange={(e) =>
                        setFiltersState((prev) => ({
                          ...prev,
                          autor: e.target.value,
                        }))
                      }
                      placeholder="Escribí un autor..."
                      autoComplete="off"
                      className="rounded-lg"
                    />
                    {filtersState.autor && autores.length > 0 && (
                      <div className="absolute left-0 top-full z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border border-input bg-popover text-sm shadow-sm">
                        {autores
                          .filter((a) => a.toLowerCase().includes(filtersState.autor.toLowerCase()))
                          .slice(0, 8)
                          .map((aut) => (
                            <button
                              key={aut}
                              type="button"
                              className="flex w-full items-center px-3 py-2 text-left hover:bg-muted"
                              onClick={() =>
                                setFiltersState((prev) => ({
                                  ...prev,
                                  autor: aut,
                                }))
                              }
                            >
                              {aut}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Puntaje</Label>
                    <div className="grid grid-cols-1 gap-3 mt-1">
                      {[1, 2, 3, 4, 5].map((p) => (
                        <label key={`puntaje-${p}`} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                          <Checkbox
                            checked={filtersState.puntaje.includes(p)}
                            onCheckedChange={(checked) => {
                              setFiltersState((prev) => {
                                const current = prev.puntaje;
                                return {
                                  ...prev,
                                  puntaje: checked ? [...current, p] : current.filter((item) => item !== p),
                                };
                              });
                            }}
                          />
                          <span>{p} estrellas</span>
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
            {openFilter || filtersState.search || filtersState.autor || filtersState.puntaje.length > 0 ? (
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
          data={valoraciones.data}
          filterKey="archivo"
          placeholder="Buscar por archivo"
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
