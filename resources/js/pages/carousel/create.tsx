import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type FormEvent } from 'react';
import { FormLayout } from '@/components/form-layout';

export default function Create() {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Carousel', href: route('carousel.index') },
    { title: 'Crear', href: route('carousel.create') },
  ];

  const { data, setData, post, processing, errors } = useForm({
    url: '',
    title: '',
    description: '',
    priority: '' as number | string,
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post(route('carousel.store'));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Carousel | Crear" />
      <div className="mx-auto max-w-7xl px-4 py-8 animate-in fade-in duration-300">
        <FormLayout
          onSubmit={handleSubmit}
          processing={processing}
          cancelHref={route('carousel.index')}
          submitLabel="Crear slide"
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            {/* Row 1: Título & Prioridad */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Ej. Bienvenidos a ExaDocs"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  className="rounded-lg"
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="priority">Prioridad</Label>
                <Input
                  id="priority"
                  type="number"
                  placeholder="Opcional"
                  value={data.priority}
                  onChange={(e) => setData('priority', e.target.value === '' ? '' : Number(e.target.value))}
                  className="rounded-lg"
                />
                {errors.priority && <p className="text-sm text-destructive">{errors.priority}</p>}
              </div>
            </div>

            {/* Row 2: Imagen URL */}
            <div className="space-y-1.5">
              <Label htmlFor="url">Imagen (URL)</Label>
              <Input
                id="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={data.url}
                onChange={(e) => setData('url', e.target.value)}
                className="rounded-lg"
              />
              {errors.url && <p className="text-sm text-destructive">{errors.url}</p>}
            </div>

            {/* Row 3: Descripción */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción del slide para el carrusel"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                className="rounded-lg resize-none min-h-[100px]"
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>
          </div>
        </FormLayout>
      </div>
    </AppLayout>
  );
}
