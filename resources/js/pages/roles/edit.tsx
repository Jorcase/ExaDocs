import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { type FormEvent } from 'react';

interface Role {
  id: number;
  name: string;
  permissions: { name: string }[];
}

const breadcrumbsBase: BreadcrumbItem = { title: 'Roles', href: route('roles.index') };

export default function Edit({ role, permissions }: { role: Role; permissions: string[] }) {
  const breadcrumbs: BreadcrumbItem[] = [
    breadcrumbsBase,
    { title: `Editar ${role.name}`, href: route('roles.edit', role.id) },
  ];

  const { data, setData, put, errors, processing } = useForm({
    name: role.name,
    permissions: role.permissions.map((p) => p.name),
  });

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    put(route('roles.update', role.id));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Editar rol ${role.name}`} />
      <div className="m-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Editar rol</h1>
          <Link href={route('roles.index')}>
            <Button variant="secondary">Volver</Button>
          </Link>
        </div>
        <div className="rounded border p-4 space-y-4">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Permisos</Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {permissions.map((permission) => (
                  <label key={permission} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      id={permission}
                      checked={data.permissions.includes(permission)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setData('permissions', [...data.permissions, permission]);
                        } else {
                          setData('permissions', data.permissions.filter((p) => p !== permission));
                        }
                      }}
                    />
                    {permission}
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={processing}>
              Guardar cambios
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
