import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Bookmark, Star, MessageSquare, MessageCircle, Sparkles } from 'lucide-react';
import { route } from 'ziggy-js';
import { usePermissions } from '@/hooks/use-permissions';

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

export default function MisCosas({
  guardados,
  publicaciones,
  actividad,
}: {
  guardados: Paginated<ArchivoLite>;
  publicaciones: Paginated<ArchivoLite>;
  actividad: Paginated<ActividadItem>;
}) {
  const [tab, setTab] = useState<'guardados' | 'actividad' | 'publicaciones'>('guardados');
  const page = usePage<{ auth: { user: { id: number } | null } }>();
  const { can } = usePermissions();
  const userId = page.props.auth.user?.id;

  const breadcrumbs: BreadcrumbItem[] = [{ title: 'Mis cosas', href: route('mis-cosas') }];

  const renderPagination = (links: PaginationLink[]) =>
    links.length > 1 && (
      <div className="flex flex-wrap gap-2 pt-2">
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
              className={`px-3 py-1 rounded border text-xs ${
                link.active
                  ? 'bg-primary text-primary-foreground border-primary'
                  : link.url
                    ? 'hover:border-primary'
                    : 'opacity-50 cursor-not-allowed'
              }`}
              dangerouslySetInnerHTML={{ __html: label }}
            />
          );
        })}
      </div>
    );

  const renderArchivoCard = (item: ArchivoLite) => (
    <Link
      key={item.id}
      href={route('archivos.show', item.id)}
      className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
    >
      <Card className="h-full overflow-hidden rounded-xl border-2 border-border/70 bg-gradient-to-br from-slate-100 via-slate-50 to-white text-slate-900 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:from-sky-100 hover:via-slate-50 hover:to-white dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50 dark:hover:from-sky-900 dark:hover:via-neutral-950 dark:hover:to-neutral-950">
        <CardHeader className="p-0">
          {item.thumbnail_path ? (
            <img
              src={`/storage/${item.thumbnail_path}`}
              alt={`Miniatura de ${item.titulo}`}
              className="h-40 w-full object-cover transition duration-500 hover:scale-[1.01]"
            />
          ) : (
            <div className="flex h-40 w-full items-center justify-center bg-muted text-sm text-muted-foreground dark:bg-slate-800/60 dark:text-slate-200">
              <span>Sin miniatura</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-2 py-4 px-4">
          <CardTitle className="text-center text-base font-semibold leading-snug text-slate-900 dark:text-slate-50">
            {item.titulo}
          </CardTitle>
          <div className="text-center text-xs text-slate-700 dark:text-slate-200">
            <span className="font-medium">{item.materia?.nombre ?? '—'}</span>
            <span className="mx-1.5">•</span>
            <span className="font-medium">{item.tipo?.nombre ?? '—'}</span>
          </div>
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-700 dark:text-slate-200">
          {(can('state_archivo') || item.autor?.id === userId) && item.estado?.nombre && (
            <Badge variant="secondary">{item.estado?.nombre}</Badge>
          )}
            {item.autor?.name && <span>Autor: {item.autor.name}</span>}
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
      </Card>
    </Link>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Mis cosas" />
      <div className="m-4 space-y-4">
        <div className="flex items-center justify-center gap-2 border-b">
          {(['guardados', 'actividad', 'publicaciones'] as const).map((key) => (
            <button
              key={key}
              className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                tab === key ? 'text-foreground' : 'text-muted-foreground'
              }`}
              onClick={() => setTab(key)}
            >
              {key === 'guardados' && 'Mis guardados'}
              {key === 'actividad' && 'Mi actividad'}
              {key === 'publicaciones' && 'Mis publicaciones'}
              {tab === key && <span className="absolute inset-x-2 -bottom-[1px] h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>

        {tab === 'guardados' && (
          <div className="space-y-4">
            {guardados.data.length === 0 && <p className="text-sm text-muted-foreground">Todavía no guardaste archivos.</p>}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{guardados.data.map(renderArchivoCard)}</div>
            {renderPagination(guardados.links)}
          </div>
        )}

        {tab === 'publicaciones' && (
          <div className="space-y-4">
            {publicaciones.data.length === 0 && <p className="text-sm text-muted-foreground">Todavía no subiste archivos.</p>}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{publicaciones.data.map(renderArchivoCard)}</div>
            {renderPagination(publicaciones.links)}
          </div>
        )}

        {tab === 'actividad' && (
          <Card>
            <CardHeader>
              <CardTitle>Mi actividad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {actividad.data.length === 0 && <p className="text-muted-foreground">Sin actividad reciente.</p>}
              {actividad.data.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={route('archivos.show', item.archivo.id)}
                  className="block rounded-xl border-2 border-border/70 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-3 text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:from-slate-900/85 dark:via-slate-800/80 dark:to-slate-900/85 dark:text-slate-50"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                    <Badge variant="secondary" className="inline-flex items-center gap-1">
                      {item.type === 'comentario' ? <MessageCircle className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                      {item.type === 'comentario' ? 'Comentario' : 'Valoración'}
                    </Badge>
                    <span className="font-semibold">{item.archivo.titulo}</span>
                    {item.created_at && <span>• {new Date(item.created_at).toLocaleString()}</span>}
                  </div>
                  {item.type === 'comentario' && <p className="text-sm whitespace-pre-wrap text-slate-800 dark:text-slate-100">{item.texto}</p>}
                  {item.type === 'valoracion' && (
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{item.puntaje}/5</Badge>
                      {item.texto && <span className="text-muted-foreground">{item.texto}</span>}
                    </div>
                  )}
                </Link>
              ))}
              {renderPagination(actividad.links)}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
