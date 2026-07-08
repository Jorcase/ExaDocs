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
        title: 'Tipos de carrera',
        href: route('tipo-carreras.index'),
    },
];

interface TipoCarrera {
    id: number;
    nombre: string;
    descripcion?: string | null;
}

interface TiposPaginated {
    data: TipoCarrera[];
    links: Url[];
}

export default function Index({ tipos }: { tipos: TiposPaginated }) {
    const { processing, delete: destroy } = useForm();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tipos de carrera | Gestión" />
            <ListLayout
                title="Gestión de Tipos de carrera"
                createHref={route('tipo-carreras.create')}
                createLabel="Crear tipo"
                paginationLinks={tipos.links}
            >
                {tipos.data.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[70px]">ID</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tipos.data.map((tipo) => (
                                <TableRow key={tipo.id}>
                                    <TableCell className="font-medium">{tipo.id}</TableCell>
                                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{tipo.nombre}</TableCell>
                                    <TableCell>
                                        {tipo.descripcion ?? (
                                            <span className="text-muted-foreground text-xs italic">Sin detalle</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Link href={route('tipo-carreras.edit', tipo.id)}>
                                            <Button variant="secondary" size="sm" className="rounded-lg">Editar</Button>
                                        </Link>
                                        <ConfirmDelete
                                            disabled={processing}
                                            onConfirm={() =>
                                                destroy(route('tipo-carreras.destroy', tipo.id))
                                            }
                                            description="El tipo de carrera se eliminará definitivamente de la base de datos."
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
                    <p className="text-muted-foreground text-sm text-center py-4">Todavía no hay tipos cargados.</p>
                )}
            </ListLayout>
        </AppLayout>
    );
}
