import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { DataTable } from '@/components/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { ListLayout } from '@/components/list-layout';

interface Permiso {
  id: number;
  name: string;
  created_at?: string;
}

interface Paginated {
  data: Permiso[];
  links: Url[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Permisos', href: route('permissions.index') },
];

export default function Index({ permissions }: { permissions: Paginated }) {
  const { delete: destroy, processing } = useForm({});
  const columns: ColumnDef<Permiso>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0 font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          ID
          <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ getValue }) => <span className="font-medium">{getValue<number>()}</span>,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0 font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nombre
          <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ getValue }) => <span className="font-semibold text-slate-900 dark:text-slate-100">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0 font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Creado
          <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ getValue }) => getValue<string>() ?? '—',
    },
    {
      id: 'actions',
      header: <div className="text-right">Acciones</div>,
      enableSorting: false,
      cell: ({ row }) => {
        const perm = row.original;
        return (
          <div className="flex w-full justify-end gap-2 pr-1">
            <Link href={route('permissions.edit', perm.id)}>
              <Button size="sm" variant="secondary" className="rounded-lg">
                Editar
              </Button>
            </Link>
            <ConfirmDelete
              disabled={processing}
              onConfirm={() => destroy(route('permissions.destroy', perm.id))}
              description="El permiso se eliminará definitivamente de la base de datos."
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
      <Head title="Permisos | Gestión" />
      <ListLayout
        title="Gestión de Permisos"
        createHref={route('permissions.create')}
        createLabel="Crear permiso"
        paginationLinks={permissions.links}
      >
        <DataTable
          columns={columns}
          data={permissions.data}
          filterKey="name"
          placeholder="Buscar por nombre..."
        />
      </ListLayout>
    </AppLayout>
  );
}
