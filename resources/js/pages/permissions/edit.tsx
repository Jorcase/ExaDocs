import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { type FormEvent } from 'react';

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
      <div className="w-full max-w-xl p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="name">
              Nombre
            </label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <Button disabled={processing} type="submit">
            Guardar cambios
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
