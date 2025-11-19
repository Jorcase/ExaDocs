import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { type FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tipos de carrera',
        href: route('tipo-carreras.index'),
    },
    {
        title: 'Crear',
        href: route('tipo-carreras.create'),
    },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        descripcion: '',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('tipo-carreras.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tipos de carrera | Crear" />
            <div className="w-full max-w-2xl p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                            id="nombre"
                            placeholder="Ej. Pregrado"
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
                            placeholder="Descripción breve del tipo de carrera"
                            value={data.descripcion}
                            onChange={(e) => setData('descripcion', e.target.value)}
                        />
                        {errors.descripcion && (
                            <p className="text-sm text-destructive">{errors.descripcion}</p>
                        )}
                    </div>

                    <Button disabled={processing} type="submit">
                        Crear tipo
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
