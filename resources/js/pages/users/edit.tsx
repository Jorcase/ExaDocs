import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { route } from 'ziggy-js';
import { FormLayout } from '@/components/form-layout';

type UserData = {
  id: number;
  name: string;
  email: string;
  roles?: { name: string }[];
};

type Props = {
  user: UserData;
  roles: string[];
};

export default function Edit({ user, roles }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    name: user.name,
    email: user.email,
    password: '',
    roles: (user.roles ?? []).map((r) => r.name),
  });

  const toggleRole = (role: string, checked: boolean | string) => {
    if (checked) {
      setData('roles', [...data.roles, role]);
    } else {
      setData('roles', data.roles.filter((r) => r !== role));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('users.update', user.id));
  };

  const breadcrumbs = [
    { title: 'Usuarios', href: route('users.index') },
    { title: `Editar ${user.name}` }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Editar ${user.name}`} />
      <div className="mx-auto max-w-7xl px-4 py-8 animate-in fade-in duration-300">
        <FormLayout
          onSubmit={handleSubmit}
          processing={processing}
          cancelHref={route('users.index')}
          submitLabel="Guardar cambios"
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            {/* Row 1: Nombre & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="rounded-lg"
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
            </div>

            {/* Row 2: Contraseña */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña (opcional)</Label>
              <Input
                id="password"
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                placeholder="Dejar vacío para no cambiar"
                className="rounded-lg"
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            {/* Divider */}
            <div className="border-t border-border/60 pt-4">
              <Label className="text-sm font-medium">Roles</Label>
              <div className="grid gap-3 sm:grid-cols-3 mt-2">
                {roles.map((role) => (
                  <label key={role} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <Checkbox
                      checked={data.roles.includes(role)}
                      onCheckedChange={(checked) => toggleRole(role, checked)}
                    />
                    <span className="font-medium">{role}</span>
                  </label>
                ))}
              </div>
              {errors.roles && <p className="text-sm text-destructive mt-1.5">{errors.roles}</p>}
            </div>
          </div>
        </FormLayout>
      </div>
    </AppLayout>
  );
}
