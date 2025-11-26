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

interface ComentarioRow {
  id: number;
  archivo?: { id: number; titulo: string };
  autor?: { id: number; name: string };
  cuerpo: string;
  destacado: boolean;
}

interface Paginated {
  data: ComentarioRow[];
  links: Url[];
}

interface Filters {
  search?: string;
  autor?: string;
  destacado?: boolean | null;
  sort?: string;
  direction?: 'asc' | 'desc';
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Comentarios', href: route('comentarios.index') },
];

export default function Index({
  comentarios,
  filters,
  autores = [],
}: {
  comentarios: Paginated;
  filters?: Filters;
  autores?: string[];
}) {
  const { delete: destroy, processing } = useForm({});
  const [filtersState, setFiltersState] = useState({
    search: filters?.search ?? '',
    autor: filters?.autor ?? '',
    destacado: filters?.destacado ?? null,
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
      destacado: filters?.destacado ?? null,
    });
    setSort({
      column: filters?.sort ?? 'id',
      direction: (filters?.direction as 'asc' | 'desc') ?? 'desc',
    });
  }, [filters]);

  const applyFilters = (state: typeof filtersState, customSort?: { column: string; direction: 'asc' | 'desc' }) => {
    router.get(
      route('comentarios.index'),
      {
        search: state.search || undefined,
        autor: state.autor || undefined,
        destacado: state.destacado !== null ? state.destacado : undefined,
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
    const cleaned = { search: '', autor: '', destacado: null as boolean | null };
    setFiltersState(cleaned);
    applyFilters(cleaned);
  };

  const columns: ColumnDef<ComentarioRow>[] = useMemo(
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
        accessorKey: 'cuerpo',
        header: 'Comentario',
        cell: ({ getValue }) => <span className="max-w-md whitespace-pre-wrap text-sm">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'destacado',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Destacado
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ getValue }) =>
          getValue<boolean>() ? <Badge variant="default">Sí</Badge> : <Badge variant="secondary">No</Badge>,
      },
      {
        id: 'actions',
        header: <div className="text-right">Acciones</div>,
        enableSorting: false,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="flex w-full justify-end gap-2 pr-1">
              <Link href={route('comentarios.edit', c.id)}>
                <Button size="sm" variant="secondary">
                  Editar
                </Button>
              </Link>
              <ConfirmDelete
                disabled={processing}
                onConfirm={() => destroy(route('comentarios.destroy', c.id))}
                description="El comentario se eliminará definitivamente."
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
      <Head title="Comentarios" />
      <div className="m-4 space-y-4">
        <section className="rounded-2xl border border-border/60 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">

        <ListSection
          title="Comentarios"
          description="Observaciones públicas vinculadas a archivos y autores."
          actions={
            <Link href={route('comentarios.create')}>
              <Button>Crear comentario</Button>
            </Link>
          }
        />
        </section>
        <Card className="border-2 border-border/70 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-4 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
          <CardContent className="space-y-4">
            <DataTable
              columns={columns}
              data={comentarios.data}
              filterKey="archivo"
              placeholder="Buscar por archivo, autor o texto..."
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
                        <SheetTitle>Filtrar comentarios</SheetTitle>
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
                            placeholder="Archivo, autor o texto..."
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
                          <Label>Destacado</Label>
                          <div className="grid grid-cols-1 gap-3">
                            {[
                              { value: true, label: 'Sí' },
                              { value: false, label: 'No' },
                            ].map((opt) => (
                              <label key={`destacado-${opt.label}`} className="flex items-center gap-2 text-sm">
                                <input
                                  type="radio"
                                  name="destacado"
                                  className="h-4 w-4 border-input text-primary focus:ring-1 focus:ring-ring"
                                  checked={filtersState.destacado === opt.value}
                                  onChange={() =>
                                    setFiltersState((prev) => ({
                                      ...prev,
                                      destacado: opt.value,
                                    }))
                                  }
                                />
                                {opt.label}
                              </label>
                            ))}
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="radio"
                                name="destacado"
                                className="h-4 w-4 border-input text-primary focus:ring-1 focus:ring-ring"
                                checked={filtersState.destacado === null}
                                onChange={() =>
                                  setFiltersState((prev) => ({
                                    ...prev,
                                    destacado: null,
                                  }))
                                }
                              />
                              Cualquiera
                            </label>
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
                  <a href="/comentarios/report" target="_blank" rel="noreferrer">
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
              <Pagination links={comentarios.links} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
