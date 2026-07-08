import { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Eye,
    Bookmark,
    Star,
    MessageSquare,
    MessageCircle,
    GraduationCap,
    TrendingUp,
    Calendar,
    Edit2,
    FileText,
    Activity,
} from 'lucide-react';
import { route } from 'ziggy-js';
import { usePermissions } from '@/hooks/use-permissions';
import { ProgressModal } from '@/components/ProgressModal';

interface Relacion {
    id: number;
    nombre?: string;
    name?: string;
}

interface ArchivoLite {
    id: number;
    titulo: string;
    descripcion?: string | null;
    file_path?: string | null;
    thumbnail_path?: string | null;
    materia?: Relacion | null;
    tipo?: Relacion | null;
    estado?: Relacion | null;
    autor?: Relacion | null;
    visitas_count?: number;
    savers_count?: number;
    comentarios_count?: number;
    valoraciones_count?: number;
    valoraciones_avg_puntaje?: number | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
}

interface ActividadItem {
    type: 'comentario' | 'valoracion';
    id: number;
    archivo: { id: number; titulo: string };
    texto?: string | null;
    puntaje?: number;
    created_at?: string;
}

interface MateriaProgreso {
    id: number;
    nombre: string;
    codigo: string;
    anio_sugerido: number;
    cuatrimestre: number;
    estado: 'cursando' | 'regular' | 'aprobada' | 'promocionada' | 'pendiente';
    nota: number | null;
    tipo_asignatura?: string;
    fecha_aprobacion: string | null;
}

interface ProgresoStats {
    total_materias: number;
    aprobadas_count: number;
    cursando_count: number;
    regular_count: number;
    promedio: number;
    porcentaje: number;
    optativas_requeridas?: number;
}

