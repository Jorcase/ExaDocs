import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, FileSpreadsheet, FileCode2, FileTextIcon, FileSpreadsheetIcon, Filter, RotateCcw, Eye, Bookmark, Star, MessageSquare } from 'lucide-react';
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
  sort?: 'date' | 'title' | 'popular';
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const firstLoad = useRef(true);
  const [items, setItems] = useState<ArchivoRow[]>(archivos.data);
  const [pageNumber, setPageNumber] = useState<number>(archivos.current_page ?? 1);
  const [hasMore, setHasMore] = useState<boolean>(!!archivos.next_page_url);
  const [filtersState, setFiltersState] = useState({
    search: filters?.search ?? '',
    autor: filters?.autor ?? '',
    tipo_carrera_id: toNumber(filters?.tipo_carrera_id),
    carrera_id: toNumber(filters?.carrera_id),
    carrera_text: '',
    materia_id: toNumber(filters?.materia_id),
    materia_text: '',
    tipo_archivo_id: toNumber(filters?.tipo_archivo_id),
    tipo_text: '',
    plan_estudio_id: toNumber(filters?.plan_estudio_id),
    plan_text: '',
    estado_archivo_id: toNumber(filters?.estado_archivo_id),
    estado_text: '',
    sort: (filters?.sort as 'date' | 'title' | 'popular') ?? 'date',
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
      sort: (filters?.sort as 'date' | 'title' | 'popular') ?? 'date',
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
      tipo_carrera_id: 0,
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
      sort: 'date' as 'date' | 'title' | 'popular',
      direction: 'desc' as 'asc' | 'desc',
    };
    setItems([]);
    setFiltersState(cleaned);
    applyFilters(cleaned);
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

  function filtrosStateSel(id: number | '', list: Option[]) {
    if (!id) return undefined;
    return list.find((i) => i.id === id);
  }

  const filteredCarreras = useMemo(() => {
    const base =
      filtersState.tipo_carrera_id && filtersState.tipo_carrera_id !== 0
        ? carreras.filter((c) => c.tipo_carrera_id === filtersState.tipo_carrera_id)
        : carreras;
    return filtersState.carrera_text ? filterOptions(base, filtersState.carrera_text) : base.slice(0, 8);
  }, [carreras, filtersState.carrera_text, filtersState.tipo_carrera_id]);

  const materiasPorSeleccion = useMemo(() => {
    if (filtersState.plan_estudio_id) {
      return materias.filter((m) => m.plan_ids?.includes(filtersState.plan_estudio_id));
    }
    if (filtersState.carrera_id) {
      return materias.filter((m) => m.carrera_ids?.includes(filtersState.carrera_id));
    }
    return materias;
  }, [materias, filtersState.plan_estudio_id, filtersState.carrera_id]);

  const filteredMaterias = useMemo(
    () => {
      const base = materiasPorSeleccion;
      if (filtersState.materia_text) {
        return filterOptions(base, filtersState.materia_text);
      }
      return base.slice(0, 8);
    },
    [materiasPorSeleccion, filtersState.materia_text],
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
  const [materiaSearch, setMateriaSearch] = useState('');

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
  const selectedTipoArchivo = useMemo(
    () => tipos.find((t) => t.id === filtersState.tipo_archivo_id),
    [tipos, filtersState.tipo_archivo_id],
  );
  const [selectorOpen, setSelectorOpen] = useState(false);
  const hasSelectorSelection = selectedPlan || selectedMateria || selectedTipoArchivo || selectedCarrera;

  const planesDisponibles = useMemo(() => {
    if (filtersState.carrera_id) {
      return planes.filter((p) => p.carrera_id === filtersState.carrera_id);
    }
    return [];
  }, [planes, filtersState.carrera_id]);

  const materiasDisponibles = useMemo(() => {
    if (!filtersState.carrera_id) return [];
    if (filtersState.plan_estudio_id) {
      return materias.filter((m) => m.plan_ids?.includes(filtersState.plan_estudio_id));
    }
    if (planesDisponibles.length === 0) {
      return materias.filter((m) => m.carrera_ids?.includes(filtersState.carrera_id));
    }
    return [];
  }, [filtersState.carrera_id, filtersState.plan_estudio_id, planesDisponibles, materias]);

  const applyAndSet = (next: typeof filtersState) => {
    setFiltersState(next);
    applyFilters(next);
  };

  useEffect(() => {
    setMateriaSearch('');
  }, [filtersState.plan_estudio_id, filtersState.carrera_id]);

  const handleSelectPlan = (plan: Option) => {
    const updated = {
      ...filtersState,
      plan_estudio_id: plan.id,
      plan_text: plan.nombre,
      materia_id: 0,
      materia_text: '',
    };
    applyAndSet(updated);
  };

  const handleSelectMateria = (materia: Option) => {
    const updated = {
      ...filtersState,
      materia_id: materia.id,
      materia_text: materia.nombre,
    };
    applyAndSet(updated);
  };

  const handleSelectTipoArchivo = (tipo: Option) => {
    const updated = {
      ...filtersState,
      tipo_archivo_id: tipo.id,
      tipo_text: tipo.nombre,
    };
    applyAndSet(updated);
  };

  const handleClearSeleccionCadena = () => {
    const updated = {
      ...filtersState,
      plan_estudio_id: 0,
      plan_text: '',
      materia_id: 0,
      materia_text: '',
      tipo_archivo_id: 0,
      tipo_text: '',
    };
    applyAndSet(updated);
  };

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

  return (
    <AppLayout breadcrumbs={breadcrumbs} navMenu={navMenu}>
      <Head title="Archivos | Listado" />
      <div className="m-4 space-y-4">
        <Card className="border-2 border-border/70 bg-gradient-to-r from-slate-50 via-slate-100 to-white shadow-sm backdrop-blur-sm dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 rounded-t-xl border-b border-border/60 bg-muted/40/80 px-4 py-3">
            <CardTitle className="text-lg font-semibold">Elegí plan, materia y tipo de archivo</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectorOpen((v) => !v)}
                className="bg-slate-900 text-white shadow-sm transition hover:bg-black hover:shadow-md hover:ring-2 hover:ring-slate-300/70 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 dark:hover:ring-2 dark:hover:ring-white/60"
              >
                {selectorOpen ? 'Ocultar' : 'Elegir'}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleClearSeleccionCadena}
                disabled={!filtersState.plan_estudio_id && !filtersState.materia_id && !filtersState.tipo_archivo_id}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {hasSelectorSelection ? (
                <>
                  {selectedCarrera && <Badge variant="outline">Carrera: {selectedCarrera.nombre}</Badge>}
                  {selectedPlan && <Badge variant="outline">Plan: {selectedPlan.nombre}</Badge>}
                  {selectedMateria && <Badge variant="outline">Materia: {selectedMateria.nombre}</Badge>}
                  {selectedTipoArchivo && <Badge variant="outline">Tipo: {selectedTipoArchivo.nombre}</Badge>}
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Sin selección activa.</span>
              )}
            </div>
            {selectorOpen && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 rounded-lg border border-border/60 bg-card/60 p-3">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>Plan de estudio</span>
                    <span className="text-xs text-muted-foreground">{planesDisponibles.length} op.</span>
                  </div>
                  {!filtersState.carrera_id && (
                    <p className="text-xs text-muted-foreground">Primero elegí una carrera.</p>
                  )}
                  {filtersState.carrera_id && planesDisponibles.length === 0 && (
                    <p className="text-xs text-muted-foreground">Esta carrera no tiene planes cargados.</p>
                  )}
                  {planesDisponibles.length > 0 && (
                    <div className="space-y-2 max-h-64 overflow-auto pr-1">
                      {planesDisponibles.map((p) => (
                        <Button
                          key={p.id}
                          variant={p.id === filtersState.plan_estudio_id ? 'secondary' : 'ghost'}
                          className="w-full justify-start transition hover:border-primary/40 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary/50"
                          onClick={() => handleSelectPlan(p)}
                        >
                          {p.nombre}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2 rounded-lg border border-border/60 bg-card/60 p-3">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>Materia</span>
                    <span className="text-xs text-muted-foreground">
                      {materiasDisponibles.length} op.
                    </span>
                  </div>
                  {!filtersState.carrera_id && (
                    <p className="text-xs text-muted-foreground">Elegí primero una carrera y un plan.</p>
                  )}
                  {filtersState.carrera_id && planesDisponibles.length > 0 && !filtersState.plan_estudio_id && (
                    <p className="text-xs text-muted-foreground">Seleccioná un plan para ver sus materias.</p>
                  )}
                  {filtersState.carrera_id && planesDisponibles.length === 0 && materiasDisponibles.length === 0 && (
                    <p className="text-xs text-muted-foreground">No hay materias disponibles.</p>
                  )}
                  {filtersState.plan_estudio_id && materiasDisponibles.length === 0 && planesDisponibles.length > 0 && (
                    <p className="text-xs text-muted-foreground">Este plan no tiene materias cargadas.</p>
                  )}
                  {materiasDisponibles.length > 0 && (
                    <Input
                      placeholder="Buscar materia..."
                      value={materiaSearch}
                      onChange={(e) => setMateriaSearch(e.target.value)}
                      className="h-9"
                    />
                  )}
                  {materiasDisponibles.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-auto pr-1">
                    {materiasDisponibles
                      .filter((m) => m.nombre.toLowerCase().includes(materiaSearch.toLowerCase()))
                      .map((m) => (
                      <Button
                        key={m.id}
                        variant={m.id === filtersState.materia_id ? 'secondary' : 'ghost'}
                        className="w-full justify-start transition hover:border-primary/40 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary/50"
                        onClick={() => handleSelectMateria(m)}
                      >
                        {m.nombre}
                      </Button>
                    ))}
                    {materiasDisponibles.filter((m) => m.nombre.toLowerCase().includes(materiaSearch.toLowerCase())).length === 0 && (
                      <p className="text-xs text-muted-foreground px-1">No hay coincidencias.</p>
                    )}
                  </div>
                  )}
                </div>
                <div className="space-y-2 rounded-lg border border-border/60 bg-card/60 p-3">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>Tipo de archivo</span>
                    <span className="text-xs text-muted-foreground">{tipos.length} op.</span>
                  </div>
                  {tipos.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-auto pr-1">
                      {tipos.map((t) => (
                        <Button
                          key={t.id}
                          variant={t.id === filtersState.tipo_archivo_id ? 'secondary' : 'ghost'}
                          className="w-full justify-start transition hover:border-primary/40 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary/50"
                          onClick={() => handleSelectTipoArchivo(t)}
                        >
                          {t.nombre}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No hay tipos de archivo disponibles.</p>
                  )}
                </div>
              </div>
            )}
            {selectedMateria && (
              <span className="text-xs text-muted-foreground block">
                Mostrando archivos para {selectedMateria.nombre}.
              </span>
            )}
          </CardContent>
        </Card>
        <Card className="border-2 border-border/70 bg-gradient-to-r from-slate-50 via-slate-100 to-white shadow-sm backdrop-blur-sm dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
          <CardContent className="flex flex-wrap items-center justify-between gap-2 text-slate-900 dark:text-slate-50">
            <div>
              <CardTitle className="text-lg font-semibold">Archivos cargados</CardTitle>
              <p className="text-sm text-slate-700 dark:text-slate-200">Explora y administra los archivos subidos.</p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
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
                  className="w-56 bg-white text-neutral-900 border border-neutral-300 placeholder:text-neutral-500 dark:bg-neutral-900 dark:text-white dark:border-neutral-700 dark:placeholder:text-neutral-400"
                />
                <select
                  className="w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={`${filtersState.sort}_${filtersState.direction}`}
                  onChange={(e) => {
                    const value = e.target.value;
                    const [sort, direction] = value.split('_') as ['date' | 'title' | 'popular', 'asc' | 'desc'];
                    const updated = { ...filtersState, sort, direction };
                    setFiltersState(updated);
                    applyFilters(updated);
                  }}
                >
                  <option value="date_desc">Más nuevos</option>
                  <option value="date_asc">Más antiguos</option>
                  <option value="title_asc">Título A-Z</option>
                  <option value="title_desc">Título Z-A</option>
                  <option value="popular_desc">Más populares</option>
                  <option value="popular_asc">Menos populares</option>
                </select>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-800"
                    >
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
                  className="bg-slate-900 text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md hover:ring-2 hover:ring-slate-300/70 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:hover:ring-2 dark:hover:ring-slate-400/70"
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
                      className="border-red-200 bg-white text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-400/70 dark:bg-neutral-900 dark:text-red-200 dark:hover:bg-neutral-800"
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
                      className="border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-400/70 dark:bg-neutral-900 dark:text-emerald-200 dark:hover:bg-neutral-800"
                    >
                      <FileSpreadsheetIcon className="h-4 w-4" />
                    </Button>
                  </a>
                )}
                {can('create_archivo') && (
                  <Link href={route('archivos.create')} className="ml-auto self-end">
                    <Button
                      className="bg-sky-500 text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-600 hover:shadow-sky-500/40 dark:bg-sky-400 dark:text-slate-900 dark:hover:bg-sky-300"
                    >
                      Subir archivo
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden rounded-xl border-2 border-border/70 bg-gradient-to-br from-slate-100 via-slate-50 to-white text-slate-900 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:from-sky-100 hover:via-slate-50 hover:to-white dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50 dark:hover:from-sky-900 dark:hover:via-neutral-950 dark:hover:to-neutral-950"
            >
              <Link
                href={route('archivos.show', { archivo: item.id, ...exportParams })}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <CardHeader className="p-0">
                  {item.thumbnail_path ? (
                    <img
                      src={`/storage/${item.thumbnail_path}`}
                      alt={`Miniatura de ${item.titulo}`}
                      className="h-40 w-full object-cover transition duration-500 hover:scale-[1.01]"
                    />
                  ) : isImage(item.file_path) ? (
                    <img
                      src={`/storage/${item.file_path}`}
                      alt={item.titulo}
                      className="h-40 w-full object-cover transition duration-500 hover:scale-[1.01]"
                    />
                  ) : isPdf(item.file_path) ? (
                    <div className="flex h-40 w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                      <FileText className="h-6 w-6" />
                      <span className="ml-2">PDF</span>
                    </div>
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center bg-muted text-sm text-muted-foreground">
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
                <CardContent className="space-y-2 py-4 px-4">
                  <CardTitle className="text-center text-base font-semibold leading-snug text-slate-900 dark:text-slate-50">{item.titulo}</CardTitle>
                  <div className="text-center text-xs text-slate-700 dark:text-slate-200">
                    <span className="font-medium">{item.materia?.nombre ?? '—'}</span>
                    <span className="mx-1.5">•</span>
                    <span className="font-medium">{item.tipo?.nombre ?? '—'}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-700 dark:text-slate-200">
                    {(can('state_archivo') || item.can_update || item.autor?.id === page.props.auth.user?.id) && (
                      <Badge variant={estadoColor(item.estado?.nombre) as any}>
                        {item.estado?.nombre ?? 'Sin estado'}
                      </Badge>
                    )}
                    <span>Autor: {item.autor?.name ?? '—'}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-700 dark:text-slate-200">
                    <span className="inline-flex items-center gap-1" title="Visitas">
                      <Eye className="h-3 w-3" /> {item.visitas_count ?? 0}
                    </span>
                    <span className="inline-flex items-center gap-1" title="Valoraciones">
                      <Star className="h-3 w-3" />
                      {Number(item.valoraciones_avg_puntaje ?? 0).toFixed(1)} ({item.valoraciones_count ?? 0})
                    </span>
                    <span className="inline-flex items-center gap-1" title="Comentarios">
                      <MessageSquare className="h-3 w-3" /> {item.comentarios_count ?? 0}
                    </span>
                    <span className="inline-flex items-center gap-1" title="Guardados">
                      <Bookmark className="h-3 w-3" /> {item.savers_count ?? 0}
                    </span>
                  </div>
                </CardContent>
              </Link>
              <CardFooter className="flex justify-end gap-2 px-4 pb-4">
                {item.can_update && (
                  <Link href={route('archivos.edit', item.id)}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-800"
                    >
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
