import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ListLayout } from '@/components/list-layout';

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
      <Head title="Roles | Gestión" />
      <ListLayout
        title="Gestión de Roles"
        createHref={route('roles.create')}
        createLabel="Crear rol"
        paginationLinks={roles.links}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70px]">ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Permisos</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.data.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.id}</TableCell>
                <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{role.name}</TableCell>
                <TableCell className="align-top">
                  {role.permissions?.length ? (
                    <div className="flex flex-wrap gap-1 max-w-xl">
                      {role.permissions.map((p, idx) => (
                        <span key={idx} className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono border border-border/40">
                          {typeof p === 'string' ? p : p.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Sin permisos</span>
                  )}
                </TableCell>
                <TableCell className="text-xs">{role.created_at ?? '—'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={route('roles.edit', role.id)}>
                    <Button size="sm" variant="secondary" className="rounded-lg">
                      Editar
                    </Button>
                  </Link>
                  <ConfirmDelete
                    disabled={processing}
                    onConfirm={() => destroy(route('roles.destroy', role.id))}
                    description="El rol se eliminará definitivamente de la base de datos."
                  >
                    <Button size="sm" variant="destructive" className="rounded-lg" disabled={processing}>
                      Eliminar
                    </Button>
                  </ConfirmDelete>
                </TableCell>
              </TableRow>
            ))}
            {roles.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm py-4 text-muted-foreground">
                  No hay roles creados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ListLayout>
    </AppLayout>
  );
}
