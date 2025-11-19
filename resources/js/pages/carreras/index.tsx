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
import PdfButton from '@/components/pdf-button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Carreras',
        href: route('carreras.index'),
    },
];

interface Tipo {
    id: number;
    nombre: string;
}

interface Carrera {
    id: number;
    nombre: string;
    codigo: string;
    descripcion?: string | null;
    estado: 'activa' | 'inactiva';
    tipo_carrera_id: number | null;
    tipo_carrera?: Tipo | null;
}

interface CarrerasPaginated {
    data: Carrera[];
    links: Url[];
}

export default function Index({ carreras }: { carreras: CarrerasPaginated }) {
    const { processing, delete: destroy } = useForm();
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Carreras | Listado" />
            <div className="m-4 space-y-4">
                <Card>
                    <CardContent className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <CardTitle className="text-lg font-semibold">Carreras</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Controla las carreras habilitadas, su tipo y estado.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link href={route('carreras.create')}>
                                <Button>Crear carrera</Button>
                            </Link>
                            <PdfButton href={route('carreras.report')} label="Exportar PDF" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-4">
                        {carreras.data.length > 0 ? (
                            <>
                                <Table>
                                    <TableCaption>Listado de carreras cargadas.</TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">ID</TableHead>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Código</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {carreras.data.map((carrera) => (
                                            <TableRow key={carrera.id}>
                                                <TableCell className="font-medium">{carrera.id}</TableCell>
                                                <TableCell>
                                                    <p className="font-semibold">{carrera.nombre}</p>
                                                    {carrera.descripcion && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {carrera.descripcion}
                                                        </p>
                                                    )}
                                                </TableCell>
                                                <TableCell>{carrera.codigo}</TableCell>
                                                <TableCell>{carrera.tipo_carrera?.nombre ?? '—'}</TableCell>
                                                <TableCell className="capitalize">{carrera.estado}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Link href={route('carreras.edit', carrera.id)}>
                                                        <Button variant="secondary">Editar</Button>
                                                    </Link>
                                                    <ConfirmDelete
                                                        description="La carrera se eliminará definitivamente."
                                                        disabled={processing}
                                                        onConfirm={() => destroy(route('carreras.destroy', carrera.id))}
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
                                    <Pagination links={carreras.links} />
                                </div>
                            </>
                        ) : (
                            <p className="text-muted-foreground">Todavía no hay carreras cargadas.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
