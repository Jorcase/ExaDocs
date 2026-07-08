import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ListLayout } from '@/components/list-layout';

interface CarouselItem {
  id: number;
  url: string;
  title?: string | null;
  description?: string | null;
  priority?: number | null;
}

export default function Index({ items }: { items: CarouselItem[] }) {
  const { delete: destroy, processing } = useForm({});

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Carrusel', href: route('carousel.index') },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Carrusel | Gestión" />
      <ListLayout
        title="Gestión de Carrusel"
        createHref={route('carousel.create')}
        createLabel="Agregar slide"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-slate-900 dark:text-slate-100 w-[70px]">ID</TableHead>
              <TableHead className="text-slate-900 dark:text-slate-100">Imagen URL</TableHead>
              <TableHead className="text-slate-900 dark:text-slate-100">Título</TableHead>
              <TableHead className="text-slate-900 dark:text-slate-100">Prioridad</TableHead>
              <TableHead className="text-right text-slate-900 dark:text-slate-100">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell className="max-w-xs truncate text-xs text-muted-foreground font-mono" title={item.url}>{item.url}</TableCell>
                <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{item.title ?? '—'}</TableCell>
                <TableCell>{item.priority ?? '—'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={route('carousel.edit', item.id)}>
                    <Button size="sm" variant="secondary" className="rounded-lg">Editar</Button>
                  </Link>
                  <ConfirmDelete
                    disabled={processing}
                    onConfirm={() => destroy(route('carousel.destroy', item.id))}
                    description="El slide se eliminará definitivamente de la base de datos."
                  >
                    <Button size="sm" variant="destructive" className="rounded-lg" disabled={processing}>Eliminar</Button>
                  </ConfirmDelete>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm py-4 text-muted-foreground">No hay imágenes en el carrusel.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ListLayout>
    </AppLayout>
  );
}
