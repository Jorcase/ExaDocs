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
import { Card, CardContent } from '@/components/ui/card';
import { route } from 'ziggy-js';
import { ListSection } from '@/components/list-section';

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
                <section className="rounded-2xl border border-border/60 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
                    <ListSection
                        title="Estados de archivo"
                        description="Controla los estados disponibles para revisar archivos."
                        actions={
                            <Link href={route('estado-archivos.create')}>
                                <Button>Crear estado</Button>
                            </Link>
                        }
                    />
                </section>
            <Card className="border-2 border-border/70 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-4 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
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
