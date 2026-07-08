import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { route } from 'ziggy-js';
import type { Url } from '@/types';
import { ListLayout } from '@/components/list-layout';

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
      <Head title="Usuarios | Gestión" />
      <ListLayout
        title="Gestión de Usuarios"
        createHref={route('users.create')}
        createLabel="Crear usuario"
        paginationLinks={users.links}
        actions={
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applySearch()}
              className="w-64 rounded-lg"
            />
            <Button variant="secondary" onClick={applySearch} className="rounded-lg">
              Buscar
            </Button>
            {search && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch('');
                  router.get(route('users.index'), {}, { preserveScroll: true, replace: true });
                }}
                className="rounded-lg"
              >
                Limpiar
              </Button>
            )}
          </div>
        }
      >
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground uppercase text-[10px] font-mono tracking-wider border-b">
              <tr>
                <th className="px-4 py-3 w-[70px]">ID</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {users.data.map((user) => (
                <tr key={user.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-medium">{user.id}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{user.name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{user.email}</td>
                  <td className="px-4 py-3">
                    {user.roles?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((r) => (
                          <Badge key={r.name} variant="secondary" className="text-[10px] capitalize">
                            {r.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Sin rol</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={route('users.edit', user.id)}>
                        <Button size="sm" variant="secondary" className="rounded-lg">
                          Editar
                        </Button>
                      </Link>
                      <ConfirmDelete
                        disabled={processing}
                        onConfirm={() => destroy(route('users.destroy', user.id))}
                        description="El usuario se eliminará definitivamente de la base de datos."
                      >
                        <Button size="sm" variant="destructive" className="rounded-lg" disabled={processing}>
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
                    No hay usuarios cargados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ListLayout>
    </AppLayout>
  );
}
