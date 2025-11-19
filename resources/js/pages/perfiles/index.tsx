import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import PdfButton from '@/components/pdf-button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

interface PerfilRow {
  id: number;
  user?: { id: number; name: string; email: string };
  carrera?: { id: number; nombre: string };
  documento?: string | null;
  telefono?: string | null;
}

interface Paginated {
  data: PerfilRow[];
  links: Url[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Perfiles', href: route('perfiles.index') },
];

export default function Index({ perfiles }: { perfiles: Paginated }) {
  const { delete: destroy, processing } = useForm({});

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Perfiles de usuario" />
      <div className="m-4 space-y-4">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-semibold">Perfiles</CardTitle>
              <p className="text-sm text-muted-foreground">
                Gestiona la información de usuarios y su carrera principal.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={route('perfiles.create')}>
                <Button>Crear perfil</Button>
              </Link>
              <PdfButton href={route('perfiles.report')} label="Exportar PDF" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Carrera principal</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perfiles.data.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.id}</TableCell>
                      <TableCell>{p.user?.name ?? '—'}</TableCell>
                      <TableCell>{p.user?.email ?? '—'}</TableCell>
                      <TableCell>{p.documento ?? '—'}</TableCell>
                      <TableCell>{p.telefono ?? '—'}</TableCell>
                      <TableCell>{p.carrera?.nombre ?? '—'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link href={route('perfiles.edit', p.id)}>
                          <Button size="sm" variant="secondary">
                            Editar
                          </Button>
                        </Link>
                        <ConfirmDelete
                          disabled={processing}
                          onConfirm={() => destroy(route('perfiles.destroy', p.id))}
                          description="El perfil se eliminará definitivamente."
                        >
                          <Button size="sm" variant="destructive" disabled={processing}>
                            Eliminar
                          </Button>
                        </ConfirmDelete>
                      </TableCell>
                    </TableRow>
                  ))}
                  {perfiles.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-sm">
                        No hay perfiles creados.
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
