import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

interface RoleRow {
  id: number;
  name: string;
  permissions: (string | { name: string })[];
  created_at?: string;
}

interface Paginated {
  data: RoleRow[];
  links: Url[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Roles', href: route('roles.index') }];

export default function Index({ roles }: { roles: Paginated }) {
  const { delete: destroy, processing } = useForm({});

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Roles" />
      <div className="m-4 space-y-4">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-semibold">Roles</CardTitle>
              <p className="text-sm text-muted-foreground">
                Administra roles y sus permisos asociados dentro del sistema.
              </p>
            </div>
            <Link href={route('roles.create')}>
              <Button>Crear rol</Button>
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
                    <TableHead>Permisos</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.data.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>{role.id}</TableCell>
                      <TableCell>{role.name}</TableCell>
                      <TableCell className="space-x-1">
                        {role.permissions?.length ? (
                          role.permissions.map((p, idx) => (
                            <span key={idx} className="rounded bg-muted px-2 py-1 text-xs">
                              {typeof p === 'string' ? p : p.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Sin permisos</span>
                        )}
                      </TableCell>
                      <TableCell>{role.created_at ?? '—'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link href={route('roles.edit', role.id)}>
                          <Button size="sm" variant="secondary">
                            Editar
                          </Button>
                        </Link>
                        <ConfirmDelete
                          disabled={processing}
                          onConfirm={() => destroy(route('roles.destroy', role.id))}
                          description="El rol se eliminará definitivamente."
                        >
                          <Button size="sm" variant="destructive" disabled={processing}>
                            Eliminar
                          </Button>
                        </ConfirmDelete>
                      </TableCell>
                    </TableRow>
                  ))}
                  {roles.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm">
                        No hay roles.
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
