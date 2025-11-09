import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Url } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Table,TableBody,TableCaption,TableCell,TableHead,TableHeader,TableRow,} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/pagination';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Carreras',
        href: route('carreras.index'),
    },
];

interface Carrera {
    id: number;
    nombre: string;
    codigo: string;
    descripcion?: string | null;
    estado: 'activa' | 'inactiva';
}

interface CarrerasPaginated {
    data: Carrera[];
    links: Url[];
}

export default function Index({ carreras }: { carreras: CarrerasPaginated }) {
    const { processing, delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        if (confirm('¿Seguro que querés eliminar esta carrera?')) {
            destroy(route('carreras.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Carreras | Listado" />
            <div className="m-4 space-y-4">
                <Link href={route('carreras.create')}>
                    <Button>Crear carrera</Button>
                </Link>

                {carreras.data.length > 0 ? (
                    <Table>
                        <TableCaption>Listado de carreras cargadas.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Código</TableHead>
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
                                    <TableCell className="capitalize">{carrera.estado}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Link href={route('carreras.edit', carrera.id)}>
                                            <Button variant="secondary">Editar</Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            disabled={processing}
                                            onClick={() => handleDelete(carrera.id)}
                                        >
                                            Eliminar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-muted-foreground">Todavía no hay carreras cargadas.</p>
                )}

                <div className="my-2">
                    <Pagination links={carreras.links} />
                </div>
            </div>
        </AppLayout>
    );
}
