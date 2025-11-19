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
import PdfButton from '@/components/pdf-button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Materias',
        href: route('materias.index'),
    },
];

interface Materia {
    id: number;
    nombre: string;
    codigo: string;
    descripcion?: string | null;
    tipo: 'obligatoria' | 'optativa' | 'taller';
}

interface MateriasPaginated {
    data: Materia[];
    links: Url[];
}

export default function Index({ materias }: { materias: MateriasPaginated }) {
    const { processing, delete: destroy } = useForm();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Materias | Listado" />
            <div className="m-4 space-y-4">
                <Card>
                    <CardContent className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <CardTitle className="text-lg font-semibold">Materias</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Gestiona las materias y los tipos de curso disponibles.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link href={route('materias.create')}>
                                <Button>Crear materia</Button>
                            </Link>
                            <PdfButton href={route('materias.report')} label="Exportar PDF" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-4">
                        {materias.data.length > 0 ? (
                            <>
                                <Table>
                                    <TableCaption>Listado de materias cargadas.</TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">ID</TableHead>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Código</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {materias.data.map((materia) => (
                                            <TableRow key={materia.id}>
                                                <TableCell className="font-medium">{materia.id}</TableCell>
                                                <TableCell>
                                                    <p className="font-semibold">{materia.nombre}</p>
                                                    {materia.descripcion && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {materia.descripcion}
                                                        </p>
                                                    )}
                                                </TableCell>
                                                <TableCell>{materia.codigo}</TableCell>
                                                <TableCell className="capitalize">{materia.tipo}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Link href={route('materias.edit', materia.id)}>
                                                        <Button variant="secondary">Editar</Button>
                                                    </Link>
                                                    <ConfirmDelete
                                                        disabled={processing}
                                                        onConfirm={() => destroy(route('materias.destroy', materia.id))}
                                                        description="La materia se eliminará definitivamente."
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
                                    <Pagination links={materias.links} />
                                </div>
                            </>
                        ) : (
                            <p className="text-muted-foreground">Todavía no hay materias cargadas.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
