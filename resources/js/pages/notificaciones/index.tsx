import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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
  { title: 'Notificaciones', href: route('notificaciones.index') },
];

export default function Index({ notificaciones }: { notificaciones: Paginated }) {
  const { delete: destroy, processing } = useForm({});

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Notificaciones" />
      <div className="m-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Notificaciones</h1>
          <Link href={route('notificaciones.create')}>
            <Button>Crear notificación</Button>
          </Link>
        </div>
        <div className="overflow-hidden rounded border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Leído</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
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
                      <Badge variant="success">Leído</Badge>
                    ) : (
                      <Badge variant="secondary">Pendiente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={route('notificaciones.edit', n.id)}>
                      <Button size="sm" variant="secondary">
                        Editar
                      </Button>
                    </Link>
                    <ConfirmDelete
                      disabled={processing}
                      onConfirm={() => destroy(route('notificaciones.destroy', n.id))}
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
      </div>
    </AppLayout>
  );
}
