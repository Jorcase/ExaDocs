import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { type FormEvent } from 'react';

interface TipoArchivo {
    id: number;
    nombre: string;
    descripcion?: string | null;
}

export default function Edit({ tipo }: { tipo: TipoArchivo }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tipos de archivo',
            href: route('tipo-archivos.index'),
        },
        {
            title: `Editar ${tipo.nombre}`,
            href: route('tipo-archivos.edit', tipo.id),
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        nombre: tipo.nombre,
        descripcion: tipo.descripcion ?? '',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(route('tipo-archivos.update', tipo.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tipos de archivo | Editar ${tipo.nombre}`} />
            <div className="w-full max-w-2xl p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                            id="nombre"
                            value={data.nombre}
                            onChange={(e) => setData('nombre', e.target.value)}
                        />
                        {errors.nombre && (
                            <p className="text-sm text-destructive">{errors.nombre}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea
                            id="descripcion"
                            value={data.descripcion}
                            onChange={(e) => setData('descripcion', e.target.value)}
                        />
                        {errors.descripcion && (
                            <p className="text-sm text-destructive">{errors.descripcion}</p>
                        )}
                    </div>

                    <Button disabled={processing} type="submit">
                        Actualizar tipo de archivo
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
