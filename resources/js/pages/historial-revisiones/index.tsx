import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

interface RevisionRow {
  id: number;
  archivo?: { id: number; titulo: string };
  revisor?: { id: number; name: string };
  estado_previo: string;
  estado_nuevo: string;
  comentario?: string | null;
}

interface Paginated {
  data: RevisionRow[];
  links: Url[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Historial de revisiones', href: route('historial-revisiones.index') },
];

export default function Index({ revisiones }: { revisiones: Paginated }) {
  const { delete: destroy, processing } = useForm({});

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Historial de revisiones" />
      <div className="m-4 space-y-4">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-semibold">Historial de revisiones</CardTitle>
              <p className="text-sm text-muted-foreground">
                Registra cuándo y quién modificó el estado de cada archivo.
              </p>
            </div>
            <Link href={route('historial-revisiones.create')}>
              <Button>Registrar revisión</Button>
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
                    <TableHead>Archivo</TableHead>
                    <TableHead>Revisor</TableHead>
                    <TableHead>Estado previo</TableHead>
                    <TableHead>Estado nuevo</TableHead>
                    <TableHead>Comentario</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revisiones.data.map((rev) => (
                    <TableRow key={rev.id}>
                      <TableCell>{rev.id}</TableCell>
                      <TableCell>{rev.archivo?.titulo ?? '—'}</TableCell>
                      <TableCell>{rev.revisor?.name ?? '—'}</TableCell>
                      <TableCell>{rev.estado_previo}</TableCell>
                      <TableCell>{rev.estado_nuevo}</TableCell>
                      <TableCell className="max-w-xs whitespace-pre-wrap text-sm text-muted-foreground">
                        {rev.comentario ?? '—'}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link href={route('historial-revisiones.edit', rev.id)}>
                          <Button size="sm" variant="secondary">
                            Editar
                          </Button>
                        </Link>
                        <ConfirmDelete
                          disabled={processing}
                          onConfirm={() => destroy(route('historial-revisiones.destroy', rev.id))}
                          description="La revisión se eliminará definitivamente."
                        >
                          <Button size="sm" variant="destructive" disabled={processing}>
                            Eliminar
                          </Button>
                        </ConfirmDelete>
                      </TableCell>
                    </TableRow>
                  ))}
                  {revisiones.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-sm">
                        No hay revisiones registradas.
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
