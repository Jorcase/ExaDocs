import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/pagination';

interface NotificacionRow {
  id: number;
  tipo: string;
  titulo?: string | null;
  mensaje?: string | null;
  archivo_id?: number | null;
  actor?: { id: number; name: string } | null;
  leido_en?: string | null;
  created_at?: string;
}

interface Paginated {
  data: NotificacionRow[];
  links: Url[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Notificaciones', href: route('notificaciones.index') },
];

export default function UserIndex({ notificaciones }: { notificaciones: Paginated }) {
  const { post, processing } = useForm({});

  const toggleRead = (id: number, isRead: boolean) => {
    post(route(isRead ? 'notificaciones.unread' : 'notificaciones.read', id), {
      preserveScroll: true,
    });
  };

  const handleRowClick = (n: NotificacionRow) => {
    if (!n.archivo_id) return;
    router.visit(route('archivos.show', n.archivo_id), { preserveScroll: true });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Mis notificaciones" />
      <section className="m-4 space-y-4 rounded-2xl border border-border/60 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Mis notificaciones</h1>
          <p className="text-sm text-slate-700 dark:text-slate-200">Revisa tus alertas y marcá las que ya leíste.</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-border/60 bg-white/50 dark:bg-white/5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-900 dark:text-slate-100">Título</TableHead>
                <TableHead className="text-slate-900 dark:text-slate-100">Tipo</TableHead>
                <TableHead className="text-slate-900 dark:text-slate-100">Mensaje</TableHead>
                <TableHead className="text-slate-900 dark:text-slate-100">De</TableHead>
                <TableHead className="text-slate-900 dark:text-slate-100">Fecha</TableHead>
                <TableHead className="text-slate-900 dark:text-slate-100">Estado</TableHead>
                <TableHead className="text-right text-slate-900 dark:text-slate-100">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notificaciones.data.map((n) => (
                <TableRow
                  key={n.id}
                  className={`hover:bg-slate-100/60 dark:hover:bg-white/5 ${n.archivo_id ? 'cursor-pointer' : ''}`}
                  onClick={() => handleRowClick(n)}
                >
                  <TableCell className="max-w-[220px] truncate font-medium" title={n.titulo ?? ''}>
                    {n.titulo ?? '—'}
                  </TableCell>
                  <TableCell className="capitalize">{n.tipo}</TableCell>
                  <TableCell className="max-w-[320px] whitespace-pre-wrap text-sm text-muted-foreground" title={n.mensaje ?? ''}>
                    {n.mensaje ?? '—'}
                  </TableCell>
                  <TableCell>{n.actor?.name ?? (n.archivo_id ? 'Archivo' : 'Sistema')}</TableCell>
                  <TableCell>
                    {n.created_at
                      ? new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(n.created_at))
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {n.leido_en ? (
                      <Badge variant="default">Leída</Badge>
                    ) : (
                      <Badge variant="secondary">Pendiente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={n.leido_en ? 'outline' : 'secondary'}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRead(n.id, !!n.leido_en);
                      }}
                      disabled={processing}
                    >
                      {n.leido_en ? 'Marcar como no leída' : 'Marcar como leída'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {notificaciones.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm">
                    No tenés notificaciones.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end">
          <Pagination links={notificaciones.links} />
        </div>
      </section>
    </AppLayout>
  );
}
