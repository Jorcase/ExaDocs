import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  FileSpreadsheet,
  FileTextIcon,
  FileSpreadsheetIcon,
  Filter,
  RotateCcw,
  Eye,
  Bookmark,
  Star,
  MessageSquare,
  Search,
  ChevronDown,
  BookOpen,
  User,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { usePermissions } from '@/hooks/use-permissions';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

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
  visitas_count?: number;
  savers_count?: number;
  comentarios_count?: number;
  valoraciones_count?: number;
  valoraciones_avg_puntaje?: number | null;
}

interface ArchivosPaginated {
  data: ArchivoRow[];
  current_page?: number;
  next_page_url?: string | null;
}

interface Filters {
  search?: string;
  autor?: string;
  tipo_carrera_id?: number;
  carrera_id?: number;
  materia_id?: number;
  tipo_archivo_id?: number;
  plan_estudio_id?: number;
  estado_archivo_id?: number;
  sort?: 'date' | 'title' | 'popular' | 'sugerido';
  direction?: 'asc' | 'desc';
}

interface Option {
  id: number;
  nombre: string;
  carrera_id?: number | null;
  tipo_carrera_id?: number | null;
  plan_estudio_id?: number | null;
  carrera_ids?: number[];
  plan_ids?: number[];
}

const toNumber = (value: number | string | null | undefined) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function Index({
  archivos,
  filters,
  autores = [],
  tipoCarreras = [],
  carreras = [],
  materias = [],
  tipos = [],
  planes = [],
  estados = [],
}: {
  archivos: ArchivosPaginated;
  filters?: Filters;
  autores?: string[];
  tipoCarreras?: Option[];
  carreras?: Option[];
  materias?: Option[];
  tipos?: Option[];
  planes?: Option[];
  estados?: Option[];
}) {
  const page = usePage<{ auth: { user: { id: number } | null } }>();
  const { delete: destroy, processing } = useForm({});
  const firstLoad = useRef(true);
  const [items, setItems] = useState<ArchivoRow[]>(archivos.data);
  const [pageNumber, setPageNumber] = useState<number>(archivos.current_page ?? 1);
  const [hasMore, setHasMore] = useState<boolean>(!!archivos.next_page_url);
  const [materiaSearchQuery, setMateriaSearchQuery] = useState('');
  const [carreraSearchQuery, setCarreraSearchQuery] = useState('');

  const [filtersState, setFiltersState] = useState({
    search: filters?.search ?? '',
    autor: filters?.autor ?? '',
    tipo_carrera_id: toNumber(filters?.tipo_carrera_id),
    carrera_id: toNumber(filters?.carrera_id),
    materia_id: toNumber(filters?.materia_id),
    tipo_archivo_id: toNumber(filters?.tipo_archivo_id),
    plan_estudio_id: toNumber(filters?.plan_estudio_id),
    estado_archivo_id: toNumber(filters?.estado_archivo_id),
    sort: (filters?.sort as 'date' | 'title' | 'popular' | 'sugerido') ?? 'sugerido',
    direction: (filters?.direction as 'asc' | 'desc') ?? 'desc',
  });

  useEffect(() => {
    setFiltersState((prev) => ({
      ...prev,
      search: filters?.search ?? '',
      autor: filters?.autor ?? '',
      tipo_carrera_id: toNumber(filters?.tipo_carrera_id),
      carrera_id: toNumber(filters?.carrera_id),
      materia_id: toNumber(filters?.materia_id),
      tipo_archivo_id: toNumber(filters?.tipo_archivo_id),
      plan_estudio_id: toNumber(filters?.plan_estudio_id),
      estado_archivo_id: toNumber(filters?.estado_archivo_id),
      sort: (filters?.sort as 'date' | 'title' | 'popular' | 'sugerido') ?? 'sugerido',
      direction: (filters?.direction as 'asc' | 'desc') ?? 'desc',
    }));
  }, [filters]);

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

  const applyAndSet = (next: typeof filtersState) => {
    setFiltersState(next);
    applyFilters(next);
  };

  const clearFilters = () => {
    const cleaned = {
      search: '',
      autor: '',
      tipo_carrera_id: 0,
      carrera_id: 0,
      materia_id: 0,
      tipo_archivo_id: 0,
      plan_estudio_id: 0,
      estado_archivo_id: 0,
      sort: 'sugerido' as 'date' | 'title' | 'popular' | 'sugerido',
      direction: 'desc' as 'asc' | 'desc',
    };
    setItems([]);
    setFiltersState(cleaned);
    applyFilters(cleaned);
    setMateriaSearchQuery('');
    setCarreraSearchQuery('');
  };

  const buildParams = (state: typeof filtersState) => ({
    search: state.search || undefined,
    autor: state.autor || undefined,
    tipo_carrera_id: state.tipo_carrera_id || undefined,
    carrera_id: state.carrera_id || undefined,
    materia_id: state.materia_id || undefined,
    tipo_archivo_id: state.tipo_archivo_id || undefined,
    plan_estudio_id: state.plan_estudio_id || undefined,
    estado_archivo_id: state.estado_archivo_id || undefined,
    sort: state.sort,
    direction: state.direction,
  });

  // Live search debouncer for text inputs
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    const handler = setTimeout(() => applyFilters(filtersState), 350);
    return () => clearTimeout(handler);
  }, [filtersState.search, filtersState.sort, filtersState.direction, filtersState.autor]);

  const selectedCarrera = useMemo(
    () => carreras.find((c) => c.id === filtersState.carrera_id),
    [carreras, filtersState.carrera_id],
  );
  const selectedPlan = useMemo(
    () => planes.find((p) => p.id === filtersState.plan_estudio_id),
    [planes, filtersState.plan_estudio_id],
  );
  const selectedMateria = useMemo(
    () => materias.find((m) => m.id === filtersState.materia_id),
    [materias, filtersState.materia_id],
  );

  const planesDisponibles = useMemo(() => {
    if (filtersState.carrera_id) {
      return planes.filter((p) => p.carrera_id === filtersState.carrera_id);
    }
    return [];
  }, [planes, filtersState.carrera_id]);

  const materiasDisponibles = useMemo(() => {
    if (filtersState.plan_estudio_id) {
      return materias.filter((m) => m.plan_ids?.includes(filtersState.plan_estudio_id));
    }
    if (filtersState.carrera_id) {
      return materias.filter((m) => m.carrera_ids?.includes(filtersState.carrera_id));
    }
    return materias;
  }, [filtersState.carrera_id, filtersState.plan_estudio_id, materias]);

  const carrerasFiltradasPorMateria = useMemo(() => {
    if (filtersState.materia_id) {
      const selectedMat = materias.find((m) => m.id === filtersState.materia_id);
      if (selectedMat && selectedMat.carrera_ids) {
        return carreras.filter((c) => selectedMat.carrera_ids?.includes(c.id));
      }
    }
    return carreras;
  }, [carreras, materias, filtersState.materia_id]);

  const filteredMateriasSearch = useMemo(() => {
    if (!materiaSearchQuery) return [];
    return materiasDisponibles
      .filter((m) => m.nombre.toLowerCase().includes(materiaSearchQuery.toLowerCase()))
      .slice(0, 5);
  }, [materiasDisponibles, materiaSearchQuery]);

  const filteredCarrerasSearch = useMemo(() => {
    if (!carreraSearchQuery) return [];
    return carrerasFiltradasPorMateria
      .filter((c) => c.nombre.toLowerCase().includes(carreraSearchQuery.toLowerCase()))
      .slice(0, 5);
  }, [carrerasFiltradasPorMateria, carreraSearchQuery]);

  const exportParams = useMemo(() => buildParams(filtersState), [filtersState]);
  const { can } = usePermissions();
  const canViewPdf = can('view_pdf');
  const canViewExcel = can('view_excel');
  const canSetEstado = can('state_archivo') || can('view_moderacion');

  const isImage = (path?: string) => !!path && /\.(png|jpe?g|gif|webp)$/i.test(path);

  const estadoColor = (nombre?: string) => {
    if (!nombre) return 'secondary';
    const value = nombre.toLowerCase();
    if (value.includes('pend')) return 'outline';
    if (value.includes('rech')) return 'destructive';
    if (value.includes('acept') || value.includes('aprob')) return 'default';
    return 'secondary';
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Archivos', href: route('archivos.index') },
  ];

  const tipoCarreraOrder = (nombre?: string) => {
    const value = nombre?.toLowerCase() ?? '';
    if (value.includes('pregrado')) return 1;
    if (value.includes('postgrado')) return 2;
    if (value.includes('grado')) return 0;
    return 99;
  };

  const tiposPermitidos = ['grado', 'pregrado', 'postgrado'];

  const tiposCarreraOrdenados = [...tipoCarreras]
    .filter((tipo) => {
      const value = tipo.nombre?.toLowerCase() ?? '';
      return tiposPermitidos.some((permitido) => value.includes(permitido));
    })
    .sort((a, b) => {
      const diff = tipoCarreraOrder(a.nombre) - tipoCarreraOrder(b.nombre);
      if (diff !== 0) return diff;
      return (a.nombre ?? '').localeCompare(b.nombre ?? '');
    });

  const navMenu = (
    <NavigationMenu>
      <NavigationMenuList>
        {tiposCarreraOrdenados.map((tipo) => {
          const carrerasTipo = carreras.filter((c) => c.tipo_carrera_id === tipo.id);
          return (
            <NavigationMenuItem key={tipo.id}>
              <NavigationMenuTrigger>{tipo.nombre}</NavigationMenuTrigger>
              <NavigationMenuContent className="p-4">
                <div className="grid gap-2 md:w-[320px]">
                  {carrerasTipo.length === 0 && (
                    <span className="text-xs text-muted-foreground">Sin carreras</span>
                  )}
                  {carrerasTipo.map((c) => (
                    <Link
                      key={c.id}
                      href={route('archivos.index', {
                        tipo_carrera_id: tipo.id,
                        carrera_id: c.id,
                      })}
                      className="text-sm text-foreground hover:text-primary px-2 py-1 rounded"
                      preserveScroll
                    >
                      {c.nombre}
                    </Link>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );

  const renderFiltersContent = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h3 className="font-bold text-xs text-primary dark:text-sky-300 uppercase tracking-wider flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filtros
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-neutral-900"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Limpiar
          </Button>
        </div>

        {/* Materia (Búsqueda Directa) */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Materia</Label>
          {filtersState.materia_id ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg border border-primary/20 bg-primary/5 dark:border-sky-500/20 dark:bg-sky-500/5">
              <span className="text-xs font-semibold text-primary dark:text-sky-400 truncate">
                {selectedMateria?.nombre || 'Materia Seleccionada'}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  applyAndSet({
                    ...filtersState,
                    materia_id: 0,
                  });
                }}
                className="h-5 w-5 rounded-md hover:bg-primary/10 text-primary dark:text-sky-400"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Input
                placeholder="Buscar materia..."
                value={materiaSearchQuery}
                onChange={(e) => setMateriaSearchQuery(e.target.value)}
                className="h-9 pr-8"
              />
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {filteredMateriasSearch.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-auto rounded-md border border-border bg-popover py-1 text-xs shadow-md">
                  {filteredMateriasSearch.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className="flex w-full items-center px-3 py-2 text-left hover:bg-muted font-medium text-foreground transition-colors"
                      onClick={() => {
                        applyAndSet({
                          ...filtersState,
                          materia_id: m.id,
                        });
                        setMateriaSearchQuery('');
                      }}
                    >
                      {m.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Carrera (Búsqueda Directa) */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Carrera</Label>
          {filtersState.carrera_id ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg border border-primary/20 bg-primary/5 dark:border-sky-500/20 dark:bg-sky-500/5">
              <span className="text-xs font-semibold text-primary dark:text-sky-400 truncate">
                {selectedCarrera?.nombre || 'Carrera Seleccionada'}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  applyAndSet({
                    ...filtersState,
                    carrera_id: 0,
                    plan_estudio_id: 0,
                  });
                }}
                className="h-5 w-5 rounded-md hover:bg-primary/10 text-primary dark:text-sky-400"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Input
                placeholder="Buscar carrera..."
                value={carreraSearchQuery}
                onChange={(e) => setCarreraSearchQuery(e.target.value)}
                className="h-9 pr-8"
              />
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {filteredCarrerasSearch.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-auto rounded-md border border-border bg-popover py-1 text-xs shadow-md">
                  {filteredCarrerasSearch.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="flex w-full items-center px-3 py-2 text-left hover:bg-muted font-medium text-foreground transition-colors"
                      onClick={() => {
                        applyAndSet({
                          ...filtersState,
                          carrera_id: c.id,
                          plan_estudio_id: 0,
                        });
                        setCarreraSearchQuery('');
                      }}
                    >
                      {c.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Plan de Estudio */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Plan de estudio</Label>
          <select
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            value={filtersState.plan_estudio_id}
            disabled={!filtersState.carrera_id}
            onChange={(e) => {
              const value = Number(e.target.value);
              applyAndSet({
                ...filtersState,
                plan_estudio_id: value,
              });
            }}
          >
            <option value={0}>Todos los planes</option>
            {planesDisponibles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de Documento */}
        <div className="space-y-2.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tipo de documento</Label>
          <div className="flex flex-col gap-1 pr-1">
            {tipos.map((t) => (
              <label key={t.id} className="flex items-center gap-3 cursor-pointer group py-1">
                <input
                  type="checkbox"
                  checked={filtersState.tipo_archivo_id === t.id}
                  onChange={() => {
                    const nextId = filtersState.tipo_archivo_id === t.id ? 0 : t.id;
                    applyAndSet({
                      ...filtersState,
                      tipo_archivo_id: nextId,
                    });
                  }}
                  className="rounded border-input text-secondary focus:ring-secondary w-4 h-4 bg-background dark:border-neutral-700"
                />
                <span className="text-xs font-medium text-foreground/80 group-hover:text-primary dark:group-hover:text-sky-300 transition-colors">
                  {t.nombre}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Autor */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Autor</Label>
          <div className="relative">
            <Input
              id="autor"
              value={filtersState.autor}
              onChange={(e) =>
                setFiltersState((prev) => ({
                  ...prev,
                  autor: e.target.value,
                }))
              }
              placeholder="Nombre del autor..."
              className="h-9"
              autoComplete="off"
            />
            {filtersState.autor && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const updated = { ...filtersState, autor: '' };
                  setFiltersState(updated);
                  applyFilters(updated);
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Estado (Moderador) */}
        {canSetEstado && (
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado</Label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
              value={filtersState.estado_archivo_id}
              onChange={(e) => {
                const value = Number(e.target.value);
                applyAndSet({
                  ...filtersState,
                  estado_archivo_id: value,
                });
              }}
            >
              <option value={0}>Todos los estados</option>
              {estados.map((est) => (
                <option key={est.id} value={est.id}>
                  {est.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  };

  const renderCardImage = (item: ArchivoRow) => {
    const src = item.thumbnail_path
      ? `/storage/${item.thumbnail_path}`
      : isImage(item.file_path)
      ? `/storage/${item.file_path}`
      : null;

    if (src) {
      return (
        <img
          src={src}
          alt={item.titulo}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      );
    }

    // Modern gradient fallback
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#002045] to-[#0061a5] text-white p-4 text-center select-none transition-transform duration-500 group-hover:scale-105">
        <BookOpen className="h-12 w-12 opacity-80 mb-2 animate-pulse" />
        <span className="text-[10px] uppercase font-black tracking-widest opacity-95">
          {item.tipo?.nombre || 'Documento'}
        </span>
      </div>
    );
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs} navMenu={navMenu}>
      <Head title="Archivos | Listado" />

      <div className="mx-auto max-w-[1380px] w-full px-4 py-6 md:px-6">
        <div className="flex flex-col lg:flex-row items-stretch gap-6">
          {/* Desktop Left Sidebar */}
          <aside className="hidden lg:block w-80 shrink-0">
            <Card className="border border-border/80 bg-card p-5 shadow-xs">
              {renderFiltersContent()}
            </Card>
          </aside>

          {/* Right Column Content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Toolbar Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border/60 p-4 rounded-xl shadow-xs">
              {/* Mobile Filters Trigger + Main Text Search */}
              <div className="flex items-center gap-2 flex-1 w-full">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden shrink-0">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                    <SheetHeader>
                      <SheetTitle className="text-left font-bold">Filtros de Búsqueda</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 overflow-y-auto max-h-[85vh] pr-2">
                      {renderFiltersContent()}
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="relative flex-1">
                  <Input
                    placeholder="Buscar por título..."
                    value={filtersState.search}
                    onChange={(e) =>
                      setFiltersState((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    className="w-full pl-9 h-10 bg-background dark:border-neutral-700"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Sort + Exports + Upload */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs flex-1 md:flex-none md:w-44"
                  value={`${filtersState.sort}_${filtersState.direction}`}
                  onChange={(e) => {
                    const value = e.target.value;
                    const [sort, direction] = value.split('_') as ['date' | 'title' | 'popular' | 'sugerido', 'asc' | 'desc'];
                    const updated = { ...filtersState, sort, direction };
                    setFiltersState(updated);
                    applyFilters(updated);
                  }}
                >
                  <option value="sugerido_desc">Sugeridos (Mi plan)</option>
                  <option value="popular_desc">Más populares</option>
                  <option value="popular_asc">Menos populares</option>
                  <option value="date_desc">Más nuevos</option>
                  <option value="date_asc">Más antiguos</option>
                  <option value="title_asc">Título A-Z</option>
                  <option value="title_desc">Título Z-A</option>
                </select>

                <div className="flex items-center gap-2">
                  {canViewPdf && (
                    <a href={route('archivos.report', exportParams)} target="_blank" rel="noreferrer">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:bg-neutral-900 dark:text-red-400 dark:hover:bg-neutral-800"
                      >
                        <FileTextIcon className="h-4.5 w-4.5" />
                      </Button>
                    </a>
                  )}
                  {canViewExcel && (
                    <a href={route('archivos.export', exportParams)} target="_blank" rel="noreferrer">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-500/30 dark:bg-neutral-900 dark:text-emerald-400 dark:hover:bg-neutral-800"
                      >
                        <FileSpreadsheetIcon className="h-4.5 w-4.5" />
                      </Button>
                    </a>
                  )}
                </div>

                {can('create_archivo') && (
                  <Link href={route('archivos.create', exportParams)} className="flex-1 md:flex-none">
                    <Button className="w-full h-10 bg-[#0061a5] hover:bg-[#004b80] text-white shadow-sm dark:bg-[#9fcaff] dark:text-neutral-950 dark:hover:bg-sky-400 font-semibold px-4">
                      Subir archivo
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Results Title/Count */}
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div>
                <h2 className="text-md font-bold text-primary dark:text-sky-300">
                  {filtersState.materia_id
                    ? `Resultados para "${selectedMateria?.nombre || 'Materia seleccionada'}"`
                    : filtersState.carrera_id
                    ? `Archivos de "${selectedCarrera?.nombre || 'Carrera seleccionada'}"`
                    : 'Todos los archivos'}
                </h2>
                {filtersState.search && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Buscando por título: "{filtersState.search}"
                  </p>
                )}
              </div>
              <span className="text-xs font-semibold text-muted-foreground font-mono bg-muted dark:bg-neutral-900 px-2.5 py-1 rounded-full">
                {items.length ? `${items.length} mostrados` : '0 encontrados'}
              </span>
            </div>

            {/* Document Grid */}
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => {
                const isOwner = item.autor?.id === page.props.auth.user?.id || item.can_update;
                const showEstado = canSetEstado || isOwner;
                return (
                  <Card
                    key={item.id}
                    className="group h-full overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/45 flex flex-col"
                  >
                    <Link
                      href={route('archivos.show', { archivo: item.id, ...exportParams })}
                      className="flex flex-col flex-grow focus-visible:outline-none"
                    >
                      <div className="relative overflow-hidden w-full h-48 bg-muted shrink-0 border-b border-border/50">
                        {renderCardImage(item)}
                        {item.tipo?.nombre && (
                          <Badge className="absolute top-3 left-3 bg-slate-950/70 dark:bg-black/60 backdrop-blur-md text-white border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm pointer-events-none">
                            {item.tipo.nombre}
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-4 flex flex-col flex-grow justify-between gap-3">
                        <div className="space-y-1.5">
                          <CardTitle
                            className="text-sm font-bold line-clamp-2 leading-snug text-slate-900 dark:text-slate-100 group-hover:text-secondary dark:group-hover:text-sky-300 transition-colors"
                            title={item.titulo}
                          >
                            {item.titulo}
                          </CardTitle>

                          <div className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-primary/70 dark:text-sky-300/70 shrink-0" />
                            <span className="font-semibold text-foreground/80 truncate">
                              {item.materia?.nombre ?? 'Materia General'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-1 gap-1">
                            <span className="font-medium inline-flex items-center gap-1">
                              <User className="h-3 w-3 shrink-0" /> {item.autor?.name ?? 'Anónimo'}
                            </span>
                            {showEstado && item.estado?.nombre && (
                              <Badge
                                variant={estadoColor(item.estado.nombre) as any}
                                className="text-[9px] font-bold px-1.5 py-0 shrink-0"
                              >
                                {item.estado.nombre}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground mt-auto">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1" title="Visitas">
                              <Eye className="h-3.5 w-3.5 text-sky-500/80 shrink-0" /> {item.visitas_count ?? 0}
                            </span>
                            <span className="inline-flex items-center gap-0.5" title="Valoración promedio">
                              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                              {item.valoraciones_avg_puntaje ? Number(item.valoraciones_avg_puntaje).toFixed(1) : '—'}
                              {item.valoraciones_count ? ` (${item.valoraciones_count})` : ''}
                            </span>
                            <span className="inline-flex items-center gap-1" title="Comentarios">
                              <MessageSquare className="h-3.5 w-3.5 text-emerald-500/80 shrink-0" /> {item.comentarios_count ?? 0}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 font-mono" title="Guardados">
                            <Bookmark className="h-3.5 w-3.5 text-indigo-500/80 shrink-0" /> {item.savers_count ?? 0}
                          </span>
                        </div>
                      </CardContent>
                    </Link>

                    {(item.can_update || item.can_delete || (canSetEstado && item.estado?.nombre === 'Pendiente')) && (
                      <CardFooter className="flex justify-center gap-2 px-4 pb-4 pt-0 shrink-0">
                        {canSetEstado && item.estado?.nombre === 'Pendiente' && (
                          <Link href={`${route('historial-revisiones.create')}?archivo_id=${item.id}&estado_archivo_id=${item.estado?.id ?? ''}`}>
                            <Button size="sm" variant="outline" className="h-8 border-amber-300 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-950/20 font-semibold gap-1.5">
                               Revisar
                            </Button>
                          </Link>
                        )}
                        {item.can_update && (
                          <Link href={route('archivos.edit', item.id)}>
                            <Button size="sm" variant="outline" className="h-8">
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
                            <Button size="sm" variant="destructive" className="h-8" disabled={processing}>
                              Eliminar
                            </Button>
                          </ConfirmDelete>
                        )}
                      </CardFooter>
                    )}
                  </Card>
                );
              })}
            </div>

            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl bg-card">
                <BookOpen className="h-10 w-10 text-muted-foreground opacity-50 mb-3" />
                <p className="text-sm font-semibold text-muted-foreground">No se encontraron archivos con los filtros seleccionados.</p>
              </div>
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
        </div>
      </div>
    </AppLayout>
  );
}
