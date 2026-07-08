import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { type FormEvent } from 'react';
import { FormLayout } from '@/components/form-layout';

interface Permiso {
  id: number;
  name: string;
}

const breadcrumbsBase: BreadcrumbItem = { title: 'Permisos', href: route('permissions.index') };

export default function Edit({ permiso }: { permiso: Permiso }) {
  const breadcrumbs: BreadcrumbItem[] = [
    breadcrumbsBase,
    { title: `Editar ${permiso.name}`, href: route('permissions.edit', permiso.id) },
  ];

  const { data, setData, put, processing, errors } = useForm({
    name: permiso.name,
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    put(route('permissions.update', permiso.id));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Editar permiso ${permiso.name}`} />
      <div className="mx-auto max-w-7xl px-4 py-8 animate-in fade-in duration-300">
        <FormLayout
          onSubmit={handleSubmit}
          processing={processing}
          cancelHref={route('permissions.index')}
          submitLabel="Guardar cambios"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className="rounded-lg"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
          </div>
        </FormLayout>
      </div>
    </AppLayout>
  );
}
