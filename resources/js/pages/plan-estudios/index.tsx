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
        title: 'Planes de estudio',
        href: route('planes-estudio.index'),
    },
];

interface Plan {
    id: number;
    nombre: string;
    anio_plan: number;
    estado: 'vigente' | 'no_vigente' | 'discontinuado';
    carrera?: {
        id: number;
        nombre: string;
    };
}

interface PlanesPaginated {
    data: Plan[];
    links: Url[];
}

export default function Index({ planes }: { planes: PlanesPaginated }) {
    const { processing, delete: destroy } = useForm();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Planes de estudio | Listado" />
            <div className="m-4 space-y-4">
                <Card>
                    <CardContent className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <CardTitle className="text-lg font-semibold">Planes de estudio</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Administra los planes vigentes según sus carreras y años.
                            </p>
                        </div>
                        <Link href={route('planes-estudio.create')}>
                            <Button>Crear plan</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-4">
                        {planes.data.length > 0 ? (
                            <>
                                <Table>
                                    <TableCaption>Listado de planes de estudio.</TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[70px]">ID</TableHead>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Año</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Carrera</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {planes.data.map((plan) => (
                                            <TableRow key={plan.id}>
                                                <TableCell className="font-medium">{plan.id}</TableCell>
                                                <TableCell>{plan.nombre}</TableCell>
                                                <TableCell>{plan.anio_plan}</TableCell>
                                                <TableCell className="capitalize">{plan.estado}</TableCell>
                                                <TableCell>{plan.carrera?.nombre ?? '-'}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Link href={route('planes-estudio.edit', plan.id)}>
                                                        <Button variant="secondary">Editar</Button>
                                                    </Link>
                                                    <ConfirmDelete
                                                        disabled={processing}
                                                        onConfirm={() => destroy(route('planes-estudio.destroy', plan.id))}
                                                        description="El plan de estudio se eliminará definitivamente."
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
                                    <Pagination links={planes.links} />
                                </div>
                            </>
                        ) : (
                            <p className="text-muted-foreground">Todavía no hay planes cargados.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
