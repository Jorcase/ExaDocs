import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/pagination';

interface NotificacionRow {
  id: number;
  user?: { id: number; name: string };
  tipo: string;
  data: Record<string, any>;
  leido_en?: string | null;
}

interface Paginated {
  data: NotificacionRow[];
  links: Url[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Notificaciones (moderación)', href: route('admin.notificaciones.index') },
];

export default function Index({ notificaciones }: { notificaciones: Paginated }) {
  const { delete: destroy, processing } = useForm({});

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Notificaciones" />
      <section className="m-4 space-y-4 rounded-2xl border border-border/60 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Notificaciones</h1>
            <p className="text-sm text-slate-700 dark:text-slate-200">Gestiona las notificaciones creadas para los usuarios.</p>
          </div>
          <Link href={route('admin.notificaciones.create')}>
            <Button>Crear notificación</Button>
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-border/60 bg-white/50 dark:bg-white/5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-900 dark:text-slate-100">ID</TableHead>
                <TableHead className="text-slate-900 dark:text-slate-100">Usuario</TableHead>
                <TableHead className="text-slate-900 dark:text-slate-100">Tipo</TableHead>
                <TableHead className="text-slate-900 dark:text-slate-100">Leído</TableHead>
                <TableHead className="text-right text-slate-900 dark:text-slate-100">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notificaciones.data.map((n) => (
                <TableRow key={n.id}>
                  <TableCell>{n.id}</TableCell>
                  <TableCell>{n.user?.name ?? '—'}</TableCell>
                  <TableCell className="capitalize">{n.tipo}</TableCell>
                  <TableCell>
                    {n.leido_en ? (
                      <Badge variant="default">Leído</Badge>
                    ) : (
                      <Badge variant="secondary">Pendiente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={route('admin.notificaciones.edit', n.id)}>
                      <Button size="sm" variant="secondary">
                        Editar
                      </Button>
                    </Link>
                    <ConfirmDelete
                      disabled={processing}
                      onConfirm={() => destroy(route('admin.notificaciones.destroy', n.id))}
                      description="La notificación se eliminará definitivamente."
                    >
                      <Button size="sm" variant="destructive" disabled={processing}>
                        Eliminar
                      </Button>
                    </ConfirmDelete>
                  </TableCell>
                </TableRow>
              ))}
              {notificaciones.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm">
                    No hay notificaciones.
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
