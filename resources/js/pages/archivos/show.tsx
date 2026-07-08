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
import {
  Bookmark,
  BookmarkCheck,
  Eye,
  MessageSquare,
  Star,
  MoreVertical,
  Flag,
  History,
  FileText,
  FileDown,
  ArrowLeft,
  Calendar,
  Layers,
  FileSignature,
  FileTextIcon,
  Send,
  Plus,
} from 'lucide-react';
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
  autor?: (Relacion & { profile?: { id: number } | null }) | null;
}

interface Valoracion {
  id: number;
  puntaje: number;
  comentario?: string | null;
  autor?: (Relacion & { profile?: { id: number } | null }) | null;
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

export default function Show({
  archivo,
  estados,
  backUrl,
}: {
  archivo: Archivo;
  estados: EstadoOption[];
  backUrl?: string;
}) {
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

  const {
    data: dataComentario,
    setData: setComentario,
    post: postComentario,
    processing: loadingComentario,
    errors: errorsComentario,
    reset: resetComentario,
  } = useForm({
    archivo_id: archivo.id,
    user_id: userId ?? '',
    cuerpo: '',
  });

  const {
    data: dataValoracion,
    setData: setValoracion,
    post: postValoracion,
    processing: loadingValoracion,
    errors: errorsValoracion,
    reset: resetValoracion,
  } = useForm({
    archivo_id: archivo.id,
    user_id: userId ?? '',
    puntaje: 5,
    comentario: '',
  });

  const {
    data: dataReporte,
    setData: setReporte,
    post: postReporte,
    processing: loadingReporte,
    errors: errorsReporte,
    reset: resetReporte,
  } = useForm({
    archivo_id: archivo.id,
    reportante_id: userId ?? '',
    motivo: 'spam',
    detalle: '',
    estado: 'pendiente',
    resuelto_por: null as number | null,
    resuelto_en: null as string | null,
  });

  const { post: postSave, delete: deleteSave, processing: loadingSave } = useForm({});
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
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
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
    if (!dataComentario.cuerpo.trim()) return;
    postComentario(route('comentarios.store'), {
      preserveScroll: true,
      onSuccess: () => {
        resetComentario('cuerpo');
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

      <div className="mx-auto max-w-[1380px] w-full px-4 py-8 md:px-6 animate-in fade-in duration-300">
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          
          {/* Left Column: Unified Document Card */}
          <div className="flex-1 min-w-0 space-y-6">
            
            {/* Document Canvas Preview Card */}
            <Card className="border border-border/85 bg-card shadow-xs overflow-hidden">
              <CardHeader className="border-b border-border/50 p-4 md:px-6 md:py-4 pb-3 space-y-3">


                {/* Title & Stats */}
                <div className="space-y-1.5">
                  <CardTitle className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-snug">
                    {archivo.titulo}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 shrink-0" /> {archivo.visitas_count ?? 0} visitas
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                      {Number(archivo.valoraciones_avg_puntaje ?? 0).toFixed(1)} ({archivo.valoraciones_count ?? 0} valoraciones)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0" /> {archivo.comentarios_count ?? 0} comentarios
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Bookmark className="h-3.5 w-3.5 shrink-0" /> {archivo.savers_count ?? 0} guardados
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 md:p-6 space-y-4">
                {thumbnailUrl ? (
                  <div className="rounded-lg overflow-hidden border border-border bg-muted/15 p-2 flex justify-center w-full">
                    <img
                      src={thumbnailUrl}
                      alt={`Vista previa de ${archivo.titulo}`}
                      className="max-h-[680px] w-auto object-contain rounded-md shadow-xs select-none"
                    />
                  </div>
                ) : (
                  <div className="text-center p-12 max-w-sm mx-auto flex flex-col items-center justify-center gap-3">
                    <FileText className="h-14 w-14 text-muted-foreground opacity-55" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-foreground">Sin vista previa disponible</p>
                      <p className="text-xs text-muted-foreground">
                        Este archivo no admite visualización directa en pantalla. Utiliza el botón de descarga del panel lateral para obtener el documento original.
                      </p>
                    </div>
                  </div>
                )}

                {/* Admin observations inside CardContent */}
                {archivo.observaciones_admin && (
                  <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-500/25 dark:bg-amber-950/20 text-xs space-y-1 mt-4">
                    <p className="font-bold text-amber-800 dark:text-amber-400">Observaciones de la Administración</p>
                    <p className="text-amber-700/90 dark:text-amber-300/80 leading-relaxed">
                      {archivo.observaciones_admin}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Sidebar with Details & Actions */}
          <aside className="w-full lg:w-96 shrink-0 flex flex-col gap-6">
            
            {/* Sidebar Main Card */}
            <Card className="border border-border/80 bg-card shadow-xs p-4 space-y-3.5">
              
              {/* 3. Autor profile widget */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full border border-border bg-muted shrink-0">
                  {archivo.autor?.profile?.avatar_url ? (
                    <img
                      src={archivo.autor.profile.avatar_url}
                      alt={archivo.autor.profile.nombre_completo ?? archivo.autor.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground bg-muted/30">
                      {(archivo.autor?.profile?.nombre_completo ?? archivo.autor?.name ?? '?').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Subido por</p>
                  {archivo.autor?.profile?.id ? (
                    <Link
                      href={route('perfil.public', archivo.autor.profile.id)}
                      className="text-xs font-bold text-primary dark:text-sky-300 hover:underline truncate block"
                    >
                      {archivo.autor.profile.nombre_completo ?? archivo.autor.name}
                    </Link>
                  ) : (
                    <span className="text-xs font-bold text-foreground truncate block">
                      {archivo.autor?.name ?? 'Anónimo'}
                    </span>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    Cargado el {formatDate(archivo.publicado_en)}
                  </p>
                </div>
              </div>

              {/* 5. Los Badges */}
              <div className="flex flex-wrap gap-1 border-t border-b border-border/40 py-2">
                {archivo.materia?.nombre && (
                  <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5">
                    {archivo.materia.nombre}
                  </Badge>
                )}
                {archivo.tipo?.nombre && (
                  <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5">
                    {archivo.tipo.nombre}
                  </Badge>
                )}
                {archivo.estado?.nombre && (
                  <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5">
                    {archivo.estado.nombre}
                  </Badge>
                )}
                {archivo.plan_estudio?.nombre && (
                  <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5">
                    Plan: {archivo.plan_estudio.nombre}
                  </Badge>
                )}
                {archivo.peso_bytes && (
                  <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 font-mono">
                    {formatSize(archivo.peso_bytes)}
                  </Badge>
                )}
              </div>

              {/* 1. Ver / Descargar & 2. Guardar Buttons */}
              <div className="space-y-2 pt-1">
                {userId && canInteract ? (
                  <a href={fileUrl} target="_blank" rel="noreferrer" className="block w-full">
                    <Button className="w-full h-11 bg-[#0061a5] hover:bg-[#004b80] text-white dark:bg-[#9fcaff] dark:text-neutral-950 dark:hover:bg-sky-400 font-semibold gap-2 shadow-sm">
                      <FileDown className="h-4.5 w-4.5" /> Ver / Descargar Documento
                    </Button>
                  </a>
                ) : userId ? (
                  <Button disabled className="w-full h-11 opacity-65 gap-2">
                    <FileDown className="h-4.5 w-4.5" /> Sin permisos para ver/descargar
                  </Button>
                ) : (
                  <Link href={route('login')} className="block w-full">
                    <Button className="w-full h-11 bg-[#0061a5] hover:bg-[#004b80] text-white dark:bg-[#9fcaff] dark:text-neutral-950 dark:hover:bg-sky-400 font-semibold gap-2">
                      Iniciá sesión para descargar
                    </Button>
                  </Link>
                )}

                {canInteract && userId && (
                  <Button
                    variant={archivo.is_saved ? 'secondary' : 'outline'}
                    onClick={toggleSave}
                    disabled={loadingSave}
                    className="w-full h-10 gap-2 font-semibold"
                  >
                    {archivo.is_saved ? (
                      <>
                        <BookmarkCheck className="h-4.5 w-4.5 text-indigo-600 fill-indigo-600 dark:text-indigo-400 dark:fill-indigo-400" />
                        Guardado en Biblioteca
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4.5 w-4.5 text-muted-foreground" />
                        Guardar en Biblioteca
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* 6. Descripción */}
              {archivo.descripcion && (
                <div className="space-y-1 pt-2.5 border-t border-border/40">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Descripción</Label>
                  <p className="text-xs text-foreground/80 leading-relaxed bg-muted/10 p-2.5 rounded-lg border border-border/40">
                    {archivo.descripcion}
                  </p>
                </div>
              )}
            </Card>

            {/* 7. Discussion & Reviews inside Sidebar (Stitch Style) */}
            <Card className="border border-border/80 bg-card shadow-xs flex flex-col overflow-hidden max-h-[580px]">
              {/* Swap Tabs */}
              <div className="flex border-b border-border/60 bg-muted/10 shrink-0">
                {(['comentarios', 'valoraciones'] as const).map((section) => (
                  <button
                    key={section}
                    type="button"
                    onClick={() => setActiveSection(section)}
                    className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2 text-center ${
                      activeSection === section
                        ? 'border-primary text-primary dark:border-sky-500 dark:text-sky-300 bg-card'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/5'
                    }`}
                  >
                    {section === 'comentarios'
                      ? `Comentarios (${archivo.comentarios_count ?? 0})`
                      : `Valoraciones (${archivo.valoraciones_count ?? 0})`}
                  </button>
                ))}
              </div>

              {/* Interactive Lists Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[180px] max-h-[420px]">
                {activeSection === 'comentarios' && (
                  <div className="space-y-3">
                    {(archivo.comentarios ?? []).map((c) => (
                      <div key={c.id} className="rounded-lg border border-border/60 bg-muted/5 p-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-foreground/80 truncate max-w-[180px]">
                            {c.autor?.profile?.id ? (
                              <Link
                                href={route('perfil.public', c.autor.profile.id)}
                                className="text-primary dark:text-sky-300 hover:underline"
                              >
                                {c.autor.name}
                              </Link>
                            ) : (
                              c.autor?.name ?? 'Anónimo'
                            )}
                          </span>
                          {userId && canInteract && c.autor?.id === userId && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleEditComentario(c); }}>
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleDeleteComentario(c); }}>
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        <p className="text-xs text-foreground/90 whitespace-pre-wrap break-words leading-normal">
                          {c.cuerpo}
                        </p>
                      </div>
                    ))}
                    {(!archivo.comentarios || archivo.comentarios.length === 0) && (
                      <p className="text-xs text-center text-muted-foreground py-6">
                        Todavía no hay comentarios en este archivo.
                      </p>
                    )}
                  </div>
                )}

                {activeSection === 'valoraciones' && (
                  <div className="space-y-3">
                    {canInteract && userId && (
                      <div className="flex justify-center border-b border-border/40 pb-2.5 shrink-0">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setOpenValoracion(true)}
                          className="h-8 text-xs font-semibold w-full gap-1.5"
                        >
                          <Plus className="h-4 w-4" /> Valorar Documento
                        </Button>
                      </div>
                    )}

                    {(archivo.valoraciones ?? []).map((v) => (
                      <div key={v.id} className="rounded-lg border border-border/60 bg-muted/5 p-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[11px] font-bold text-foreground/80 truncate max-w-[120px]">
                              {v.autor?.profile?.id ? (
                                <Link
                                  href={route('perfil.public', v.autor.profile.id)}
                                  className="text-primary dark:text-sky-300 hover:underline"
                                >
                                  {v.autor.name}
                                </Link>
                              ) : (
                                v.autor?.name ?? 'Anónimo'
                              )}
                            </span>
                            <div className="flex items-center gap-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1 py-0.5 rounded text-[9px] font-bold shrink-0">
                              <Star className="h-2.5 w-2.5 fill-current" /> {v.puntaje}/5
                            </div>
                          </div>
                          {userId && canInteract && v.autor?.id === userId && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleEditValoracion(v); }}>
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleDeleteValoracion(v); }}>
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        {/* No rendering of v.comentario here per user request */}
                      </div>
                    ))}
                    {(!archivo.valoraciones || archivo.valoraciones.length === 0) && (
                      <p className="text-xs text-center text-muted-foreground py-6">
                        No hay valoraciones. ¡Sé el primero en valorar!
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Inline Comment Input Box (Stitch Style) */}
              {activeSection === 'comentarios' && canInteract && userId && (
                <form onSubmit={handleComentario} className="border-t border-border/60 bg-muted/10 p-3.5 shrink-0 space-y-2">
                  <textarea
                    rows={2}
                    value={dataComentario.cuerpo}
                    onChange={(e) => setComentario('cuerpo', e.target.value)}
                    placeholder="Escribir un comentario..."
                    className="w-full rounded-lg border border-border p-2.5 text-xs bg-background focus:ring-1 focus:ring-primary focus:border-transparent resize-none min-h-[64px] focus-visible:outline-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={loadingComentario || !dataComentario.cuerpo.trim()}
                      className="h-8 text-xs font-semibold px-4 gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Enviar comentario
                    </Button>
                  </div>
                </form>
              )}
            </Card>

            {/* 8. Reportar & Historial Actions at the bottom */}
            <div className="flex gap-2">
              {canInteract && userId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenReporte(true)}
                  className="flex-1 h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 hover:border-destructive/35"
                >
                  <Flag className="mr-1.5 h-3.5 w-3.5" /> Reportar archivo
                </Button>
              )}

              {canModerate && (
                <Link
                  href={`${route('historial-revisiones.create')}?archivo_id=${archivo.id}&estado_archivo_id=${archivo.estado?.id ?? ''}`}
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                    <History className="mr-1.5 h-3.5 w-3.5" /> Historial de revisiones
                  </Button>
                </Link>
              )}
            </div>
          </aside>

        </div>
      </div>

      {/* Dialogs */}

      {/* Report Modal */}
      {canInteract && userId && (
        <Dialog open={openReporte} onOpenChange={setOpenReporte}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reportar contenido</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleReporte} className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="motivo">Motivo</Label>
                <select
                  id="motivo"
                  className="w-full rounded-md border border-border bg-background p-2 text-sm"
                  value={dataReporte.motivo}
                  onChange={(e) => setReporte('motivo', e.target.value)}
                >
                  <option value="spam">Spam</option>
                  <option value="contenido_incorrecto">Contenido incorrecto</option>
                  <option value="copyright">Copyright</option>
                  <option value="otro">Otro</option>
                </select>
                {errorsReporte.motivo && (
                  <p className="text-xs text-destructive font-medium">{errorsReporte.motivo}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="detalle">Detalle</Label>
                <Textarea
                  id="detalle"
                  value={dataReporte.detalle}
                  onChange={(e) => setReporte('detalle', e.target.value)}
                  placeholder="Explica brevemente el inconveniente detectado..."
                  className="min-h-24 resize-none"
                />
                {errorsReporte.detalle && (
                  <p className="text-xs text-destructive font-medium">{errorsReporte.detalle}</p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setOpenReporte(false)}>
                  Cancelar
                </Button>
                <Button disabled={loadingReporte} type="submit" variant="destructive">
                  Enviar reporte
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Add/Edit Valuation Modal */}
      <Dialog open={openValoracion} onOpenChange={setOpenValoracion}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva valoración</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleValoracion} className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="puntaje">Puntaje (1 a 5 estrellas)</Label>
              <Input
                id="puntaje"
                type="number"
                min={1}
                max={5}
                value={dataValoracion.puntaje}
                onChange={(e) => setValoracion('puntaje', Number(e.target.value))}
              />
              {errorsValoracion.puntaje && (
                <p className="text-xs text-destructive font-medium">{errorsValoracion.puntaje}</p>
              )}
            </div>
            {/* No comment input per user request */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setOpenValoracion(false)}>
                Cancelar
              </Button>
              <Button disabled={loadingValoracion} type="submit">
                Guardar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Comment Modal */}
      {editingComentario && (
        <Dialog
          open={!!editingComentario}
          onOpenChange={(open) => {
            if (!open) {
              setEditingComentario(null);
              resetEditComentario();
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar comentario</DialogTitle>
            </DialogHeader>
            <form onSubmit={submitEditComentario} className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit_cuerpo">Escribe tu comentario modificado</Label>
                <Textarea
                  id="edit_cuerpo"
                  value={dataEditComentario.cuerpo}
                  onChange={(e) => setDataEditComentario('cuerpo', e.target.value)}
                  className="min-h-24 resize-none"
                />
                {errorsEditComentario.cuerpo && (
                  <p className="text-xs text-destructive font-medium">{errorsEditComentario.cuerpo}</p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setEditingComentario(null);
                    resetEditComentario();
                  }}
                >
                  Cancelar
                </Button>
                <Button disabled={loadingEditComentario} type="submit">
                  Guardar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Review Modal */}
      {editingValoracion && (
        <Dialog
          open={!!editingValoracion}
          onOpenChange={(open) => {
            if (!open) {
              setEditingValoracion(null);
              resetEditValoracion();
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar valoración</DialogTitle>
            </DialogHeader>
            <form onSubmit={submitEditValoracion} className="space-y-3 pt-2">
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
                  <p className="text-xs text-destructive font-medium">{errorsEditValoracion.puntaje}</p>
                )}
              </div>
              {/* No comment input per user request */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setEditingValoracion(null);
                    resetEditValoracion();
                  }}
                >
                  Cancelar
                </Button>
                <Button disabled={loadingEditValoracion} type="submit">
                  Guardar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
}
