import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { route } from 'ziggy-js';

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

  return (
    <AppLayout breadcrumbs={[{ title: 'Usuarios', href: route('users.index') }, { title: 'Editar' }]}>
      <Head title={`Editar ${user.name}`} />
      <div className="m-4 space-y-4">
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-semibold">Editar usuario</CardTitle>
            <Link href={route('users.index')}>
              <Button variant="outline">Volver</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Contraseña (opcional)</label>
                <Input
                  type="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  placeholder="Dejar vacío para no cambiar"
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Roles</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {roles.map((role) => (
                    <label key={role} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={data.roles.includes(role)}
                        onCheckedChange={(checked) => toggleRole(role, checked)}
                      />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
                {errors.roles && <p className="text-sm text-destructive">{errors.roles}</p>}
              </div>

              <Button type="submit" disabled={processing}>
                Guardar cambios
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
