import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

interface Permiso {
  id: number;
  name: string;
  created_at?: string;
}

interface Paginated {
  data: Permiso[];
  links: Url[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Permisos', href: route('permissions.index') },
];

export default function Index({ permissions }: { permissions: Paginated }) {
  const { delete: destroy, processing } = useForm({});

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Permisos" />
      <div className="m-4 space-y-4">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-semibold">Permisos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Define las acciones que pueden ejecutar roles dentro del sistema.
              </p>
            </div>
            <Link href={route('permissions.create')}>
              <Button>Crear permiso</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.data.map((perm) => (
                    <TableRow key={perm.id}>
                      <TableCell>{perm.id}</TableCell>
                      <TableCell>{perm.name}</TableCell>
                      <TableCell>{perm.created_at ?? '—'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link href={route('permissions.edit', perm.id)}>
                          <Button size="sm" variant="secondary">
                            Editar
                          </Button>
                        </Link>
                        <ConfirmDelete
                          disabled={processing}
                          onConfirm={() => destroy(route('permissions.destroy', perm.id))}
                          description="El permiso se eliminará definitivamente."
                        >
                          <Button size="sm" variant="destructive" disabled={processing}>
                            Eliminar
                          </Button>
                        </ConfirmDelete>
                      </TableCell>
                    </TableRow>
                  ))}
                  {permissions.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm">
                        No hay permisos.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
