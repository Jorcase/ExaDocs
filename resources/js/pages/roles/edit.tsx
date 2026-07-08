import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { type FormEvent } from 'react';
import { FormLayout } from '@/components/form-layout';

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
      <div className="mx-auto max-w-7xl px-4 py-8 animate-in fade-in duration-300">
        <FormLayout
          onSubmit={submit}
          processing={processing}
          cancelHref={route('roles.index')}
          submitLabel="Guardar cambios"
          maxWidth="max-w-4xl"
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

            {/* Divider */}
            <div className="border-t border-border/60 pt-4">
              <Label className="text-sm font-medium">Permisos</Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 mt-2">
                {permissions.map((permission) => (
                  <label key={permission} className="flex items-center gap-2 text-sm cursor-pointer select-none">
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
                    <span className="font-medium">{permission}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </FormLayout>
      </div>
    </AppLayout>
  );
}
