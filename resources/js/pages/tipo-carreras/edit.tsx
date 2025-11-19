import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { type FormEvent } from 'react';

interface TipoCarrera {
    id: number;
    nombre: string;
    descripcion?: string | null;
}

export default function Edit({ tipoCarrera }: { tipoCarrera: TipoCarrera }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tipos de carrera',
            href: route('tipo-carreras.index'),
        },
        {
            title: `Editar ${tipoCarrera.nombre}`,
            href: route('tipo-carreras.edit', tipoCarrera.id),
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        nombre: tipoCarrera.nombre,
        descripcion: tipoCarrera.descripcion ?? '',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(route('tipo-carreras.update', tipoCarrera.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tipos de carrera | Editar ${tipoCarrera.nombre}`} />
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
                        Actualizar tipo
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
