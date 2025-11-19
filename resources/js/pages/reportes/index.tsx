import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

interface SimpleUser {
  id: number;
  name: string;
}

interface SimpleArchivo {
  id: number;
  titulo: string;
}

interface ReporteRow {
  id: number;
  archivo?: SimpleArchivo | null;
  reportante?: SimpleUser | null;
  moderador?: SimpleUser | null;
  motivo: string;
  detalle?: string | null;
  estado: string;
}

interface Paginated {
  data: ReporteRow[];
  links: Url[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Reportes de contenido', href: route('reportes.index') },
];

const estadoVariant = (estado?: string) => {
  if (!estado) return 'secondary';
  const value = estado.toLowerCase();
  if (value.includes('pend')) return 'outline';
  if (value.includes('rev')) return 'secondary';
  if (value.includes('res')) return 'success';
  return 'secondary';
};

export default function Index({ reportes }: { reportes: Paginated }) {
  const { delete: destroy, processing } = useForm({});

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Reportes de contenido" />
      <div className="m-4 space-y-4">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-semibold">Reportes de contenido</CardTitle>
              <p className="text-sm text-muted-foreground">
                Supervisa los reportes de archivos y su seguimiento.
              </p>
            </div>
            <Link href={route('reportes.create')}>
              <Button>Crear reporte</Button>
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
                    <TableHead>Reportante</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportes.data.map((rep) => (
                    <TableRow key={rep.id}>
                      <TableCell>{rep.id}</TableCell>
                      <TableCell>{rep.archivo?.titulo ?? '—'}</TableCell>
                      <TableCell>{rep.reportante?.name ?? '—'}</TableCell>
                      <TableCell className="capitalize">{rep.motivo.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Badge variant={estadoVariant(rep.estado) as any}>{rep.estado}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link href={route('reportes.edit', rep.id)}>
                          <Button size="sm" variant="secondary">
                            Editar
                          </Button>
                        </Link>
                        <ConfirmDelete
                          disabled={processing}
                          onConfirm={() => destroy(route('reportes.destroy', rep.id))}
                          description="El reporte se eliminará definitivamente."
                        >
                          <Button size="sm" variant="destructive" disabled={processing}>
                            Eliminar
                          </Button>
                        </ConfirmDelete>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reportes.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm">
                        No hay reportes registrados.
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
