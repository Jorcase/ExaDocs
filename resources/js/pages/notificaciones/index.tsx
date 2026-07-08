import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { ListLayout } from '@/components/list-layout';
import { DataTable } from '@/components/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface NotificacionRow {
  id: number;
  user?: { id: number; name: string };
  tipo: string;
  data: Record<string, any>;
  leido_en?: string | null;
}

interface Paginated {
  data: NotificacionRow[];
  links: Url[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Notificaciones', href: route('admin.notificaciones.index') },
];

export default function Index({
  notificaciones,
  filters,
}: {
  notificaciones: Paginated;
  filters?: { search?: string };
}) {
  const { delete: destroy, processing } = useForm({});
  const [search, setSearch] = useState(filters?.search ?? '');

  // Debounced server-side search update
  useEffect(() => {
    const timer = setTimeout(() => {
      router.get(
        route('admin.notificaciones.index'),
        { search },
        { preserveState: true, preserveScroll: true, replace: true }
      );
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Column definitions for the DRY DataTable component
  const columns: ColumnDef<NotificacionRow>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ getValue }) => <span className="font-medium">{getValue<number>()}</span>,
    },
    {
      id: 'usuario',
      accessorFn: (row) => row.user?.name ?? '—',
      header: 'Usuario',
      cell: ({ getValue }) => <span className="font-semibold text-foreground">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ getValue }) => <span className="capitalize text-xs">{getValue<string>().replace('_', ' ')}</span>,
    },
    {
      accessorKey: 'leido_en',
      header: 'Estado',
      cell: ({ getValue }) =>
        getValue<string | null>() ? (
          <Badge variant="default">Leído</Badge>
        ) : (
          <Badge variant="secondary">Pendiente</Badge>
        ),
    },
    {
      id: 'actions',
      header: <div className="text-right">Acciones</div>,
      enableSorting: false,
      cell: ({ row }) => {
        const n = row.original;
        return (
          <div className="flex w-full justify-end gap-2 pr-1">
            <Link href={route('admin.notificaciones.edit', n.id)}>
              <Button size="sm" variant="secondary" className="rounded-lg">
                Editar
              </Button>
            </Link>
            <ConfirmDelete
              disabled={processing}
              onConfirm={() => destroy(route('admin.notificaciones.destroy', n.id))}
              description="La notificación se eliminará definitivamente de la base de datos."
            >
              <Button size="sm" variant="destructive" className="rounded-lg" disabled={processing}>
                Eliminar
              </Button>
            </ConfirmDelete>
          </div>
        );
      },
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Notificaciones | Gestión" />
      <ListLayout
        title="Gestión de Notificaciones"
        createHref={route('admin.notificaciones.create')}
        createLabel="Crear notificación"
        paginationLinks={notificaciones.links}
      >
        <DataTable
          columns={columns}
          data={notificaciones.data}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar por usuario..."
        />
      </ListLayout>
    </AppLayout>
  );
}
