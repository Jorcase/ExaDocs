import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

interface ComentarioRow {
  id: number;
  archivo?: { id: number; titulo: string };
  autor?: { id: number; name: string };
  cuerpo: string;
  destacado: boolean;
}

interface Paginated {
  data: ComentarioRow[];
  links: Url[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Comentarios', href: route('comentarios.index') },
];

export default function Index({ comentarios }: { comentarios: Paginated }) {
  const { delete: destroy, processing } = useForm({});

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Comentarios" />
      <div className="m-4 space-y-4">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-semibold">Comentarios</CardTitle>
              <p className="text-sm text-muted-foreground">
                Observaciones públicas vinculadas a archivos y autores.
              </p>
            </div>
            <Link href={route('comentarios.create')}>
              <Button>Crear comentario</Button>
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
                    <TableHead>Autor</TableHead>
                    <TableHead>Comentario</TableHead>
                    <TableHead>Destacado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comentarios.data.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.id}</TableCell>
                      <TableCell>{c.archivo?.titulo ?? '—'}</TableCell>
                      <TableCell>{c.autor?.name ?? '—'}</TableCell>
                      <TableCell className="max-w-md whitespace-pre-wrap text-sm">{c.cuerpo}</TableCell>
                      <TableCell>
                        {c.destacado ? <Badge variant="default">Sí</Badge> : <Badge variant="secondary">No</Badge>}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link href={route('comentarios.edit', c.id)}>
                          <Button size="sm" variant="secondary">
                            Editar
                          </Button>
                        </Link>
                        <ConfirmDelete
                          disabled={processing}
                          onConfirm={() => destroy(route('comentarios.destroy', c.id))}
                          description="El comentario se eliminará definitivamente."
                        >
                          <Button size="sm" variant="destructive" disabled={processing}>
                            Eliminar
                          </Button>
                        </ConfirmDelete>
                      </TableCell>
                    </TableRow>
                  ))}
                  {comentarios.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm">
                        No hay comentarios.
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
