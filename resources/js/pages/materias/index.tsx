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

    const handleDelete = (id: number) => {
        if (confirm('¿Seguro que querés eliminar esta materia?')) {
            destroy(route('materias.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Materias | Listado" />
            <div className="m-4 space-y-4">
                <Link href={route('materias.create')}>
                    <Button>Crear materia</Button>
                </Link>

                {materias.data.length > 0 ? (
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
                                        <Button
                                            variant="destructive"
                                            disabled={processing}
                                            onClick={() => handleDelete(materia.id)}
                                        >
                                            Eliminar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-muted-foreground">Todavía no hay materias cargadas.</p>
                )}

                <div className="my-2">
                    <Pagination links={materias.links} />
                </div>
            </div>
        </AppLayout>
    );
}
