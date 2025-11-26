import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDelete } from '@/components/confirm-delete';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { route } from 'ziggy-js';
import Pagination from '@/components/pagination';
import type { Url } from '@/types';

type UserRow = {
  id: number;
  name: string;
  email: string;
  roles?: { name: string }[];
  created_at?: string;
};

type Paginated = {
  data: UserRow[];
  links: Url[];
};

type Props = {
  users: Paginated;
  filters?: {
    search?: string;
  };
};

export default function Index({ users, filters }: Props) {
  const { delete: destroy, processing } = useForm({});
  const [search, setSearch] = useState(filters?.search ?? '');

  useEffect(() => {
    setSearch(filters?.search ?? '');
  }, [filters]);

  const applySearch = () => {
    router.get(route('users.index'), { search: search || undefined }, { preserveScroll: true, replace: true });
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Usuarios', href: route('users.index') }]}>
      <Head title="Usuarios" />
      <div className="m-4 space-y-4">
        <Card className="border-2 border-border/70 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-4 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Gestión de usuarios</CardTitle>
              <p className="text-sm text-muted-foreground">Administra usuarios y sus roles.</p>
            </div>
            <Link href={route('users.create')}>
              <Button>Crear usuario</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
              <Button variant="secondary" onClick={applySearch}>
                Buscar
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch('');
                  router.get(route('users.index'), {}, { preserveScroll: true, replace: true });
                }}
              >
                Limpiar
              </Button>
            </div>

            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr className="text-left">
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Nombre</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Roles</th>
                    <th className="px-4 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.data.map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="px-4 py-2">{user.id}</td>
                      <td className="px-4 py-2">{user.name}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2 space-x-1">
                        {user.roles?.length
                          ? user.roles.map((r) => (
                              <Badge key={r.name} variant="secondary">
                                {r.name}
                              </Badge>
                            ))
                          : <span className="text-muted-foreground">Sin rol</span>}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <Link href={route('users.edit', user.id)}>
                            <Button size="sm" variant="secondary">
                              Editar
                            </Button>
                          </Link>
                          <ConfirmDelete
                            disabled={processing}
                            onConfirm={() => destroy(route('users.destroy', user.id))}
                            description="El usuario se eliminará definitivamente."
                          >
                            <Button size="sm" variant="destructive" disabled={processing}>
                              Eliminar
                            </Button>
                          </ConfirmDelete>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.data.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                        No hay usuarios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <Pagination links={users.links} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
