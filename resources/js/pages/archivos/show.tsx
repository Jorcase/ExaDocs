import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import React, { Fragment } from 'react';
import PdfButton from '@/components/pdf-button';
import { usePermissions } from '@/hooks/use-permissions';

interface Relacion {
    id: number;
    nombre?: string;
    name?: string;
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

export default function Show({ archivo, estados }: { archivo: Archivo; estados: EstadoOption[] }) {
    const { props } = usePage<{ auth?: { user?: { id: number; name: string } } }>();
    const userId = props.auth?.user?.id;
    const { can } = usePermissions();
    const canViewPdf = can('view_pdf');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Archivos', href: route('archivos.index') },
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

    const handleComentario = (e: React.FormEvent) => {
        e.preventDefault();
        postComentario(route('comentarios.store'), {
            onSuccess: () => resetComentario('cuerpo'),
        });
    };

    const handleValoracion = (e: React.FormEvent) => {
        e.preventDefault();
        postValoracion(route('valoraciones.store'), {
            onSuccess: () => resetValoracion('comentario'),
        });
    };

    const handleReporte = (e: React.FormEvent) => {
        e.preventDefault();
        postReporte(route('reportes.store'), {
            onSuccess: () => {
                resetReporte('detalle');
                setReporte('motivo', 'spam');
            },
        });
    };

    const fileUrl = `/storage/${archivo.file_path}`;
    const thumbnailUrl = archivo.thumbnail_path ? `/storage/${archivo.thumbnail_path}` : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Archivos | ${archivo.titulo}`} />
            <div className="m-4 space-y-6">
                <Card>
                <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl">{archivo.titulo}</CardTitle>
                            {archivo.descripcion && (
                                <p className="text-sm text-muted-foreground">{archivo.descripcion}</p>
                            )}
                        </div>
                        {canViewPdf && (
                            <div className="flex gap-2">
                                <PdfButton href={route('archivos.detail-report', archivo.id)} />
                            </div>
                        )}
                    </div>
                </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex flex-wrap gap-3">
                            <Badge variant="secondary">{archivo.materia?.nombre ?? 'Sin materia'}</Badge>
                            <Badge variant="secondary">{archivo.tipo?.nombre ?? 'Sin tipo'}</Badge>
                            <Badge variant="outline">{archivo.estado?.nombre ?? 'Sin estado'}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <p><strong>Autor:</strong> {archivo.autor?.name ?? '—'}</p>
                            <p><strong>Plan:</strong> {archivo.plan_estudio?.nombre ?? '—'}</p>
                            <p><strong>Peso:</strong> {archivo.peso_bytes ? `${(archivo.peso_bytes / 1024 / 1024).toFixed(2)} MB` : '—'}</p>
                            <p><strong>Publicado:</strong> {archivo.publicado_en ?? '—'}</p>
                        </div>
                        <p>
                            <strong>Archivo:</strong>{' '}
                            <a className="text-primary underline" href={fileUrl} target="_blank" rel="noreferrer">
                                Ver / descargar
                            </a>
                        </p>
                        {thumbnailUrl ? (
                            <div className="border rounded overflow-hidden bg-muted/50 p-3 flex justify-center">
                                <img
                                    src={thumbnailUrl}
                                    alt={`Miniatura de ${archivo.titulo}`}
                                    className="max-h-[520px] w-auto object-contain"
                                />
                            </div>
                        ) : (
                            <div className="border rounded bg-muted/30 p-4 text-sm text-muted-foreground">
                                No hay miniatura disponible. Podés ver o descargar el archivo.
                            </div>
                        )}
                        {archivo.observaciones_admin && (
                            <div className="pt-2">
                                <p className="font-semibold">Observaciones</p>
                                <p className="text-sm text-muted-foreground">{archivo.observaciones_admin}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Comentarios</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {userId ? (
                                <form onSubmit={handleComentario} className="space-y-2">
                                    <Label htmlFor="cuerpo">Dejá tu comentario</Label>
                                    <Textarea
                                        id="cuerpo"
                                        value={dataComentario.cuerpo}
                                        onChange={(e) => setComentario('cuerpo', e.target.value)}
                                        placeholder="Escribe tu comentario..."
                                    />
                                    {errorsComentario.cuerpo && (
                                        <p className="text-sm text-destructive">{errorsComentario.cuerpo}</p>
                                    )}
                                    <Button disabled={loadingComentario} type="submit">
                                        Comentar
                                    </Button>
                                </form>
                            ) : (
                                <p className="text-sm text-muted-foreground">Iniciá sesión para comentar.</p>
                            )}
                            <Separator />
                            <div className="space-y-3">
                                {(archivo.comentarios ?? []).map((c) => (
                                    <div key={c.id} className="rounded border p-3">
                                        <p className="text-sm text-muted-foreground mb-1">{c.autor?.name ?? '—'}</p>
                                        <p className="text-sm whitespace-pre-wrap">{c.cuerpo}</p>
                                    </div>
                                ))}
                                {(!archivo.comentarios || archivo.comentarios.length === 0) && (
                                    <p className="text-sm text-muted-foreground">Todavía no hay comentarios.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Valoraciones</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {userId ? (
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
                                    <Button disabled={loadingValoracion} type="submit">
                                        Enviar valoración
                                    </Button>
                                </form>
                            ) : (
                                <p className="text-sm text-muted-foreground">Iniciá sesión para valorar.</p>
                            )}
                            <Separator />
                            <div className="space-y-3">
                                {(archivo.valoraciones ?? []).map((v) => (
                                    <div key={v.id} className="rounded border p-3 space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>{v.autor?.name ?? '—'}</span>
                                            <Badge variant="secondary">{v.puntaje}/5</Badge>
                                        </div>
                                        {v.comentario && <p className="text-sm whitespace-pre-wrap">{v.comentario}</p>}
                                    </div>
                                ))}
                                {(!archivo.valoraciones || archivo.valoraciones.length === 0) && (
                                    <p className="text-sm text-muted-foreground">Todavía no hay valoraciones.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Reportar contenido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {userId ? (
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
                                <Button disabled={loadingReporte} type="submit">
                                    Enviar reporte
                                </Button>
                            </form>
                        ) : (
                            <p className="text-sm text-muted-foreground">Iniciá sesión para reportar.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
