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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tipos de archivo',
        href: route('tipo-archivos.index'),
    },
];

interface TipoArchivo {
    id: number;
    nombre: string;
    descripcion?: string | null;
}

interface TiposPaginated {
    data: TipoArchivo[];
    links: Url[];
}

export default function Index({ tipos }: { tipos: TiposPaginated }) {
    const { processing, delete: destroy } = useForm();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tipos de archivo | Listado" />
            <div className="m-4 space-y-4">
                <Card>
                    <CardContent className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <CardTitle className="text-lg font-semibold">Tipo de archivos</CardTitle>
                            <p className="text-sm text-muted-foreground">Catálogo de formatos permitidos</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Link href={route('tipo-archivos.create')}>
                                <Button>Crear tipo</Button>
                            </Link>
                            <PdfButton href={route('tipo-archivos.report')} label="Descargar PDF" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="space-y-4">
                        {tipos.data.length > 0 ? (
                            <>
                                <Table>
                                    <TableCaption>Listado de tipos de archivo.</TableCaption>
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
                                                    <Link href={route('tipo-archivos.edit', tipo.id)}>
                                                        <Button variant="secondary">Editar</Button>
                                                    </Link>
                                                    <ConfirmDelete
                                                        disabled={processing}
                                                        onConfirm={() =>
                                                            destroy(route('tipo-archivos.destroy', tipo.id))
                                                        }
                                                        description="El tipo de archivo se eliminará definitivamente."
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
                            <p className="text-muted-foreground">Todavía no hay tipos de archivo cargados.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
