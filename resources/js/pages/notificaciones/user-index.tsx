import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ListLayout } from '@/components/list-layout';
import { DataTable } from '@/components/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import React, { useMemo } from 'react';

interface NotificacionRow {
  id: number;
  tipo: string;
  titulo?: string | null;
  mensaje?: string | null;
  data?: Record<string, any> | null;
  archivo_id?: number | null;
  actor?: { id: number; name: string } | null;
  leido_en?: string | null;
  created_at?: string;
}

interface Paginated {
  data: NotificacionRow[];
  links: Url[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Notificaciones', href: route('notificaciones.index') },
];

export default function UserIndex({ notificaciones }: { notificaciones: Paginated }) {
  const { post, processing } = useForm({});

  const toggleRead = (id: number, isRead: boolean) => {
    post(route(isRead ? 'notificaciones.unread' : 'notificaciones.read', id), {
      preserveScroll: true,
    });
  };

  const markAllRead = () => {
    post(route('notificaciones.readAll'), {
      preserveScroll: true,
    });
  };

  const columns = useMemo<ColumnDef<NotificacionRow>[]>(
    () => [
      {
        accessorKey: 'titulo',
        header: 'Título',
        cell: ({ row }) => {
          const n = row.original;
          if (n.archivo_id) {
            return (
              <Link
                href={route('archivos.show', n.archivo_id)}
                className="font-semibold text-primary dark:text-sky-300 hover:underline"
              >
                {n.titulo ?? '—'}
              </Link>
            );
          }
          return <span className="font-semibold text-foreground">{n.titulo ?? '—'}</span>;
        },
      },
      {
        accessorKey: 'tipo',
        header: 'Tipo',
        cell: ({ getValue }) => <span className="capitalize text-xs">{getValue<string>().replace('_', ' ')}</span>,
      },
      {
        accessorKey: 'mensaje',
        header: 'Mensaje',
        cell: ({ row }) => {
          const n = row.original;
          return (
            <div className="max-w-xs truncate text-muted-foreground text-xs" title={n.mensaje ?? ''}>
              {n.mensaje ?? '—'}
              {n.data?.comentario && <span className="italic"> ({n.data.comentario})</span>}
            </div>
          );
        },
      },
      {
        id: 'actor',
        header: 'De',
        cell: ({ row }) => <span>{row.original.actor?.name ?? (row.original.archivo_id ? 'Archivo' : 'Sistema')}</span>,
      },
      {
        accessorKey: 'created_at',
        header: 'Fecha',
        cell: ({ getValue }) => {
          const value = getValue<string | undefined>();
          if (!value) return '—';
          return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
        },
      },
      {
        accessorKey: 'leido_en',
        header: 'Estado',
        cell: ({ getValue }) =>
          getValue<string | null>() ? (
            <Badge variant="default" className="bg-muted text-muted-foreground hover:bg-muted/80">Leída</Badge>
          ) : (
            <Badge variant="secondary" className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-none font-semibold">Pendiente</Badge>
          ),
      },
      {
        id: 'actions',
        header: <div className="text-right">Acciones</div>,
        cell: ({ row }) => {
          const n = row.original;
          return (
            <div className="text-right">
              <Button
                size="sm"
                variant={n.leido_en ? 'outline' : 'secondary'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRead(n.id, !!n.leido_en);
                }}
                disabled={processing}
                className="rounded-lg h-8 text-xs font-semibold"
              >
                {n.leido_en ? 'Marcar como no leída' : 'Marcar como leída'}
              </Button>
            </div>
          );
        },
      },
    ],
    [processing]
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Mis notificaciones" />
      <ListLayout
        title="Mis notificaciones"
        paginationLinks={notificaciones.links}
        actions={
          notificaciones.data.some((n) => !n.leido_en) && (
            <Button
              variant="outline"
              onClick={markAllRead}
              disabled={processing}
              className="rounded-lg h-9 text-xs font-bold"
            >
              Marcar todas como leídas
            </Button>
          )
        }
      >
        <DataTable
          columns={columns}
          data={notificaciones.data}
          filterKey="titulo"
          placeholder="Filtrar por título..."
        />
      </ListLayout>
    </AppLayout>
  );
}
