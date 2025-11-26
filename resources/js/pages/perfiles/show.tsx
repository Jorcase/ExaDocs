import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';

interface User {
  id: number;
  name: string;
  email: string;
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
}

export default function Show({ perfil, archivos }: { perfil: Perfil; archivos: Paginated<ArchivoLite> }) {
  const { can } = usePermissions();
  const { props } = usePage<{ auth: { user: { id: number } } }>();

  const isOwner = props.auth?.user?.id === perfil.user_id;
  const canViewPersonalInfo = isOwner || can('edit_perfiles');

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Perfil', href: route('perfil.show') },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Mi Perfil" />
      <div className="w-full p-4 grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-border/70 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-4 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">          
          <CardHeader className="items-center text-center text-slate-900 dark:text-slate-50">
            <div className="h-28 w-28 rounded-full border bg-muted overflow-hidden">
              {perfil.avatar_url ? (
                <img
                  src={perfil.avatar_url}
                  alt={perfil.user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-lg font-semibold">
                  {perfil.user.name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <CardTitle className="mt-3 text-slate-900 dark:text-slate-50">
              {perfil.nombre_completo || perfil.user.name}
            </CardTitle>
            <p className="text-sm text-slate-700 dark:text-slate-200">@{perfil.user.name}</p>
            <p className="text-sm text-slate-700 dark:text-slate-200">{perfil.user.email}</p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-900 dark:text-slate-50">
            {perfil.bio ? (
              <p className="leading-relaxed">{perfil.bio}</p>
            ) : (
              <p className="text-slate-600 dark:text-slate-200">Sin biografía cargada.</p>
            )}
            {(isOwner || can('edit_perfiles')) && (
              <Link href={route('perfil.edit')}>
                <Button className="w-full" variant="secondary">
                  Editar perfil
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {canViewPersonalInfo && (
          <Card className="md:col-span-2 border-2 border-border/70 bg-gradient-to-r from-slate-50 via-slate-100 to-white text-slate-900 shadow-sm dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
            <CardHeader>
              <CardTitle>Información personal</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              {[
                { label: 'Nombre completo', value: perfil.nombre_completo || 'No cargado' },
                { label: 'Nombre de usuario', value: perfil.user.name },
                { label: 'Email', value: perfil.user.email },
                { label: 'Documento', value: perfil.documento || 'No cargado' },
                { label: 'Teléfono', value: perfil.telefono || 'No cargado' },
                { label: 'Carrera principal', value: perfil.carrera?.nombre || 'No cargada' },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="md:col-span-2 border-2 border-border/70 bg-gradient-to-r from-slate-50 via-slate-100 to-white text-slate-900 shadow-sm dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
          <CardHeader>
            <CardTitle>Publicaciones del usuario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {archivos.data.length === 0 && (
              <p className="text-slate-600 dark:text-slate-200">Todavía no tiene publicaciones.</p>
            )}
            {archivos.data.length > 0 && (
              <div className="space-y-3">
                {archivos.data.map((a) => (
                  <Link
                    key={a.id}
                    href={route('archivos.show', a.id)}
                    className="block rounded-xl border-2 border-border/70 bg-gradient-to-r from-slate-50 via-slate-100 to-white p-3 text-slate-900 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold leading-tight text-slate-900 dark:text-slate-50">{a.titulo}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-700 dark:text-slate-200">
                        <span>{a.materia?.nombre ?? 'Sin materia'}</span>
                        <span>•</span>
                        <span>{a.tipo?.nombre ?? 'Sin tipo'}</span>
                        <span>•</span>
                        <span>{a.estado?.nombre ?? 'Sin estado'}</span>
                        {a.publicado_en && (
                          <>
                            <span>•</span>
                            <span>Publicado: {a.publicado_en}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {archivos.links.length > 1 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {archivos.links.map((link, idx) => {
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
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
