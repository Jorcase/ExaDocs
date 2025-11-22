import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { ListSection } from '@/components/list-section';
import { DataTable } from '@/components/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, FileText } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useMemo, useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface PerfilRow {
  id: number;
  user?: { id: number; name: string; email: string };
  carrera?: { id: number; nombre: string };
  documento?: string | null;
  telefono?: string | null;
}

interface Paginated {
  data: PerfilRow[];
  links: Url[];
}

interface Filters {
  search?: string;
  carrera_id?: number | null;
  carrera_nombre?: string | null;
  documento?: string;
  telefono?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Perfiles', href: route('perfiles.index') },
];

export default function Index({
  perfiles,
  filters,
  carreras,
}: {
  perfiles: Paginated;
  filters?: Filters;
  carreras?: { id: number; nombre: string }[];
}) {
  const { delete: destroy, processing } = useForm({});
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({
    column: filters?.sort ?? 'id',
    direction: (filters?.direction as 'asc' | 'desc') ?? 'desc',
  });
  const [showCarreraSuggestions, setShowCarreraSuggestions] = useState(false);

  const [localFilters, setLocalFilters] = useState({
    search: filters?.search ?? '',
    carrera_id: filters?.carrera_id ?? null,
    carrera_nombre: filters?.carrera_nombre ?? '',
    documento: filters?.documento ?? '',
    telefono: filters?.telefono ?? '',
  });

  const buildParams = (state: typeof localFilters, customSort?: { column: string; direction: 'asc' | 'desc' }) => ({
    search: state.search || undefined,
    carrera_id: state.carrera_id ?? undefined,
    documento: state.documento || undefined,
    telefono: state.telefono || undefined,
    sort: customSort?.column ?? sort.column,
    direction: customSort?.direction ?? sort.direction,
  });

  useEffect(() => {
    setLocalFilters({
      search: filters?.search ?? '',
      carrera_id: filters?.carrera_id ?? null,
      carrera_nombre: filters?.carrera_nombre ?? '',
      documento: filters?.documento ?? '',
      telefono: filters?.telefono ?? '',
    });
    setSort({
      column: filters?.sort ?? 'id',
      direction: (filters?.direction as 'asc' | 'desc') ?? 'desc',
    });
  }, [filters]);

  const handleSort = (columnId: string, direction: 'asc' | 'desc') => {
    setSort({ column: columnId, direction });
    router.get(route('perfiles.index'), buildParams(localFilters, { column: columnId, direction }), {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    });
  };

    const filteredCarreras = useMemo(() => {
      if (!carreras) return [];
      if (!localFilters.carrera_nombre?.trim()) return [];
      return carreras
        .filter((c) => c.nombre.toLowerCase().includes(localFilters.carrera_nombre.toLowerCase()))
        .slice(0, 8);
    }, [carreras, localFilters.carrera_nombre]);

  const columns: ColumnDef<PerfilRow>[] = useMemo(
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
      },
      {
        accessorKey: 'user',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Usuario
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => row.original.user?.name ?? '—',
        accessorFn: (row) => row.user?.name ?? '',
      },
      {
        id: 'email',
        accessorFn: (row) => row.user?.email ?? '',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Email
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ getValue }) => getValue<string>() || '—',
      },
      {
        accessorKey: 'documento',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Documento
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ getValue }) => getValue<string>() || '—',
      },
      {
        accessorKey: 'telefono',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Teléfono
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ getValue }) => getValue<string>() || '—',
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
          const perfil = row.original;
          return (
            <div className="flex w-full justify-end gap-2">
              <Link href={route('perfiles.edit', perfil.id)}>
                <Button size="sm" variant="secondary">
                  Editar
                </Button>
              </Link>
              <ConfirmDelete
                disabled={processing}
                onConfirm={() => destroy(route('perfiles.destroy', perfil.id))}
                description="El perfil se eliminará definitivamente."
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
      <Head title="Perfiles de usuario" />
      <div className="m-4 space-y-4">
        <ListSection
          title="Perfiles"
          description="Gestiona la información de usuarios y su carrera principal."
          actions={
            <Link href={route('perfiles.create')}>
              <Button>Crear perfil</Button>
            </Link>
          }
        />

        <Card>
          <CardContent className="space-y-4">
            <DataTable
              columns={columns}
              data={perfiles.data}
              filterKey="user"
              placeholder="Buscar por usuario..."
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
                        <SheetTitle>Filtrar perfiles</SheetTitle>
                      </SheetHeader>
                        <div className="space-y-4 px-2">
                          <div className="space-y-2">
                            <Label htmlFor="search">Nombre o email</Label>
                            <Input
                                id="search"
                              value={localFilters.search}
                              onChange={(e) =>
                                  setLocalFilters((prev) => ({
                                      ...prev,
                                      search: e.target.value,
                                  }))
                              }
                                placeholder="Buscar por nombre/email..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="documento">Documento</Label>
                            <Input
                              id="documento"
                              value={localFilters.documento}
                              onChange={(e) =>
                                setLocalFilters((prev) => ({
                                  ...prev,
                                  documento: e.target.value,
                                }))
                              }
                              placeholder="DNI..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="telefono">Teléfono</Label>
                            <Input
                              id="telefono"
                              value={localFilters.telefono}
                              onChange={(e) =>
                                setLocalFilters((prev) => ({
                                  ...prev,
                                  telefono: e.target.value,
                                }))
                              }
                              placeholder="Teléfono..."
                            />
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
                                      carrera_id: null,
                                      carrera_nombre: '',
                                      documento: '',
                                      telefono: '',
                                    };
                                    setLocalFilters(cleaned);
                                    router.get(route('perfiles.index'), buildParams(cleaned, { column: 'id', direction: 'desc' }), {
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
                                    router.get(route('perfiles.index'), buildParams(localFilters), {
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
                        carrera_id: null,
                        carrera_nombre: '',
                      };
                      setLocalFilters(cleaned);
                      router.get(route('perfiles.index'), buildParams(cleaned, { column: 'id', direction: 'desc' }), {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                      });
                    }}
                  >
                    Limpiar
                  </Button>
                  <a href={route('perfiles.report', buildParams(localFilters))} target="_blank" rel="noreferrer">
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
              <Pagination links={perfiles.links} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
