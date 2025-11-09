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
import Pagination from '@/components/pagination';
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
    version: string;
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

    const handleDelete = (id: number) => {
        if (confirm('¿Seguro que querés eliminar este plan?')) {
            destroy(route('planes-estudio.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Planes de estudio | Listado" />
            <div className="m-4 space-y-4">
                <Link href={route('planes-estudio.create')}>
                    <Button>Crear plan</Button>
                </Link>

                {planes.data.length > 0 ? (
                    <Table>
                        <TableCaption>Listado de planes de estudio.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[70px]">ID</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Versión</TableHead>
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
                                    <TableCell>{plan.version}</TableCell>
                                    <TableCell>{plan.anio_plan}</TableCell>
                                    <TableCell className="capitalize">{plan.estado}</TableCell>
                                    <TableCell>{plan.carrera?.nombre ?? '-'}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Link href={route('planes-estudio.edit', plan.id)}>
                                            <Button variant="secondary">Editar</Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            disabled={processing}
                                            onClick={() => handleDelete(plan.id)}
                                        >
                                            Eliminar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-muted-foreground">Todavía no hay planes cargados.</p>
                )}

                <div className="my-2">
                    <Pagination links={planes.links} />
                </div>
            </div>
        </AppLayout>
    );
}
