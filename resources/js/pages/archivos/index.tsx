import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, FileSpreadsheet, FileCode2, FileTextIcon, FileSpreadsheetIcon, Filter, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState, useRef } from 'react';
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
import { usePermissions } from '@/hooks/use-permissions';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Archivos', href: route('archivos.index') },
];

interface Relacion {
  id: number;
  nombre?: string;
  name?: string;
}

interface ArchivoRow {
  id: number;
  titulo: string;
  descripcion?: string | null;
  file_path?: string;
   thumbnail_path?: string | null;
  materia?: Relacion | null;
  tipo?: Relacion | null;
  estado?: Relacion | null;
  autor?: Relacion | null;
  can_update?: boolean;
  can_delete?: boolean;
}

interface ArchivosPaginated {
  data: ArchivoRow[];
  current_page?: number;
  next_page_url?: string | null;
}

interface Filters {
  search?: string;
  autor?: string;
  carrera_id?: number;
  materia_id?: number;
  tipo_archivo_id?: number;
  plan_estudio_id?: number;
  estado_archivo_id?: number;
  sort?: 'date' | 'title';
  direction?: 'asc' | 'desc';
}

interface Option {
  id: number;
  nombre: string;
  carrera_id?: number | null;
}

export default function Index({
  archivos,
  filters,
  autores = [],
  carreras = [],
  materias = [],
  tipos = [],
  planes = [],
  estados = [],
}: {
  archivos: ArchivosPaginated;
  filters?: Filters;
  autores?: string[];
  carreras?: Option[];
  materias?: Option[];
  tipos?: Option[];
  planes?: Option[];
  estados?: Option[];
}) {
  const page = usePage<{ auth: { user: { id: number } | null } }>();
  const { delete: destroy, processing } = useForm({});
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const firstLoad = useRef(true);
  const [items, setItems] = useState<ArchivoRow[]>(archivos.data);
  const [pageNumber, setPageNumber] = useState<number>(archivos.current_page ?? 1);
  const [hasMore, setHasMore] = useState<boolean>(!!archivos.next_page_url);
  const [filtersState, setFiltersState] = useState({
    search: filters?.search ?? '',
    autor: filters?.autor ?? '',
    carrera_id: filters?.carrera_id ?? 0,
    carrera_text: '',
    materia_id: filters?.materia_id ?? 0,
    materia_text: '',
    tipo_archivo_id: filters?.tipo_archivo_id ?? 0,
    tipo_text: '',
    plan_estudio_id: filters?.plan_estudio_id ?? 0,
    plan_text: '',
    estado_archivo_id: filters?.estado_archivo_id ?? 0,
    estado_text: '',
    sort: (filters?.sort as 'date' | 'title') ?? 'date',
    direction: (filters?.direction as 'asc' | 'desc') ?? 'desc',
  });

  useEffect(() => {
    setFiltersState((prev) => ({
      ...prev,
      search: filters?.search ?? '',
      autor: filters?.autor ?? '',
      carrera_id: filters?.carrera_id ?? 0,
      materia_id: filters?.materia_id ?? 0,
      tipo_archivo_id: filters?.tipo_archivo_id ?? 0,
      plan_estudio_id: filters?.plan_estudio_id ?? 0,
      estado_archivo_id: filters?.estado_archivo_id ?? 0,
      sort: (filters?.sort as 'date' | 'title') ?? 'date',
      direction: (filters?.direction as 'asc' | 'desc') ?? 'desc',
      // mantener los textos si coinciden con selección previa, de lo contrario vaciar
      carrera_text: filters?.carrera_id ? prev.carrera_text : '',
      materia_text: filters?.materia_id ? prev.materia_text : '',
      tipo_text: filters?.tipo_archivo_id ? prev.tipo_text : '',
      plan_text: filters?.plan_estudio_id ? prev.plan_text : '',
      estado_text: filters?.estado_archivo_id ? prev.estado_text : '',
    }));
  }, [filters]);

  // Reset o acumula items según la página recibida
  useEffect(() => {
    const currentPage = archivos.current_page ?? 1;
    setHasMore(!!archivos.next_page_url);
    setPageNumber(currentPage);

    setItems((prev) => {
      if (currentPage === 1) {
        return archivos.data;
      }
      const existing = new Set(prev.map((i) => i.id));
      const nuevos = archivos.data.filter((i) => !existing.has(i.id));
      return [...prev, ...nuevos];
    });
  }, [archivos.data, archivos.current_page, archivos.next_page_url]);

  const applyFilters = (state: typeof filtersState) => {
    router.get(
      route('archivos.index'),
      buildParams(state),
      { preserveState: true, preserveScroll: true, replace: true },
    );
  };

  const clearFilters = () => {
    const cleaned = {
      search: '',
      autor: '',
      carrera_id: 0,
      carrera_text: '',
      materia_id: 0,
      materia_text: '',
      tipo_archivo_id: 0,
      tipo_text: '',
      plan_estudio_id: 0,
      plan_text: '',
      estado_archivo_id: 0,
      estado_text: '',
      sort: 'date' as 'date' | 'title',
      direction: 'desc' as 'asc' | 'desc',
    };
    setItems([]);
    setFiltersState(cleaned);
    applyFilters(cleaned);
  };

  const buildParams = (state: typeof filtersState) => ({
    search: state.search || undefined,
    autor: state.autor || undefined,
    carrera_id: state.carrera_id || undefined,
    materia_id: state.materia_id || undefined,
    tipo_archivo_id: state.tipo_archivo_id || undefined,
    plan_estudio_id: state.plan_estudio_id || undefined,
    estado_archivo_id: state.estado_archivo_id || undefined,
    sort: state.sort,
    direction: state.direction,
  });

  // Búsqueda en vivo de título con debounce para evitar muchas peticiones
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    const handler = setTimeout(() => applyFilters(filtersState), 350);
    return () => clearTimeout(handler);
  }, [filtersState.search, filtersState.sort, filtersState.direction]);

  const filteredAutores = useMemo(() => {
    if (!filtersState.autor) return [];
    return autores
      .filter((a) => a.toLowerCase().includes(filtersState.autor.toLowerCase()))
      .slice(0, 8);
  }, [autores, filtersState.autor]);

  const filterOptions = (list: Option[], text: string) =>
    list.filter((item) => item.nombre.toLowerCase().includes(text.toLowerCase())).slice(0, 8);

  const filteredCarreras = useMemo(
    () => (filtersState.carrera_text ? filterOptions(carreras, filtersState.carrera_text) : carreras.slice(0, 8)),
    [carreras, filtersState.carrera_text],
  );

  const filteredMaterias = useMemo(
    () => {
      const base = filtersState.carrera_id ? materias : materias;
      if (filtersState.materia_text) {
        return filterOptions(base, filtersState.materia_text);
      }
      return base.slice(0, 8);
    },
    [materias, filtersState.materia_text, filtersState.carrera_id],
  );

  const filteredTipos = useMemo(
    () => (filtersState.tipo_text ? filterOptions(tipos, filtersState.tipo_text) : tipos.slice(0, 8)),
    [tipos, filtersState.tipo_text],
  );

  const filteredPlanes = useMemo(
    () => {
      const base = filtersState.carrera_id
        ? planes.filter((p) => p.carrera_id === filtersState.carrera_id)
        : planes;
      if (filtersState.plan_text) {
        return filterOptions(base, filtersState.plan_text);
      }
      return base.slice(0, 8);
    },
    [planes, filtersState.plan_text, filtersState.carrera_id],
  );

  const filteredEstados = useMemo(
    () => (filtersState.estado_text ? filterOptions(estados, filtersState.estado_text) : estados.slice(0, 8)),
    [estados, filtersState.estado_text],
  );

  const exportParams = useMemo(() => buildParams(filtersState), [filtersState]);
  const { can } = usePermissions();
  const canViewPdf = can('view_pdf');
  const canViewExcel = can('view_excel');

  const isImage = (path?: string) => !!path && /\.(png|jpe?g|gif|webp)$/i.test(path);
  const isPdf = (path?: string) => !!path && /\.pdf$/i.test(path);
  const isSpreadsheet = (path?: string) => !!path && /\.(xls|xlsx|csv)$/i.test(path);
  const isDoc = (path?: string) => !!path && /\.(doc|docx)$/i.test(path);
  const estadoColor = (nombre?: string) => {
    if (!nombre) return 'secondary';
    const value = nombre.toLowerCase();
    if (value.includes('pend')) return 'outline';
    if (value.includes('rech')) return 'destructive';
    if (value.includes('acept') || value.includes('aprob')) return 'default';
    return 'secondary';
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Archivos | Listado" />
      <div className="m-4 space-y-4">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-semibold">Archivos cargados</CardTitle>
              <p className="text-sm text-muted-foreground">Explora y administra los archivos subidos.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  placeholder="Buscar por título..."
                  value={filtersState.search}
                  onChange={(e) =>
                    setFiltersState((prev) => ({
                      ...prev,
                      search: e.target.value,
                    }))
                  }
                  className="w-56"
                />
                <select
                  className="w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={`${filtersState.sort}_${filtersState.direction}`}
                  onChange={(e) => {
                    const value = e.target.value;
                    const [sort, direction] = value.split('_') as ['date' | 'title', 'asc' | 'desc'];
                    const updated = { ...filtersState, sort, direction };
                    setFiltersState(updated);
                    applyFilters(updated);
                  }}
                >
                  <option value="date_desc">Más nuevos</option>
                  <option value="date_asc">Más antiguos</option>
                  <option value="title_asc">Título A-Z</option>
                  <option value="title_desc">Título Z-A</option>
                </select>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="space-y-6 sm:w-[420px]">
                    <SheetHeader>
                      <SheetTitle>Filtrar archivos</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4 px-2 max-h-[70vh] overflow-y-auto pr-2">
                      <div className="space-y-2">
                        <Label htmlFor="search">Título</Label>
                        <Input
                          id="search"
                          autoComplete="off"
                          value={filtersState.search}
                          onChange={(e) =>
                            setFiltersState((prev) => ({
                              ...prev,
                              search: e.target.value,
                            }))
                          }
                          placeholder="Buscar por título..."
                        />
                      </div>
                      <div className="space-y-2 relative">
                        <Label htmlFor="carrera">Carrera</Label>
                        <Input
                          id="carrera"
                          value={filtersState.carrera_text}
                          onFocus={() => setActiveDropdown('carrera')}
                          onBlur={() => setTimeout(() => setActiveDropdown(null), 150)}
                          onChange={(e) =>
                            setFiltersState((prev) => ({
                              ...prev,
                              carrera_text: e.target.value,
                              carrera_id: 0,
                              plan_estudio_id: 0,
                              plan_text: '',
                              materia_id: 0,
                              materia_text: '',
                            }))
                          }
                          placeholder="Escribí una carrera..."
                          autoComplete="off"
                        />
                        {activeDropdown === 'carrera' && filteredCarreras.length > 0 && filtersState.carrera_text && (
                          <div className="absolute left-0 top-full z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border border-input bg-popover text-sm shadow-sm">
                            {filteredCarreras.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                className="flex w-full items-center px-3 py-2 text-left hover:bg-muted"
                                onClick={() =>
                                  setFiltersState((prev) => ({
                                    ...prev,
                                    carrera_id: c.id,
                                    carrera_text: c.nombre,
                                    plan_estudio_id: 0,
                                    plan_text: '',
                                    materia_id: 0,
                                    materia_text: '',
                                  }))
                                }
                              >
                                {c.nombre}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 relative">
                        <Label htmlFor="plan">Plan de estudio</Label>
                        <Input
                          id="plan"
                          value={filtersState.plan_text}
                          onFocus={() => setActiveDropdown('plan')}
                          onBlur={() => setTimeout(() => setActiveDropdown(null), 150)}
                          onChange={(e) =>
                            setFiltersState((prev) => ({
                              ...prev,
                              plan_text: e.target.value,
                              plan_estudio_id: 0,
                            }))
                          }
                          placeholder="Escribí un plan..."
                          autoComplete="off"
                        />
                        {activeDropdown === 'plan' && filteredPlanes.length > 0 && (
                          <div className="absolute left-0 top-full z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border border-input bg-popover text-sm shadow-sm">
                            {filteredPlanes.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                className="flex w-full items-center px-3 py-2 text-left hover:bg-muted"
                                onClick={() =>
                                  setFiltersState((prev) => ({
                                    ...prev,
                                    plan_estudio_id: p.id,
                                    plan_text: p.nombre,
                                  }))
                                }
                              >
                                {p.nombre}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 relative">
                        <Label htmlFor="materia">Materia</Label>
                        <Input
                          id="materia"
                          value={filtersState.materia_text}
                          onFocus={() => setActiveDropdown('materia')}
                          onBlur={() => setTimeout(() => setActiveDropdown(null), 150)}
                          onChange={(e) =>
                            setFiltersState((prev) => ({
                              ...prev,
                              materia_text: e.target.value,
                              materia_id: 0,
                            }))
                          }
                          placeholder="Escribí una materia..."
                          autoComplete="off"
                        />
                        {activeDropdown === 'materia' && filteredMaterias.length > 0 && (
                          <div className="absolute left-0 top-full z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border border-input bg-popover text-sm shadow-sm">
                            {filteredMaterias.map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                className="flex w-full items-center px-3 py-2 text-left hover:bg-muted"
                                onClick={() =>
                                  setFiltersState((prev) => ({
                                    ...prev,
                                    materia_id: m.id,
                                    materia_text: m.nombre,
                                  }))
                                }
                              >
                                {m.nombre}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 relative">
                        <Label htmlFor="estado">Estado</Label>
                        <Input
                          id="estado"
                          value={filtersState.estado_text}
                          onFocus={() => setActiveDropdown('estado')}
                          onBlur={() => setTimeout(() => setActiveDropdown(null), 150)}
                          onChange={(e) =>
                            setFiltersState((prev) => ({
                              ...prev,
                              estado_text: e.target.value,
                              estado_archivo_id: 0,
                            }))
                          }
                          placeholder="Escribí un estado..."
                          autoComplete="off"
                        />
                        {activeDropdown === 'estado' && filteredEstados.length > 0 && (
                          <div className="absolute left-0 top-full z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border border-input bg-popover text-sm shadow-sm">
                            {filteredEstados.map((est) => (
                              <button
                                key={est.id}
                                type="button"
                                className="flex w-full items-center px-3 py-2 text-left hover:bg-muted"
                                onClick={() =>
                                  setFiltersState((prev) => ({
                                    ...prev,
                                    estado_archivo_id: est.id,
                                    estado_text: est.nombre,
                                  }))
                                }
                              >
                                {est.nombre}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 relative">
                        <Label htmlFor="tipo">Tipo de archivo</Label>
                        <Input
                          id="tipo"
                          value={filtersState.tipo_text}
                          onFocus={() => setActiveDropdown('tipo')}
                          onBlur={() => setTimeout(() => setActiveDropdown(null), 150)}
                          onChange={(e) =>
                            setFiltersState((prev) => ({
                              ...prev,
                              tipo_text: e.target.value,
                              tipo_archivo_id: 0,
                            }))
                          }
                          placeholder="Escribí un tipo..."
                          autoComplete="off"
                        />
                        {activeDropdown === 'tipo' && filteredTipos.length > 0 && (
                          <div className="absolute left-0 top-full z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border border-input bg-popover text-sm shadow-sm">
                            {filteredTipos.map((t) => (
                              <button
                                key={t.id}
                                type="button"
                                className="flex w-full items-center px-3 py-2 text-left hover:bg-muted"
                                onClick={() =>
                                  setFiltersState((prev) => ({
                                    ...prev,
                                    tipo_archivo_id: t.id,
                                    tipo_text: t.nombre,
                                  }))
                                }
                              >
                                {t.nombre}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 relative">
                        <Label htmlFor="autor">Autor</Label>
                        <Input
                          id="autor"
                          value={filtersState.autor}
                          onFocus={() => setActiveDropdown('autor')}
                          onBlur={() => setTimeout(() => setActiveDropdown(null), 150)}
                          onChange={(e) =>
                            setFiltersState((prev) => ({
                              ...prev,
                              autor: e.target.value,
                            }))
                          }
                          placeholder="Escribí un autor..."
                          autoComplete="off"
                        />
                        {activeDropdown === 'autor' && filtersState.autor && filteredAutores.length > 0 && (
                          <div className="absolute left-0 top-full z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border border-input bg-popover text-sm shadow-sm">
                            {filteredAutores.map((aut) => (
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
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Limpiar
                </Button>
                {canViewPdf && (
                  <a href={route('archivos.report', exportParams)} target="_blank" rel="noreferrer">
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                    >
                      <FileTextIcon className="h-4 w-4" />
                    </Button>
                  </a>
                )}
                {canViewExcel && (
                  <a href={route('archivos.export', exportParams)} target="_blank" rel="noreferrer">
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                    >
                      <FileSpreadsheetIcon className="h-4 w-4" />
                    </Button>
                  </a>
                )}
                <Link href={route('archivos.create')}>
                  <Button>Subir archivo</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
            <CardHeader className="p-0">
              {item.thumbnail_path ? (
                <img
                  src={`/storage/${item.thumbnail_path}`}
                  alt={`Miniatura de ${item.titulo}`}
                  className="h-40 w-full object-cover"
                />
              ) : isImage(item.file_path) ? (
                <img
                  src={`/storage/${item.file_path}`}
                  alt={item.titulo}
                  className="h-40 w-full object-cover"
                />
              ) : isPdf(item.file_path) ? (
                <div className="h-40 w-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                  <FileText className="h-6 w-6" />
                  <span className="ml-2">PDF</span>
                </div>
              ) : (
                <div className="h-40 w-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                  {isSpreadsheet(item.file_path) && (
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-6 w-6" />
                      <span>Hoja de cálculo</span>
                    </div>
                  )}
                  {isDoc(item.file_path) && (
                    <div className="flex items-center gap-2">
                      <FileCode2 className="h-6 w-6" />
                      <span>Documento</span>
                    </div>
                  )}
                  {!item.file_path && <span>Sin archivo</span>}
                  {item.file_path &&
                    !isSpreadsheet(item.file_path) &&
                    !isDoc(item.file_path) && <span>Vista previa no disponible</span>}
                </div>
              )}
            </CardHeader>
              <CardContent className="space-y-1 py-3 px-4">
                <CardTitle className="text-base">{item.titulo}</CardTitle>
                {item.descripcion && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.descripcion}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Materia: <span className="font-medium">{item.materia?.nombre ?? '—'}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Tipo: <span className="font-medium">{item.tipo?.nombre ?? '—'}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant={estadoColor(item.estado?.nombre) as any}>
                    {item.estado?.nombre ?? 'Sin estado'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Autor: {item.autor?.name ?? '—'}</span>
                </div>
              </CardContent>
            <CardFooter className="flex justify-between px-4 pb-4">
              <Link href={route('archivos.show', item.id)}>
                <Button size="sm" variant="outline">
                  Ver
                </Button>
              </Link>
              <div className="flex gap-2">
                  {item.can_update && (
                  <Link href={route('archivos.edit', item.id)}>
                    <Button size="sm" variant="secondary">
                      Editar
                    </Button>
                  </Link>
                  )}
                  {item.can_delete && (
                    <ConfirmDelete
                      disabled={processing}
                      onConfirm={() => destroy(route('archivos.destroy', item.id))}
                      description="El archivo se eliminará definitivamente."
                    >
                      <Button size="sm" variant="destructive" disabled={processing}>
                        Eliminar
                      </Button>
                    </ConfirmDelete>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay archivos cargados todavía.</p>
        )}
        {hasMore && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              disabled={processing}
              onClick={() => {
                const nextPage = (pageNumber ?? 1) + 1;
                router.get(
                  route('archivos.index'),
                  { ...buildParams(filtersState), page: nextPage },
                  {
                    preserveScroll: true,
                    preserveState: true,
                  },
                );
              }}
            >
              Cargar más
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
