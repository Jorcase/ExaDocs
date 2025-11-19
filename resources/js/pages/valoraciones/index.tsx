import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

interface ValoracionRow {
  id: number;
  archivo?: { id: number; titulo: string };
  autor?: { id: number; name: string };
  puntaje: number;
  comentario?: string | null;
}

interface Paginated {
  data: ValoracionRow[];
  links: Url[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Valoraciones', href: route('valoraciones.index') },
];

export default function Index({ valoraciones }: { valoraciones: Paginated }) {
  const { delete: destroy, processing } = useForm({});

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Valoraciones" />
      <div className="m-4 space-y-4">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-semibold">Valoraciones</CardTitle>
              <p className="text-sm text-muted-foreground">
                Registra los puntajes y feedback de los usuarios sobre archivos.
              </p>
            </div>
            <Link href={route('valoraciones.create')}>
              <Button>Crear valoración</Button>
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
                    <TableHead>Puntaje</TableHead>
                    <TableHead>Comentario</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {valoraciones.data.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>{v.id}</TableCell>
                      <TableCell>{v.archivo?.titulo ?? '—'}</TableCell>
                      <TableCell>{v.autor?.name ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{v.puntaje}/5</Badge>
                      </TableCell>
                      <TableCell className="max-w-md whitespace-pre-wrap text-sm">
                        {v.comentario ?? '—'}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link href={route('valoraciones.edit', v.id)}>
                          <Button size="sm" variant="secondary">
                            Editar
                          </Button>
                        </Link>
                        <ConfirmDelete
                          disabled={processing}
                          onConfirm={() => destroy(route('valoraciones.destroy', v.id))}
                          description="La valoración se eliminará definitivamente."
                        >
                          <Button size="sm" variant="destructive" disabled={processing}>
                            Eliminar
                          </Button>
                        </ConfirmDelete>
                      </TableCell>
                    </TableRow>
                  ))}
                  {valoraciones.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm">
                        No hay valoraciones.
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
