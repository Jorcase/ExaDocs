import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type FormEvent } from 'react';

interface CarouselItem {
  id: number;
  url: string;
  title?: string | null;
  description?: string | null;
  priority?: number | null;
}

export default function Edit({ item }: { item: CarouselItem }) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Carousel', href: route('carousel.index') },
    { title: `Editar #${item.id}`, href: route('carousel.edit', item.id) },
  ];

  const { data, setData, put, processing, errors } = useForm({
    url: item.url,
    title: item.title ?? '',
    description: item.description ?? '',
    priority: item.priority ?? '',
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    put(route('carousel.update', item.id));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Carousel | Editar #${item.id}`} />
        <div className="flex justify-center px-4 py-6">
        <div className="w-full max-w-2xl space-y-4 rounded-2xl border-2 border-border/70 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 shadow-lg backdrop-blur-sm dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="url">Imagen (URL)</Label>
            <Input id="url" value={data.url} onChange={(e) => setData('url', e.target.value)} />
            {errors.url && <p className="text-sm text-destructive">{errors.url}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="priority">Prioridad</Label>
            <Input
              id="priority"
              type="number"
              value={data.priority}
              onChange={(e) => setData('priority', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Opcional"
            />
            {errors.priority && <p className="text-sm text-destructive">{errors.priority}</p>}
          </div>

          <Button disabled={processing} type="submit">Guardar cambios</Button>
        </form>
      </div>
      </div>
    </AppLayout>
  );
}
