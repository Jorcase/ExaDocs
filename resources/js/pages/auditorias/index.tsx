import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AuditoriaRow {
  id: number;
  user?: { id: number; name: string } | null;
  accion: string;
  entidad_tipo?: string | null;
  entidad_id?: number | null;
  ip_address?: string | null;
  created_at?: string | null;
}

interface Paginated {
  data: AuditoriaRow[];
  links: Url[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Auditorías', href: route('auditorias.index') },
];

export default function Index({ auditorias }: { auditorias: Paginated }) {
  const { delete: destroy, processing } = useForm({});

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Auditorías" />
      <div className="m-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Auditorías</h1>
          <Link href={route('auditorias.create')}>
            <Button>Registrar</Button>
          </Link>
        </div>
        <div className="overflow-hidden rounded border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditorias.data.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.id}</TableCell>
                  <TableCell>{a.user?.name ?? '—'}</TableCell>
                  <TableCell>{a.accion}</TableCell>
                  <TableCell>
                    {a.entidad_tipo ?? '—'} {a.entidad_id ?? ''}
                  </TableCell>
                  <TableCell>{a.ip_address ?? '—'}</TableCell>
                  <TableCell>{a.created_at ?? '—'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={route('auditorias.edit', a.id)}>
                      <Button size="sm" variant="secondary">
                        Editar
                      </Button>
                    </Link>
                    <ConfirmDelete
                      disabled={processing}
                      onConfirm={() => destroy(route('auditorias.destroy', a.id))}
                      description="La auditoría se eliminará definitivamente."
                    >
                      <Button size="sm" variant="destructive" disabled={processing}>
                        Eliminar
                      </Button>
                    </ConfirmDelete>
                  </TableCell>
                </TableRow>
              ))}
              {auditorias.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm">
                    No hay auditorías registradas.
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
