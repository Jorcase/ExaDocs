import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import React, { Fragment, useState } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { Bookmark, BookmarkCheck, Eye, MessageSquare, Star, MoreVertical, Flag, History, FileTextIcon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface Relacion {
    id: number;
    nombre?: string;
    name?: string;
    profile?: {
        id: number;
        avatar_url?: string | null;
        nombre_completo?: string | null;
    };
}

interface Comentario {
    id: number;
    cuerpo: string;
    autor?: Relacion | null;
}

interface Valoracion {
    id: number;
    puntaje: number;
    comentario?: string | null;
    autor?: Relacion | null;
}

interface Archivo {
    id: number;
    titulo: string;
    descripcion?: string | null;
    file_path: string;
    thumbnail_path?: string | null;
    peso_bytes?: number | null;
    publicado_en?: string | null;
    observaciones_admin?: string | null;
    visitas_count?: number;
    savers_count?: number;
    is_saved?: boolean;
    comentarios_count?: number;
    valoraciones_count?: number;
    valoraciones_avg_puntaje?: number | null;
    materia?: Relacion | null;
    tipo?: Relacion | null;
    estado?: Relacion | null;
    autor?: Relacion | null;
    plan_estudio?: Relacion | null;
    comentarios?: Comentario[];
    valoraciones?: Valoracion[];
}

interface EstadoOption {
    id: number;
    nombre: string;
}

export default function Show({ archivo, estados, backUrl }: { archivo: Archivo; estados: EstadoOption[]; backUrl?: string }) {
    const { props } = usePage<{ auth?: { user?: { id: number; name: string } } }>();
    const userId = props.auth?.user?.id;
    const { can } = usePermissions();
    const canViewPdf = can('view_pdf');
    const canInteract = can('interaction_archivos');
    const canModerate = can('view_moderacion');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Archivos', href: backUrl ?? route('archivos.index') },
        { title: archivo.titulo, href: route('archivos.show', archivo.id) },
    ];

    const { data: dataComentario, setData: setComentario, post: postComentario, processing: loadingComentario, errors: errorsComentario, reset: resetComentario } = useForm({
        archivo_id: archivo.id,
        user_id: userId ?? '',
        cuerpo: '',
    });

    const { data: dataValoracion, setData: setValoracion, post: postValoracion, processing: loadingValoracion, errors: errorsValoracion, reset: resetValoracion } = useForm({
        archivo_id: archivo.id,
        user_id: userId ?? '',
        puntaje: 5,
        comentario: '',
    });

    const { data: dataReporte, setData: setReporte, post: postReporte, processing: loadingReporte, errors: errorsReporte, reset: resetReporte } = useForm({
        archivo_id: archivo.id,
        reportante_id: userId ?? '',
        motivo: 'spam',
        detalle: '',
        estado: 'pendiente',
        resuelto_por: null as number | null,
        resuelto_en: null as string | null,
    });

    const { post: postSave, delete: deleteSave, processing: loadingSave } = useForm({});
    const [openComentario, setOpenComentario] = useState(false);
    const [openValoracion, setOpenValoracion] = useState(false);
    const [openReporte, setOpenReporte] = useState(false);
    const [editingComentario, setEditingComentario] = useState<Comentario | null>(null);
    const [editingValoracion, setEditingValoracion] = useState<Valoracion | null>(null);
    const [activeSection, setActiveSection] = useState<'comentarios' | 'valoraciones'>('comentarios');

    const {
        data: dataEditComentario,
        setData: setDataEditComentario,
        put: putComentario,
        processing: loadingEditComentario,
        errors: errorsEditComentario,
        reset: resetEditComentario,
    } = useForm({
        cuerpo: '',
    });

    const {
        data: dataEditValoracion,
        setData: setDataEditValoracion,
        put: putValoracion,
        processing: loadingEditValoracion,
        errors: errorsEditValoracion,
        reset: resetEditValoracion,
    } = useForm({
        puntaje: 5,
        comentario: '',
    });

    const { delete: destroyComentario } = useForm({});
    const { delete: destroyValoracion } = useForm({});

    const formatDate = (value?: string | null) => {
        if (!value) return '—';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatSize = (bytes?: number | null) => {
        if (!bytes) return '—';
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    };

    const toggleSave = () => {
        if (!userId || !canInteract) return;
        if (archivo.is_saved) {
            deleteSave(route('archivos.unsave', archivo.id), { preserveScroll: true });
        } else {
            postSave(route('archivos.save', archivo.id), { preserveScroll: true });
        }
    };

    const handleEditComentario = (comentario: Comentario) => {
        setEditingComentario(comentario);
        setDataEditComentario('cuerpo', comentario.cuerpo);
    };

    const submitEditComentario = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingComentario) return;
        putComentario(route('comentarios.update', editingComentario.id), {
            preserveScroll: true,
            onSuccess: () => {
                resetEditComentario();
                setEditingComentario(null);
            },
        });
    };

    const handleDeleteComentario = (comentario: Comentario) => {
        if (!canInteract || !userId || comentario.autor?.id !== userId) return;
        destroyComentario(route('comentarios.destroy', comentario.id), { preserveScroll: true });
    };

    const handleEditValoracion = (valoracion: Valoracion) => {
        setEditingValoracion(valoracion);
        setDataEditValoracion('puntaje', valoracion.puntaje);
        setDataEditValoracion('comentario', valoracion.comentario ?? '');
    };

    const submitEditValoracion = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingValoracion) return;
        putValoracion(route('valoraciones.update', editingValoracion.id), {
            preserveScroll: true,
            onSuccess: () => {
                resetEditValoracion();
                setEditingValoracion(null);
            },
        });
    };

    const handleDeleteValoracion = (valoracion: Valoracion) => {
        if (!canInteract || !userId || valoracion.autor?.id !== userId) return;
        destroyValoracion(route('valoraciones.destroy', valoracion.id), { preserveScroll: true });
    };


    const handleComentario = (e: React.FormEvent) => {
        e.preventDefault();
        postComentario(route('comentarios.store'), {
            onSuccess: () => {
                resetComentario('cuerpo');
                setOpenComentario(false);
            },
        });
    };

    const handleValoracion = (e: React.FormEvent) => {
        e.preventDefault();
        postValoracion(route('valoraciones.store'), {
            onSuccess: () => {
                resetValoracion('comentario');
                setOpenValoracion(false);
            },
        });
    };

    const handleReporte = (e: React.FormEvent) => {
        e.preventDefault();
        postReporte(route('reportes.store'), {
            onSuccess: () => {
                resetReporte('detalle');
                setReporte('motivo', 'spam');
                setOpenReporte(false);
            },
        });
    };

    const fileUrl = `/storage/${archivo.file_path}`;
    const thumbnailUrl = archivo.thumbnail_path ? `/storage/${archivo.thumbnail_path}` : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Archivos | ${archivo.titulo}`} />
            <div className="m-4 space-y-6">
                <Card className="border-2 border-border/70 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-4 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
                <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                            <CardTitle className="text-xl">{archivo.titulo}</CardTitle>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                    <Eye className="h-4 w-4" /> {archivo.visitas_count ?? 0} visitas
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <Star className="h-4 w-4" />
                                    {Number(archivo.valoraciones_avg_puntaje ?? 0).toFixed(1)} ({archivo.valoraciones_count ?? 0})
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <MessageSquare className="h-4 w-4" /> {archivo.comentarios_count ?? 0} comentarios
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <Bookmark className="h-4 w-4" /> {archivo.savers_count ?? 0} guardados
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={backUrl ?? route('archivos.index')} preserveScroll>
                                <Button variant="outline">Volver</Button>
                            </Link>
                            {canViewPdf && (
                                <a
                                    href={route('archivos.detail-report', archivo.id)}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                                    >
                                        <FileTextIcon className="h-4 w-4" />
                                    </Button>
                                </a>
                            )}
                        </div>
                    </div>
                </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex flex-wrap gap-3">
                            <Badge variant="secondary">{archivo.materia?.nombre ?? 'Sin materia'}</Badge>
                            <Badge variant="secondary">{archivo.tipo?.nombre ?? 'Sin tipo'}</Badge>
                            <Badge variant="outline">{archivo.estado?.nombre ?? 'Sin estado'}</Badge>
                        </div>
                        <div className="space-y-3 rounded-xl bg-white/10 p-3 text-sm text-slate-900 dark:bg-white/5 dark:text-slate-100">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                  <span className="font-semibold">De:</span>
                                  {archivo.autor?.profile?.id ? (
                                    <Link
                                      className="flex items-center gap-2 text-primary underline"
                                      href={route('perfil.public', archivo.autor.profile.id)}
                                    >
                                      <div className="h-9 w-9 overflow-hidden rounded-full border border-border bg-muted/70">
                                        {archivo.autor.profile.avatar_url ? (
                                          <img
                                            src={archivo.autor.profile.avatar_url}
                                            alt={archivo.autor.profile.nombre_completo ?? archivo.autor.name ?? 'Autor'}
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                                            {(archivo.autor.profile.nombre_completo ?? archivo.autor.name ?? '?').slice(0, 1).toUpperCase()}
                                          </div>
                                        )}
                                      </div>
                                      <span>{archivo.autor.profile.nombre_completo ?? archivo.autor.name ?? 'Ver perfil'}</span>
                                    </Link>
                                  ) : (
                                    <span>{archivo.autor?.name ?? '—'}</span>
                                  )}
                                </div>
                                <div>
                                    {archivo.descripcion && (
                                        <strong>Descripción: {archivo.descripcion}</strong>
                                    )}
                                </div>
                                <div >
                                  <strong>Plan:</strong> {archivo.plan_estudio?.nombre ?? '—'}
                                </div>
                                <div >
                                  <strong>Peso:</strong> {formatSize(archivo.peso_bytes)}
                                </div>
                                                                <div>            
                                    <p>
                                        <strong>Archivo:</strong>{' '}
                                        {userId && canInteract ? (
                                            <a className="text-primary underline" href={fileUrl} target="_blank" rel="noreferrer">
                                                Ver / descargar
                                            </a>
                                        ) : userId ? (
                                            <span className="text-muted-foreground">No tenés permiso para ver/descargar.</span>
                                        ) : (
                                            <span className="text-muted-foreground">Iniciá sesión para ver/descargar.</span>
                                        )}
                                    </p>
                                </div>
                                <div >
                                  <strong>Publicado:</strong> {formatDate(archivo.publicado_en)}
                                </div>

                                
                            </div>
                        </div>

                        {thumbnailUrl ? (
                            <div className="border-2 border-border/70 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-white p-3 flex justify-center dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
                                <img
                                    src={thumbnailUrl}
                                    alt={`Miniatura de ${archivo.titulo}`}
                                    className="max-h-[520px] w-auto object-contain"
                                />
                            </div>
                        ) : (
                            <div className="border-2 border-border/70 rounded-xl bg-gradient-to-r from-slate-100 via-slate-50 to-white p-4 text-sm text-muted-foreground dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
                                No hay miniatura disponible. Podés ver o descargar el archivo.
                            </div>
                        )}
                        {archivo.observaciones_admin && (
                            <div className="pt-2">
                                <p className="font-semibold">Observaciones</p>
                                <p className="text-sm text-muted-foreground">{archivo.observaciones_admin}</p>
                            </div>
                        )}
                        <div className="flex flex-wrap items-center justify-end gap-2 text-sm pt-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="inline-flex items-center gap-2"
                                    onClick={() => setOpenValoracion(true)}
                                >
                                    <Star className="h-4 w-4" /> Valorar ({archivo.valoraciones_count ?? 0})
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="inline-flex items-center gap-2"
                                    onClick={() => setOpenComentario(true)}
                                >
                                    <MessageSquare className="h-4 w-4" /> Comentarios ({archivo.comentarios_count ?? 0})
                                </Button>
                                {canInteract && userId && (
                                    <Button
                                        variant={archivo.is_saved ? 'secondary' : 'outline'}
                                        size="sm"
                                        onClick={toggleSave}
                                        disabled={loadingSave}
                                        className="inline-flex items-center gap-2"
                                    >
                                        {archivo.is_saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                                        {archivo.is_saved ? 'Guardado' : 'Guardar'}
                                    </Button>
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    {canInteract && userId && (
                                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setOpenReporte(true); }}>
                                            <Flag className="mr-2 h-4 w-4" />
                                            Reportar
                                        </DropdownMenuItem>
                                    )}
                                    {canModerate && (
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={`${route('historial-revisiones.create')}?archivo_id=${archivo.id}&estado_archivo_id=${archivo.estado?.id ?? ''}`}
                                            >
                                                <History className="mr-2 h-4 w-4" />
                                                Historial de revisiones
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <div className="flex justify-center gap-4 border-b border-border/60 pb-2">
                        {(['comentarios', 'valoraciones'] as const).map((section) => (
                            <button
                                key={section}
                                onClick={() => setActiveSection(section)}
                                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                                    activeSection === section ? 'text-slate-900 dark:text-white' : 'text-muted-foreground'
                                }`}
                            >
                                {section === 'comentarios' ? 'Comentarios' : 'Valoraciones'}
                                {activeSection === section && (
                                    <span className="absolute inset-x-2 -bottom-[1px] h-0.5 rounded-full bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>

                    {activeSection === 'comentarios' && (
                        <Card className="border-2 border-border/70 bg-gradient-to-r from-slate-50 via-slate-100 to-white shadow-sm dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Comentarios</CardTitle>
                                    {canInteract && userId && (
                                        <Dialog open={openComentario} onOpenChange={setOpenComentario}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" variant="outline">Comentar</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Nuevo comentario</DialogTitle>
                                                </DialogHeader>
                                                <form onSubmit={handleComentario} className="space-y-3">
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="cuerpo">Comentario</Label>
                                                        <Textarea
                                                            id="cuerpo"
                                                            value={dataComentario.cuerpo}
                                                            onChange={(e) => setComentario('cuerpo', e.target.value)}
                                                            placeholder="Escribe tu comentario..."
                                                        />
                                                        {errorsComentario.cuerpo && (
                                                            <p className="text-sm text-destructive">{errorsComentario.cuerpo}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" type="button" onClick={() => setOpenComentario(false)}>Cancelar</Button>
                                                        <Button disabled={loadingComentario} type="submit">Guardar</Button>
                                                    </div>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-3">
                                    {(archivo.comentarios ?? []).map((c) => (
                                        <div key={c.id} className="rounded-xl border-2 border-border/70 bg-gradient-to-br from-slate-50 via-slate-100 to-white p-3 space-y-1 text-slate-900 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-muted-foreground">{c.autor?.name ?? '—'}</p>
                                                {userId && canInteract && c.autor?.id === userId && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onSelect={(e) => {
                                                                    e.preventDefault();
                                                                    handleEditComentario(c);
                                                                }}
                                                            >
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onSelect={(e) => {
                                                                    e.preventDefault();
                                                                    handleDeleteComentario(c);
                                                                }}
                                                            >
                                                                Eliminar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap">{c.cuerpo}</p>
                                        </div>
                                    ))}
                                    {(!archivo.comentarios || archivo.comentarios.length === 0) && (
                                        <p className="text-sm text-muted-foreground">Todavía no hay comentarios.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeSection === 'valoraciones' && (
                        <Card className="border-2 border-border/70 bg-gradient-to-r from-slate-50 via-slate-100 to-white shadow-sm dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Valoraciones</CardTitle>
                                    {canInteract && userId && (
                                        <Dialog open={openValoracion} onOpenChange={setOpenValoracion}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" variant="outline">Valorar</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Nueva valoración</DialogTitle>
                                                </DialogHeader>
                                                <form onSubmit={handleValoracion} className="space-y-3">
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="puntaje">Puntaje (1 a 5)</Label>
                                                        <Input
                                                            id="puntaje"
                                                            type="number"
                                                            min={1}
                                                            max={5}
                                                            value={dataValoracion.puntaje}
                                                            onChange={(e) => setValoracion('puntaje', Number(e.target.value))}
                                                        />
                                                        {errorsValoracion.puntaje && (
                                                            <p className="text-sm text-destructive">{errorsValoracion.puntaje}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="comentarioValoracion">Comentario</Label>
                                                        <Textarea
                                                            id="comentarioValoracion"
                                                            value={dataValoracion.comentario}
                                                            onChange={(e) => setValoracion('comentario', e.target.value)}
                                                            placeholder="Opcional"
                                                        />
                                                        {errorsValoracion.comentario && (
                                                            <p className="text-sm text-destructive">{errorsValoracion.comentario}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" type="button" onClick={() => setOpenValoracion(false)}>Cancelar</Button>
                                                        <Button disabled={loadingValoracion} type="submit">Guardar</Button>
                                                    </div>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-3">
                                    {(archivo.valoraciones ?? []).map((v) => (
                                        <div key={v.id} className="rounded-xl border-2 border-border/70 bg-gradient-to-br from-slate-50 via-slate-100 to-white p-3 space-y-1 text-slate-900 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>{v.autor?.name ?? '—'}</span>
                                                    <Badge variant="secondary">{v.puntaje}/5</Badge>
                                                </div>
                                                {userId && canInteract && v.autor?.id === userId && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onSelect={(e) => {
                                                                    e.preventDefault();
                                                                    handleEditValoracion(v);
                                                                }}
                                                            >
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onSelect={(e) => {
                                                                    e.preventDefault();
                                                                    handleDeleteValoracion(v);
                                                                }}
                                                            >
                                                                Eliminar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                            {v.comentario && <p className="text-sm whitespace-pre-wrap">{v.comentario}</p>}
                                        </div>
                                    ))}
                                    {(!archivo.valoraciones || archivo.valoraciones.length === 0) && (
                                        <p className="text-sm text-muted-foreground">Haz una valoración si te sirvio el archivo.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
            {canInteract && userId && (
                <Dialog open={openReporte} onOpenChange={setOpenReporte}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reportar contenido</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleReporte} className="space-y-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="motivo">Motivo</Label>
                                <select
                                    id="motivo"
                                    className="w-full rounded border bg-background p-2"
                                    value={dataReporte.motivo}
                                    onChange={(e) => setReporte('motivo', e.target.value)}
                                >
                                    <option value="spam">Spam</option>
                                    <option value="contenido_incorrecto">Contenido incorrecto</option>
                                    <option value="copyright">Copyright</option>
                                    <option value="otro">Otro</option>
                                </select>
                                {errorsReporte.motivo && (
                                    <p className="text-sm text-destructive">{errorsReporte.motivo}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="detalle">Detalle</Label>
                                <Textarea
                                    id="detalle"
                                    value={dataReporte.detalle}
                                    onChange={(e) => setReporte('detalle', e.target.value)}
                                    placeholder="Explicá brevemente el problema"
                                />
                                {errorsReporte.detalle && (
                                    <p className="text-sm text-destructive">{errorsReporte.detalle}</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" onClick={() => setOpenReporte(false)}>Cancelar</Button>
                                <Button disabled={loadingReporte} type="submit">Enviar reporte</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {editingComentario && (
                <Dialog open={!!editingComentario} onOpenChange={(open) => {
                    if (!open) {
                        setEditingComentario(null);
                        resetEditComentario();
                    }
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar comentario</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitEditComentario} className="space-y-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit_cuerpo">Comentario</Label>
                                <Textarea
                                    id="edit_cuerpo"
                                    value={dataEditComentario.cuerpo}
                                    onChange={(e) => setDataEditComentario('cuerpo', e.target.value)}
                                />
                                {errorsEditComentario.cuerpo && (
                                    <p className="text-sm text-destructive">{errorsEditComentario.cuerpo}</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" onClick={() => { setEditingComentario(null); resetEditComentario(); }}>Cancelar</Button>
                                <Button disabled={loadingEditComentario} type="submit">Guardar</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {editingValoracion && (
                <Dialog open={!!editingValoracion} onOpenChange={(open) => {
                    if (!open) {
                        setEditingValoracion(null);
                        resetEditValoracion();
                    }
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar valoración</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitEditValoracion} className="space-y-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit_puntaje">Puntaje (1 a 5)</Label>
                                <Input
                                    id="edit_puntaje"
                                    type="number"
                                    min={1}
                                    max={5}
                                    value={dataEditValoracion.puntaje}
                                    onChange={(e) => setDataEditValoracion('puntaje', Number(e.target.value))}
                                />
                                {errorsEditValoracion.puntaje && (
                                    <p className="text-sm text-destructive">{errorsEditValoracion.puntaje}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit_comentario_val">Comentario</Label>
                                <Textarea
                                    id="edit_comentario_val"
                                    value={dataEditValoracion.comentario}
                                    onChange={(e) => setDataEditValoracion('comentario', e.target.value)}
                                    placeholder="Opcional"
                                />
                                {errorsEditValoracion.comentario && (
                                    <p className="text-sm text-destructive">{errorsEditValoracion.comentario}</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" onClick={() => { setEditingValoracion(null); resetEditValoracion(); }}>Cancelar</Button>
                                <Button disabled={loadingEditValoracion} type="submit">Guardar</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </AppLayout>
    );
}
