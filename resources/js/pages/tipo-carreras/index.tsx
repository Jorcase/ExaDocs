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
            <Head title="Tipos de carrera | Listado" />
            <div className="m-4 space-y-4">
                <ListSection
                    title="Tipos de carrera"
                    description="Lista general de los tipos habilitados"
                    actions={
                        <Link href={route('tipo-carreras.create')}>
                            <Button>Crear tipo</Button>
                        </Link>
                    }
                />

                <Card>
                    <CardContent className="space-y-4">
                        {tipos.data.length > 0 ? (
                            <>
                                <Table>
                                    <TableCaption>Listado de tipos de carrera.</TableCaption>
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
                                                <TableCell>{tipo.nombre}</TableCell>
                                                <TableCell>
                                                    {tipo.descripcion ?? (
                                                        <span className="text-muted-foreground">Sin detalle</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Link href={route('tipo-carreras.edit', tipo.id)}>
                                                        <Button variant="secondary">Editar</Button>
                                                    </Link>
                                                    <ConfirmDelete
                                                        disabled={processing}
                                                        onConfirm={() =>
                                                            destroy(route('tipo-carreras.destroy', tipo.id))
                                                        }
                                                        description="El tipo de carrera se eliminará definitivamente."
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
                                    <Pagination links={tipos.links} />
                                </div>
                            </>
                        ) : (
                            <p className="text-muted-foreground">Todavía no hay tipos cargados.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
