import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { type FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Permisos', href: route('permissions.index') },
  { title: 'Crear', href: route('permissions.create') },
];

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post(route('permissions.store'));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Crear permiso" />
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
            Crear permiso
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
