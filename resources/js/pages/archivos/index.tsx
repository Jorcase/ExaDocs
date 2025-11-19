import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import PdfButton from '@/components/pdf-button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, FileSpreadsheet, FileCode2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Archivos', href: route('archivos.index') },
];

interface Relacion {
  id: number;
  nombre?: string;
  name?: string;
}

interface ArchivoRow {
  id: number;
  titulo: string;
  descripcion?: string | null;
  file_path?: string;
   thumbnail_path?: string | null;
  materia?: Relacion | null;
  tipo?: Relacion | null;
  estado?: Relacion | null;
  autor?: Relacion | null;
}

interface ArchivosPaginated {
  data: ArchivoRow[];
  links: Url[];
}

export default function Index({ archivos }: { archivos: ArchivosPaginated }) {
  const { delete: destroy, processing } = useForm({});
  const isImage = (path?: string) => !!path && /\.(png|jpe?g|gif|webp)$/i.test(path);
  const isPdf = (path?: string) => !!path && /\.pdf$/i.test(path);
  const isSpreadsheet = (path?: string) => !!path && /\.(xls|xlsx|csv)$/i.test(path);
  const isDoc = (path?: string) => !!path && /\.(doc|docx)$/i.test(path);
  const estadoColor = (nombre?: string) => {
    if (!nombre) return 'secondary';
    const value = nombre.toLowerCase();
    if (value.includes('pend')) return 'outline';
    if (value.includes('rech')) return 'destructive';
    if (value.includes('acept') || value.includes('aprob')) return 'default';
    return 'secondary';
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Archivos | Listado" />
      <div className="m-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-semibold">Archivos cargados</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={route('archivos.create')}>
              <Button>Subir archivo</Button>
            </Link>
            <PdfButton href={route('archivos.report')} label="Exportar PDF" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {archivos.data.map((item) => (
            <Card key={item.id} className="overflow-hidden">
            <CardHeader className="p-0">
              {item.thumbnail_path ? (
                <img
                  src={`/storage/${item.thumbnail_path}`}
                  alt={`Miniatura de ${item.titulo}`}
                  className="h-40 w-full object-cover"
                />
              ) : isImage(item.file_path) ? (
                <img
                  src={`/storage/${item.file_path}`}
                  alt={item.titulo}
                  className="h-40 w-full object-cover"
                />
              ) : isPdf(item.file_path) ? (
                <div className="h-40 w-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                  <FileText className="h-6 w-6" />
                  <span className="ml-2">PDF</span>
                </div>
              ) : (
                <div className="h-40 w-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                  {isSpreadsheet(item.file_path) && (
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-6 w-6" />
                      <span>Hoja de cálculo</span>
                    </div>
                  )}
                  {isDoc(item.file_path) && (
                    <div className="flex items-center gap-2">
                      <FileCode2 className="h-6 w-6" />
                      <span>Documento</span>
                    </div>
                  )}
                  {!item.file_path && <span>Sin archivo</span>}
                  {item.file_path &&
                    !isSpreadsheet(item.file_path) &&
                    !isDoc(item.file_path) && <span>Vista previa no disponible</span>}
                </div>
              )}
            </CardHeader>
              <CardContent className="space-y-1 py-3 px-4">
                <CardTitle className="text-base">{item.titulo}</CardTitle>
                {item.descripcion && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.descripcion}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Materia: <span className="font-medium">{item.materia?.nombre ?? '—'}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Tipo: <span className="font-medium">{item.tipo?.nombre ?? '—'}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant={estadoColor(item.estado?.nombre) as any}>
                    {item.estado?.nombre ?? 'Sin estado'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Autor: {item.autor?.name ?? '—'}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between px-4 pb-4">
                <Link href={route('archivos.show', item.id)}>
                  <Button size="sm" variant="outline">
                    Ver
                  </Button>
                </Link>
                <div className="flex gap-2">
                  <Link href={route('archivos.edit', item.id)}>
                    <Button size="sm" variant="secondary">
                      Editar
                    </Button>
                  </Link>
                  <ConfirmDelete
                    disabled={processing}
                    onConfirm={() => destroy(route('archivos.destroy', item.id))}
                    description="El archivo se eliminará definitivamente."
                  >
                    <Button size="sm" variant="destructive" disabled={processing}>
                      Eliminar
                    </Button>
                  </ConfirmDelete>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
        {archivos.data.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay archivos cargados todavía.</p>
        )}
      </div>
    </AppLayout>
  );
}
