import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ConfirmDelete } from '@/components/confirm-delete';
import Pagination from '@/components/pagination';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { route } from 'ziggy-js';

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
            <Head title="Estados de archivo | Listado" />
            <div className="m-4 space-y-4">
                <Card>
                    <CardContent className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <CardTitle className="text-lg font-semibold">Estados de archivo</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Controla los estados disponibles para revisar archivos.
                            </p>
                        </div>
                        <Link href={route('estado-archivos.create')}>
                            <Button>Crear estado</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-4">
                        {estados.data.length > 0 ? (
                            <>
                                <Table>
                                    <TableCaption>Listado de estados de archivo.</TableCaption>
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
                                                <TableCell>{estado.nombre}</TableCell>
                                                <TableCell>
                                                    {estado.descripcion ?? (
                                                        <span className="text-muted-foreground">Sin detalle</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {estado.es_final ? (
                                                        <span className="text-green-600">Sí</span>
                                                    ) : (
                                                        <span className="text-muted-foreground">No</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Link href={route('estado-archivos.edit', estado.id)}>
                                                        <Button variant="secondary">Editar</Button>
                                                    </Link>
                                                    <ConfirmDelete
                                                        disabled={processing}
                                                        onConfirm={() => destroy(route('estado-archivos.destroy', estado.id))}
                                                        description="El estado se eliminará definitivamente."
                                                    >
                                                        <Button variant="destructive" disabled={processing}>
                                                            Eliminar
                                                        </Button>
                                                    </ConfirmDelete>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="flex justify-end">
                                    <Pagination links={estados.links} />
                                </div>
                            </>
                        ) : (
                            <p className="text-muted-foreground">Todavía no hay estados de archivo cargados.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
