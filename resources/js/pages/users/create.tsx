import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { route } from 'ziggy-js';

type Props = {
  roles: string[];
};

export default function Create({ roles }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    password: '',
    roles: [] as string[],
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
    post(route('users.store'));
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Usuarios', href: route('users.index') }, { title: 'Crear' }]}>
      <Head title="Crear usuario" />
      <div className="m-4 space-y-4">
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-semibold">Crear usuario</CardTitle>
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
                  placeholder="Nombre completo"
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Contraseña</label>
                <Input
                  type="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  placeholder="Mínimo 8 caracteres"
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
                Crear
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
