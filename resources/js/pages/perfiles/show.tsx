import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/use-permissions';
import {
    MapPin,
    Mail,
    Edit2,
    Share2,
    FileText,
    Award,
    Activity,
    CheckCircle,
    ChevronRight,
    User,
    Compass,
    Phone,
    FileSignature,
    GraduationCap,
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    carreras?: { id: number; nombre: string }[];
}

interface Perfil {
    id: number;
    user_id: number;
    nombre_completo?: string | null;
    documento?: string | null;
    carrera_principal_id?: number | null;
    telefono?: string | null;
    avatar_path?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    user: User;
    carrera?: { id: number; nombre: string } | null;
}

interface ArchivoLite {
    id: number;
    titulo: string;
    publicado_en?: string | null;
    materia?: { nombre: string } | null;
    tipo?: { nombre: string } | null;
    estado?: { nombre: string } | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    total: number;
}

interface SemesterProgress {
    label: string;
    percentage: number;
}

interface ProgresoStats {
    total_materias: number;
    aprobadas_count: number;
    promedio: number;
    porcentaje: number;
}

export default function Show({
    perfil,
    archivos,
    progresoStats = {
        total_materias: 0,
        aprobadas_count: 0,
        promedio: 0,
        porcentaje: 0,
    },
    semesterProgress = [],
}: {
    perfil: Perfil;
    archivos: Paginated<ArchivoLite>;
    progresoStats?: ProgresoStats;
    semesterProgress?: SemesterProgress[];
}) {
    const { can } = usePermissions();
    const { props } = usePage<{ auth: { user: { id: number } } }>();

    const isOwner = props.auth?.user?.id === perfil.user_id;
    const canViewPersonalInfo = isOwner || can('edit_perfiles');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mi Perfil', href: route('perfil.show') },
    ];

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
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                                link.active
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Perfil de ${perfil.nombre_completo || perfil.user.name}`} />
            <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 space-y-8 animate-in fade-in duration-300">
                
                {/* 1. PROFILE HEADER SECTION */}
                <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/80 pb-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                        {/* Avatar */}
                        <div className="relative group shrink-0">
                            <div className="h-28 w-28 rounded-2xl border border-border shadow-md overflow-hidden bg-accent/40 dark:bg-muted">
                                {perfil.avatar_url ? (
                                    <img
                                        src={perfil.avatar_url}
                                        alt={perfil.user.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-800 dark:text-slate-200 text-3xl font-black">
                                        {perfil.user.name.slice(0, 1).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            {isOwner && (
                                <Link
                                    href={route('perfil.edit')}
                                    className="absolute -bottom-2 -right-2 bg-primary dark:bg-blue-500 text-white p-2 rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </Link>
                            )}
                        </div>

                        {/* Name & Title */}
                        <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50">
                                    {perfil.nombre_completo || perfil.user.name}
                                </h2>
                            </div>
                            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                                {perfil.carrera?.nombre || 'Sin Carrera Principal Registrada'}
                            </p>
                            
                            {/* Contact Details */}
                            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-1 pt-2 text-xs text-muted-foreground font-medium">
                                <span className="inline-flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-400" />
                                    {perfil.user.email}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center sm:justify-end gap-3">
                        {isOwner && (
                            <Link href={route('perfil.edit')}>
                                <Button variant="outline" className="rounded-lg gap-2">
                                    <Edit2 className="h-4 w-4" />
                                    Editar Perfil
                                </Button>
                            </Link>
                        )}
                        
                    </div>
                </section>

                {/* 2. BENTO STATS & PROGRESS */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Career Progress Box */}
                    <div className="md:col-span-2 rounded-2xl border border-border bg-card text-card-foreground p-6 flex flex-col justify-between shadow-xs">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">Progreso Académico</h3>
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                {progresoStats.porcentaje}% Completado
                            </div>
                        </div>

                        {/* Chart Grid */}
                        {semesterProgress.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border/80 rounded-xl text-center p-4">
                                <GraduationCap className="h-10 w-10 text-muted-foreground/60 mb-2" />
                                <p className="text-xs text-muted-foreground">Inscríbete a una carrera y registra notas para visualizar el progreso anual.</p>
                            </div>
                        ) : (
                            <div className="flex items-end gap-4 h-48 px-4">
                                {semesterProgress.map((sem, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                        <div 
                                            className="w-full bg-primary/80 dark:bg-blue-500/80 hover:bg-primary dark:hover:bg-blue-400 rounded-t-lg transition-all duration-300"
                                            style={{ height: `${Math.max(sem.percentage, 5)}%` }}
                                        />
                                        <span className="text-[10px] font-semibold text-muted-foreground whitespace-nowrap">{sem.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Stats Footer Row */}
                        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border/50">
                            <div>
                                <div className="text-lg font-black text-slate-900 dark:text-slate-100">{progresoStats.aprobadas_count}</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Materias Aprobadas</div>
                            </div>
                            <div>
                                <div className="text-lg font-black text-slate-900 dark:text-slate-100">
                                    {Math.max(progresoStats.total_materias - progresoStats.aprobadas_count, 0)}
                                </div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Materias Pendientes</div>
                            </div>
                            <div>
                                <div className="text-lg font-black text-slate-900 dark:text-slate-100">{progresoStats.promedio || '—'}</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Promedio General</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Cards */}
                    <div className="flex flex-col gap-6 justify-between">
                        {/* Bio box */}
                        <Card className="rounded-2xl border border-border p-6 flex flex-col shadow-xs flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <Award className="h-5 w-5 text-slate-400 dark:text-slate-400" />
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sobre Mí</h4>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 italic flex-1">
                                {perfil.bio ? `"${perfil.bio}"` : 'Sin biografía cargada por el estudiante.'}
                            </p>
                        </Card>

                        {/* Publications count */}
                        <Card className="rounded-2xl border border-border p-6 flex flex-col items-center justify-center text-center shadow-xs">
                            <div className="w-12 h-12 bg-primary/10 dark:bg-muted text-primary dark:text-slate-300 rounded-full flex items-center justify-center mb-4">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div className="text-2xl font-black text-slate-900 dark:text-slate-50">{archivos.total}</div>
                            <div className="text-xs font-semibold text-muted-foreground">Documentos Subidos</div>
                        </Card>
                    </div>
                </section>

                {/* 3. DETAILS & UPLOADS GRID */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Personal info */}
                    {canViewPersonalInfo && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-border/80 pb-1">
                                Información Personal
                            </h3>
                            <Card className="rounded-2xl border border-border p-6 shadow-xs space-y-4">
                                {(() => {
                                    const carrerasValue = perfil.user.carreras && perfil.user.carreras.length > 0
                                        ? perfil.user.carreras.map(c => c.nombre).join(', ')
                                        : (perfil.carrera?.nombre || 'No cargado');

                                    const infoItems = [
                                        { label: 'Nombre completo', value: perfil.nombre_completo || 'No cargado', icon: User },
                                        { label: 'Nombre de usuario', value: `${perfil.user.name}`, icon: Compass },
                                        { label: 'Email', value: perfil.user.email, icon: Mail },
                                        { label: 'Documento', value: perfil.documento || 'No cargado', icon: FileSignature },
                                        { label: 'Teléfono', value: perfil.telefono || 'No cargado', icon: Phone },
                                        { label: 'Carreras', value: carrerasValue, icon: GraduationCap },
                                    ];

                                    return infoItems.map((item, idx) => {
                                        const IconComponent = item.icon;
                                        return (
                                            <div key={idx} className="flex items-start gap-3 text-sm">
                                                <IconComponent className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                        {item.label}
                                                    </p>
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{item.value}</p>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </Card>
                        </div>
                    )}

                    {/* Right Column: Uploaded documents list */}
                    <div className={canViewPersonalInfo ? 'lg:col-span-2 space-y-4' : 'lg:col-span-3 space-y-4'}>
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-border/80 pb-1 flex justify-between items-center">
                            <span>Publicaciones del Usuario</span>
                            <span className="text-xs text-muted-foreground font-semibold">Total: {archivos.total}</span>
                        </h3>

                        {archivos.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-10 border border-dashed rounded-2xl">
                                Todavía no ha publicado ningún archivo en el repositorio.
                            </p>
                        ) : (
                            <div className="grid gap-3">
                                {archivos.data.map((archivo) => (
                                    <Link
                                        key={archivo.id}
                                        href={route('archivos.show', archivo.id)}
                                        className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-card hover:border-primary/40 dark:hover:bg-accent/30 shadow-xs transition duration-200 group"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-10 h-10 bg-primary/10 dark:bg-muted text-primary dark:text-slate-300 rounded-lg flex items-center justify-center shrink-0">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-primary dark:group-hover:text-slate-200 transition-colors truncate">
                                                    {archivo.titulo}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 truncate">
                                                    <span>{archivo.materia?.nombre || 'General'}</span>
                                                    <span>•</span>
                                                    <span className="font-semibold text-primary dark:text-slate-300">
                                                        {archivo.tipo?.nombre || 'Apunte'}
                                                    </span>
                                                    {archivo.publicado_en && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{archivo.publicado_en}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                ))}
                            </div>
                        )}
                        {renderPagination(archivos.links)}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