export default function MisCosas({
    guardados,
    publicaciones,
    actividad,
    materiasPlan = [],
    progresoStats = {
        total_materias: 0,
        aprobadas_count: 0,
        cursando_count: 0,
        regular_count: 0,
        promedio: 0,
        porcentaje: 0,
    },
}: {
    guardados: Paginated<ArchivoLite>;
    publicaciones: Paginated<ArchivoLite>;
    actividad: Paginated<ActividadItem>;
    materiasPlan?: MateriaProgreso[];
    progresoStats?: ProgresoStats;
}) {
    const [tab, setTab] = useState<'progreso' | 'guardados' | 'publicaciones' | 'actividad'>(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const t = params.get('tab');
            if (t === 'progreso' || t === 'guardados' || t === 'publicaciones' || t === 'actividad') {
                return t;
            }
        }
        return 'progreso';
    });

    const [selectedMateria, setSelectedMateria] = useState<MateriaProgreso | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const page = usePage<{ auth: { user: { id: number } | null } }>();
    const { can } = usePermissions();
    const userId = page.props.auth.user?.id;

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Mis cosas', href: route('mis-cosas') }];

    // Sincronizar pestaña si la URL cambia (por ejemplo, al paginar en otra pestaña)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const t = params.get('tab');
            if (t === 'progreso' || t === 'guardados' || t === 'publicaciones' || t === 'actividad') {
                if (t !== tab) {
                    setTab(t);
                }
            } else {
                if (tab !== 'progreso') {
                    setTab('progreso');
                }
            }
        }
    }, [window.location.search]);

    const handleTabChange = (newTab: 'progreso' | 'guardados' | 'publicaciones' | 'actividad') => {
        setTab(newTab);
        const params = new URLSearchParams(window.location.search);
        params.set('tab', newTab);
        // Limpiamos los query params de paginación para arrancar de la página 1 en la nueva pestaña
        params.delete('guardados_page');
        params.delete('publicaciones_page');
        params.delete('actividad_page');

        router.get(route('mis-cosas'), Object.fromEntries(params.entries()), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleEditProgress = (materia: MateriaProgreso) => {
        setSelectedMateria(materia);
        setIsModalOpen(true);
    };

    const formatPeriodo = (cuatrimestre: number) => {
        if (cuatrimestre === 0) return 'Anual';
        if (cuatrimestre === 1) return 'Primer Cuatrimestre';
        if (cuatrimestre === 2) return 'Segundo Cuatrimestre';
        return `${cuatrimestre}º Cuatrimestre`;
    };

    const renderPagination = (links: PaginationLink[]) =>
        links.length > 1 && (
            <div className="flex flex-wrap gap-2 pt-4 justify-center">
                {links.map((link, idx) => {
                    const label =
                        link.label === '&laquo; Anterior'
                            ? 'Anterior'
                            : link.label === 'Siguiente &raquo;'
                                ? 'Siguiente'
                                : link.label;

                    return (
                        <Link
                            key={`${link.label}-${idx}`}
                            href={link.url ?? '#'}
                            preserveScroll
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${link.active
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : link.url
                                        ? 'hover:bg-slate-100 dark:hover:bg-neutral-900 border-border text-foreground'
                                        : 'opacity-50 cursor-not-allowed text-muted-foreground'
                                }`}
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                })}
            </div>
        );

    // Cálculos de Calificaciones Individuales del 4 al 10
    const gradesDistribution = useMemo(() => {
        const grades = materiasPlan
            .filter((m) => (m.estado === 'aprobada' || m.estado === 'promocionada') && m.nota !== null)
            .map((m) => m.nota as number);

        const counts: Record<number, number> = { 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
        grades.forEach((g) => {
            if (g >= 4 && g <= 10) {
                counts[g] = (counts[g] || 0) + 1;
            }
        });

        const maxCount = Math.max(...Object.values(counts), 1);

        return {
            counts,
            maxCount,
            total: grades.length,
        };
    }, [materiasPlan]);

    // Cálculos del Estado de la Carrera
    const careerBreakdown = useMemo(() => {
        const requiredOptativas = progresoStats.optativas_requeridas ?? 0;
        
        const obligatorias = materiasPlan.filter((m) => m.tipo_asignatura !== 'optativa');
        const optativas = materiasPlan.filter((m) => m.tipo_asignatura === 'optativa');

        const obAprobadas = obligatorias.filter((m) => m.estado === 'aprobada' || m.estado === 'promocionada').length;
        const obCursando = obligatorias.filter((m) => m.estado === 'cursando').length;
        const obRegular = obligatorias.filter((m) => m.estado === 'regular').length;

        const optAprobadas = optativas.filter((m) => m.estado === 'aprobada' || m.estado === 'promocionada').length;
        const optCursando = optativas.filter((m) => m.estado === 'cursando').length;
        const optRegular = optativas.filter((m) => m.estado === 'regular').length;

        const countOptAprobadas = Math.min(optAprobadas, requiredOptativas);
        let remaining = requiredOptativas - countOptAprobadas;

        const countOptCursando = Math.min(optCursando, remaining);
        remaining -= countOptCursando;

        const countOptRegular = Math.min(optRegular, remaining);
        remaining -= countOptRegular;

        const countOptPendiente = remaining;

        const aprobadas = obAprobadas + countOptAprobadas;
        const cursando = obCursando + countOptCursando;
        const regular = obRegular + countOptRegular;
        const pendiente = obligatorias.filter((m) => m.estado === 'pendiente').length + countOptPendiente;
        const total = obligatorias.length + requiredOptativas;

        return {
            total,
            aprobadas,
            cursando,
            regular,
            pendiente,
            pctAprobadas: total > 0 ? (aprobadas / total) * 100 : 0,
            pctCursando: total > 0 ? (cursando / total) * 100 : 0,
            pctRegular: total > 0 ? (regular / total) * 100 : 0,
            pctPendiente: total > 0 ? (pendiente / total) * 100 : 0,
        };
    }, [materiasPlan, progresoStats]);

    const renderArchivoCard = (item: ArchivoLite) => (
        <Link
            key={item.id}
            href={route('archivos.show', item.id)}
            className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
        >
            <Card className="group h-full overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/45">
                <div className="relative overflow-hidden bg-muted w-full">
                    {item.thumbnail_path ? (
                        <img
                            src={`/storage/${item.thumbnail_path}`}
                            alt={`Miniatura de ${item.titulo}`}
                            className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-52 w-full flex-col gap-2 items-center justify-center bg-gradient-to-br from-muted/50 to-muted/20 text-muted-foreground/80 transition-transform duration-300 group-hover:scale-105">
                            <FileText className="h-10 w-10 opacity-50" />
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Sin vista previa</span>
                        </div>
                    )}
                    {item.tipo?.nombre && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-black uppercase rounded bg-background/95 text-foreground border border-border/80 tracking-wider shadow-sm">
                            {item.tipo.nombre}
                        </span>
                    )}
                </div>
                <CardContent className="space-y-1.5 p-3 bg-card text-card-foreground">
                    <CardTitle className="text-sm font-bold line-clamp-1 leading-snug text-foreground">
                        {item.titulo}
                    </CardTitle>
                    <div className="text-[11px] text-muted-foreground line-clamp-1">
                        <span className="font-semibold text-foreground/80">
                            {item.materia?.nombre ?? 'Materia general'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                        {item.autor?.name && <span className="truncate max-w-[125px] font-medium">Por {item.autor.name}</span>}
                        {(can('state_archivo') || item.autor?.id === userId) && item.estado?.nombre && (
                            <span className={`text-[10px] font-bold ${item.estado.nombre === 'Aprobado'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-amber-600 dark:text-amber-500'
                                }`}>
                                {item.estado.nombre}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3 pt-2 text-[11px] text-muted-foreground border-t border-border/40">
                        <span className="inline-flex items-center gap-1" title="Visitas">
                            <Eye className="h-3.5 w-3.5 text-sky-500 opacity-80" /> {item.visitas_count ?? 0}
                        </span>
                        <span className="inline-flex items-center gap-0.5" title="Valoración promedio">
                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                            {item.valoraciones_avg_puntaje ? Number(item.valoraciones_avg_puntaje).toFixed(1) : '—'}
                        </span>
                        <span className="inline-flex items-center gap-1" title="Comentarios">
                            <MessageSquare className="h-3.5 w-3.5 text-emerald-500 opacity-80" /> {item.comentarios_count ?? 0}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis cosas | Panel de Control" />
            <div className="w-full px-4 py-8 md:px-8 space-y-8 animate-in fade-in duration-300">

                {/* Estructura con Sidebar integrada estilo GitHub / Panel Admin */}
                <div className="flex flex-col md:flex-row items-start gap-8">

                    {/* Barra lateral izquierda de navegación (Desktop) */}
                    <aside className="w-52 shrink-0 space-y-2 border-r border-border/60 pr-6 hidden md:block">
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 px-3 pb-2">
                                Mis Cosas
                            </h3>
                            <ul className="space-y-1">
                                {(['progreso', 'guardados', 'publicaciones', 'actividad'] as const).map((key) => {
                                    const active = tab === key;
                                    return (
                                        <li key={key}>
                                            <button
                                                onClick={() => handleTabChange(key)}
                                                className={`flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg w-full text-left transition-colors duration-150 cursor-pointer ${active
                                                        ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-sky-300 font-bold'
                                                        : 'text-foreground/75 hover:bg-muted hover:text-foreground'
                                                    }`}
                                            >
                                                {key === 'progreso' && <GraduationCap className="h-4.5 w-4.5" />}
                                                {key === 'guardados' && <Bookmark className="h-4.5 w-4.5" />}
                                                {key === 'publicaciones' && <FileText className="h-4.5 w-4.5" />}
                                                {key === 'actividad' && <Activity className="h-4.5 w-4.5" />}
                                                <span>
                                                    {key === 'progreso' && 'Mi Progreso'}
                                                    {key === 'guardados' && 'Mis Guardados'}
                                                    {key === 'publicaciones' && 'Mis Subidas'}
                                                    {key === 'actividad' && 'Mi Actividad'}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </aside>

                    {/* Menú de pestañas horizontales alternativo para Mobile */}
                    <div className="flex md:hidden w-full items-center gap-2 border-b border-border/80 overflow-x-auto pb-px">
                        {(['progreso', 'guardados', 'publicaciones', 'actividad'] as const).map((key) => (
                            <button
                                key={key}
                                className={`relative px-4 py-2.5 text-sm font-semibold transition-colors duration-150 whitespace-nowrap cursor-pointer ${tab === key
                                        ? 'text-primary dark:text-sky-400 font-bold'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                onClick={() => handleTabChange(key)}
                            >
                                <span className="flex items-center gap-2">
                                    {key === 'progreso' && <GraduationCap className="h-4 w-4" />}
                                    {key === 'guardados' && <Bookmark className="h-4 w-4" />}
                                    {key === 'publicaciones' && <FileText className="h-4 w-4" />}
                                    {key === 'actividad' && <Activity className="h-4 w-4" />}

                                    {key === 'progreso' && 'Mi Progreso'}
                                    {key === 'guardados' && 'Mis Guardados'}
                                    {key === 'publicaciones' && 'Mis Subidas'}
                                    {key === 'actividad' && 'Mi Actividad'}
                                </span>
                                {tab === key && (
                                    <span className="absolute inset-x-2 bottom-0 h-0.5 bg-primary dark:bg-sky-400 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Contenedor de Contenido Principal Derecho */}
                    <main className="flex-1 w-full min-w-0">

                        {/* --- SECCIÓN 1: MI PROGRESO ACADÉMICO --- */}
                        {tab === 'progreso' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                {/* Tabla de Materias (Ancho completo, espaciosa y compacta) */}
                                <div className="w-full">
                                    {materiasPlan.length === 0 ? (
                                        <Card className="p-8 text-center border border-dashed rounded-2xl">
                                            <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-3" />
                                            <p className="text-sm font-semibold text-muted-foreground">Inscríbete a una carrera en tu perfil para visualizar y trackear tu progreso académico.</p>
                                            <Link href={route('perfil.edit')} className="mt-4 inline-flex">
                                                <Button className="rounded-lg">Ir a mi Perfil</Button>
                                            </Link>
                                        </Card>
                                    ) : (
                                        <Card className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
                                            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/10">
                                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">Plan de Estudios</h3>
                                                <a
                                                    href={route('progreso.report')}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-lg h-9 gap-1.5 text-xs font-semibold border-red-500/20 bg-red-500/5 text-red-600 hover:bg-red-500/10 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                        
                                                    </Button>
                                                </a>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left border-collapse">
                                                    <thead className="bg-muted/40 text-muted-foreground font-mono tracking-wider border-b border-border/60">
                                                        <tr>
                                                            <th className="px-4 py-2.5 font-bold">Actividad</th>
                                                            <th className="px-3 py-2.5 w-[60px] font-bold text-center">Año</th>
                                                            <th className="px-4 py-2.5 w-[185px] font-bold">Período</th>
                                                            <th className="px-4 py-2.5 w-[120px] font-bold">Estado</th>
                                                            <th className="px-4 py-2.5 w-[140px] font-bold text-center">Nota</th>
                                                            <th className="px-3 py-2.5 w-[60px] text-center">Acción</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border/60">
                                                        {materiasPlan.map((materia) => {
                                                            let badgeColorClass = 'text-slate-500 dark:text-slate-400';
                                                            let badgeLabel = 'Pendiente';

                                                            if (materia.estado === 'cursando') {
                                                                badgeColorClass = 'text-sky-600 dark:text-sky-400';
                                                                badgeLabel = 'Cursando';
                                                            } else if (materia.estado === 'regular') {
                                                                badgeColorClass = 'text-amber-600 dark:text-amber-500';
                                                                badgeLabel = 'Regular';
                                                            } else if (materia.estado === 'aprobada') {
                                                                badgeColorClass = 'text-emerald-600 dark:text-emerald-400';
                                                                badgeLabel = 'Aprobada';
                                                            } else if (materia.estado === 'promocionada') {
                                                                badgeColorClass = 'text-emerald-600 dark:text-emerald-400';
                                                                badgeLabel = 'Promocionada';
                                                            }

                                                            // Nota en formato compacto
                                                            const getNotaDisplay = () => {
                                                                if (materia.estado === 'aprobada' || materia.estado === 'promocionada') {
                                                                    const label = materia.estado === 'promocionada' ? 'Promocionado' : 'Aprobado';
                                                                    return materia.nota !== null ? `${materia.nota} (${label})` : `(${label})`;
                                                                }
                                                                if (materia.estado === 'cursando') return '(Cursando)';
                                                                if (materia.estado === 'regular') return '(Regularidad)';
                                                                return '—';
                                                            };

                                                            return (
                                                                <tr key={materia.id} className="hover:bg-muted/20 transition-colors">
                                                                    <td className="px-4 py-1.5 font-medium text-slate-900 dark:text-slate-100">
                                                                        {materia.nombre} <span className="text-[10px] text-muted-foreground font-mono ml-1">({materia.codigo})</span>
                                                                    </td>
                                                                    <td className="px-3 py-1.5 text-center text-slate-700 dark:text-slate-300 font-medium">
                                                                        {materia.anio_sugerido}
                                                                    </td>
                                                                    <td className="px-4 py-1.5 text-slate-600 dark:text-slate-400">
                                                                        {formatPeriodo(materia.cuatrimestre)}
                                                                    </td>
                                                                    <td className="px-4 py-1.5 font-semibold text-xs">
                                                                        <span className={badgeColorClass}>
                                                                            {badgeLabel}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-1.5 text-center font-semibold text-slate-900 dark:text-slate-100">
                                                                        {getNotaDisplay()}
                                                                    </td>
                                                                    <td className="px-3 py-1.5 text-center">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-6 w-6 rounded-md hover:bg-muted"
                                                                            onClick={() => handleEditProgress(materia)}
                                                                        >
                                                                            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </Card>
                                    )}
                                </div>

                                {/* Panel de Estadísticas y Gráficos (Debajo de la tabla) */}
                                {materiasPlan.length > 0 && (
                                    <Card className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-6 shadow-sm animate-in fade-in duration-300">
                                        <div className="pointer-events-none absolute inset-0 opacity-30">
                                            <div className="absolute -left-20 -top-24 h-56 w-56 rounded-full bg-cyan-400/30 blur-3xl" />
                                            <div className="absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-purple-500/30 blur-3xl" />
                                        </div>

                                        <div className="relative space-y-6">
                                            <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">Rendimiento académico</h3>
                                            </div>

                                            <div className="grid gap-6 md:grid-cols-3">
                                                {/* Gráfico 1: Dona de Progreso y Promedio */}
                                                <div className="rounded-xl border border-border bg-card text-card-foreground p-5 shadow-xs transition hover:border-border/80 flex flex-col items-center justify-between min-h-[220px]">
                                                    <div className="relative h-24 w-24 shrink-0 mt-2">
                                                        <svg className="h-full w-full -rotate-90">
                                                            <circle
                                                                cx="48"
                                                                cy="48"
                                                                r="40"
                                                                className="stroke-muted/40 fill-none"
                                                                strokeWidth="6"
                                                            />
                                                            <circle
                                                                cx="48"
                                                                cy="48"
                                                                r="40"
                                                                className="stroke-emerald-500 fill-none transition-all duration-500"
                                                                strokeWidth="6"
                                                                strokeDasharray={2 * Math.PI * 40}
                                                                strokeDashoffset={(2 * Math.PI * 40) - (progresoStats.porcentaje / 100) * (2 * Math.PI * 40)}
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                        <span className="absolute inset-0 flex flex-col items-center justify-center">
                                                            <span className="text-xl font-black text-slate-800 dark:text-slate-100">
                                                                {progresoStats.porcentaje}%
                                                            </span>
                                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                                                Carrera
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div className="text-center w-full mt-4 pt-4 border-t border-border/40 flex justify-around">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Aprobadas</p>
                                                            <p className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">
                                                                {progresoStats.aprobadas_count} / {progresoStats.total_materias}
                                                            </p>
                                                        </div>
                                                        <div className="w-px bg-border/60" />
                                                        <div>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Promedio</p>
                                                            <p className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">
                                                                {progresoStats.promedio || '—'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Gráfico 2: Barra Horizontal de Avance del Plan */}
                                                <div className="rounded-xl border border-border bg-card text-card-foreground p-5 shadow-xs transition hover:border-border/80 flex flex-col justify-between min-h-[220px]">
                                                    <div>
                                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Plan de estudio</h4>
                                                        <div className="h-6 w-full rounded-lg overflow-hidden flex bg-muted/40 border border-border/30 mb-3">
                                                            {careerBreakdown.pctAprobadas > 0 && (
                                                                <div
                                                                    style={{ width: `${careerBreakdown.pctAprobadas}%` }}
                                                                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                                                                    title={`Aprobadas: ${careerBreakdown.aprobadas}`}
                                                                />
                                                            )}
                                                            {careerBreakdown.pctCursando > 0 && (
                                                                <div
                                                                    style={{ width: `${careerBreakdown.pctCursando}%` }}
                                                                    className="h-full bg-gradient-to-r from-sky-500 to-sky-400"
                                                                    title={`Cursando: ${careerBreakdown.cursando}`}
                                                                />
                                                            )}
                                                            {careerBreakdown.pctRegular > 0 && (
                                                                <div
                                                                    style={{ width: `${careerBreakdown.pctRegular}%` }}
                                                                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                                                                    title={`Regulares: ${careerBreakdown.regular}`}
                                                                />
                                                            )}
                                                            {careerBreakdown.pctPendiente > 0 && (
                                                                <div
                                                                    style={{ width: `${careerBreakdown.pctPendiente}%` }}
                                                                    className="h-full bg-muted/80"
                                                                    title={`Pendientes: ${careerBreakdown.pendiente}`}
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                                                                <span className="text-muted-foreground">Aprobadas:</span>
                                                                <span className="font-bold">{careerBreakdown.aprobadas}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="h-2.5 w-2.5 rounded-full bg-sky-500 shrink-0" />
                                                                <span className="text-muted-foreground">Cursando:</span>
                                                                <span className="font-bold">{careerBreakdown.cursando}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                                                                <span className="text-muted-foreground">Regulares:</span>
                                                                <span className="font-bold">{careerBreakdown.regular}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/60 shrink-0" />
                                                                <span className="text-muted-foreground">Pendientes:</span>
                                                                <span className="font-bold">{careerBreakdown.pendiente}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Gráfico 3: Notas (Diagrama de barras individuales del 4 al 10) */}
                                                <div className="rounded-xl border border-border bg-card text-card-foreground p-5 shadow-xs transition hover:border-border/80 flex flex-col justify-between min-h-[220px]">
                                                    <div>
                                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Notas</h4>
                                                    </div>

                                                    {gradesDistribution.total === 0 ? (
                                                        <div className="text-center py-6 text-xs text-muted-foreground italic flex items-center justify-center h-full">
                                                            Sin calificaciones registradas aún.
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-end gap-2.5 h-28 px-1 mt-2">
                                                            {[4, 5, 6, 7, 8, 9, 10].map((grade) => {
                                                                const count = gradesDistribution.counts[grade] || 0;
                                                                const percentage = (count / gradesDistribution.maxCount) * 100;
                                                                return (
                                                                    <div key={grade} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                                                                        <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">{count}</span>
                                                                        <div
                                                                            className="w-full bg-primary/80 dark:bg-sky-500/60 rounded-t-sm hover:bg-primary dark:hover:bg-sky-400 transition-all duration-300"
                                                                            style={{ height: `${Math.max(percentage, 5)}%` }}
                                                                            title={`Calificación ${grade}: ${count} materias`}
                                                                        />
                                                                        <span className="text-[9px] font-semibold text-muted-foreground">{grade}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* --- SECCIÓN 2: MIS GUARDADOS --- */}
                        {tab === 'guardados' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                {guardados.data.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-10 border border-dashed rounded-xl">
                                        Todavía no guardaste ningún archivo.
                                    </p>
                                ) : (
                                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                        {guardados.data.map(renderArchivoCard)}
                                    </div>
                                )}
                                {renderPagination(guardados.links)}
                            </div>
                        )}

                        {/* --- SECCIÓN 3: MIS SUBIDAS --- */}
                        {tab === 'publicaciones' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                {publicaciones.data.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-10 border border-dashed rounded-xl">
                                        Todavía no has subido archivos al repositorio.
                                    </p>
                                ) : (
                                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                        {publicaciones.data.map(renderArchivoCard)}
                                    </div>
                                )}
                                {renderPagination(publicaciones.links)}
                            </div>
                        )}

                        {/* --- SECCIÓN 4: MI ACTIVIDAD RECIENTE (Tabla simple) --- */}
                        {tab === 'actividad' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                {actividad.data.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-10 border border-dashed rounded-xl">
                                        Sin actividad reciente (comentarios o valoraciones).
                                    </p>
                                ) : (
                                    <Card className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left border-collapse">
                                                <thead className="bg-muted/40 text-muted-foreground font-mono tracking-wider border-b border-border/60">
                                                    <tr>
                                                        <th className="px-4 py-2.5 w-[110px] font-bold">Fecha</th>
                                                        <th className="px-4 py-2.5 w-[120px] font-bold">Actividad</th>
                                                        <th className="px-4 py-2.5 font-bold">Archivo</th>
                                                        <th className="px-4 py-2.5 font-bold">Detalle</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/60">
                                                    {actividad.data.map((item) => {
                                                        const isComment = item.type === 'comentario';
                                                        return (
                                                            <tr key={`${item.type}-${item.id}`} className="hover:bg-muted/20 transition-colors">
                                                                <td className="px-4 py-2.5 text-muted-foreground font-medium">
                                                                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                                                                </td>
                                                                <td className="px-4 py-2.5 font-semibold">
                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border-none ${isComment
                                                                            ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                                                                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-500'
                                                                        }`}>
                                                                        {isComment ? 'Comentario' : 'Valoración'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-2.5 font-bold text-foreground">
                                                                    <Link href={route('archivos.show', item.archivo.id)} className="hover:text-primary dark:hover:text-sky-400 transition-colors">
                                                                        {item.archivo.titulo}
                                                                    </Link>
                                                                </td>
                                                                <td className="px-4 py-2.5 text-foreground/80">
                                                                    {isComment ? (
                                                                        <span className="italic">"{item.texto}"</span>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-bold text-amber-600 dark:text-amber-400">{item.puntaje} / 5</span>
                                                                            {item.texto && <span className="text-muted-foreground italic">("{item.texto}")</span>}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Card>
                                )}
                                {renderPagination(actividad.links)}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Modal de progreso de materias */}
            <ProgressModal
                materia={selectedMateria}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedMateria(null);
                }}
            />
        </AppLayout>
    );
}
