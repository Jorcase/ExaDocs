import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import { route } from 'ziggy-js';
import { ListLayout } from '@/components/list-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Estados de archivo',
        href: route('estado-archivos.index'),
    },
];

interface EstadoArchivo {
    id: number;
    nombre: string;
    descripcion?: string | null;
    es_final: boolean;
}

interface EstadosPaginated {
    data: EstadoArchivo[];
    links: Url[];
}

export default function Index({ estados }: { estados: EstadosPaginated }) {
    const { processing, delete: destroy } = useForm();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Estados de archivo | Gestión" />
            <ListLayout
                title="Gestión de Estados de archivo"
                createHref={route('estado-archivos.create')}
                createLabel="Crear estado"
                paginationLinks={estados.links}
            >
                {estados.data.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[70px]">ID</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Finaliza</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {estados.data.map((estado) => (
                                <TableRow key={estado.id}>
                                    <TableCell className="font-medium">{estado.id}</TableCell>
                                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{estado.nombre}</TableCell>
                                    <TableCell>
                                        {estado.descripcion ?? (
                                            <span className="text-muted-foreground text-xs italic">Sin detalle</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {estado.es_final ? (
                                            <span className="text-green-600 dark:text-green-400 text-xs font-semibold">Sí</span>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">No</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Link href={route('estado-archivos.edit', estado.id)}>
                                            <Button variant="secondary" size="sm" className="rounded-lg">Editar</Button>
                                        </Link>
                                        <ConfirmDelete
                                            disabled={processing}
                                            onConfirm={() => destroy(route('estado-archivos.destroy', estado.id))}
                                            description="El estado se eliminará definitivamente de la base de datos."
                                        >
                                            <Button variant="destructive" size="sm" className="rounded-lg" disabled={processing}>
                                                Eliminar
                                            </Button>
                                        </ConfirmDelete>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">Todavía no hay estados de archivo cargados.</p>
                )}
            </ListLayout>
        </AppLayout>
    );
}
