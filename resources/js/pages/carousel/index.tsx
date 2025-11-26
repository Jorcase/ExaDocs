import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
    { title: 'Carousel', href: route('carousel.index') },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Carousel" />
      <section className="m-4 space-y-4 rounded-2xl border border-border/60 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Carousel</h1>
            <p className="text-sm text-slate-700 dark:text-slate-200">Administra las imágenes y textos que se muestran en la portada.</p>
          </div>
          <Link href={route('carousel.create')}>
            <Button>Agregar slide</Button>
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/60 bg-white/50 dark:bg-white/5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-900 dark:text-slate-100">ID</TableHead>
                <TableHead className="text-slate-900 dark:text-slate-100">Imagen URL</TableHead>
                <TableHead className="text-slate-900 dark:text-slate-100">Título</TableHead>
                <TableHead className="text-slate-900 dark:text-slate-100">Prioridad</TableHead>
                <TableHead className="text-right text-slate-900 dark:text-slate-100">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell className="max-w-xs truncate" title={item.url}>{item.url}</TableCell>
                  <TableCell>{item.title ?? '—'}</TableCell>
                  <TableCell>{item.priority ?? '—'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={route('carousel.edit', item.id)}>
                      <Button size="sm" variant="secondary">Editar</Button>
                    </Link>
                    <ConfirmDelete
                      disabled={processing}
                      onConfirm={() => destroy(route('carousel.destroy', item.id))}
                      description="El slide se eliminará definitivamente."
                    >
                      <Button size="sm" variant="destructive" disabled={processing}>Eliminar</Button>
                    </ConfirmDelete>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm">No hay imágenes en el carrusel.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </AppLayout>
  );
}
