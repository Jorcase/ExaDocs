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
        title: 'Estados de archivo',
        href: route('estado-archivos.index'),
    },
    {
        title: 'Crear',
        href: route('estado-archivos.create'),
    },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        descripcion: '',
        es_final: false,
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('estado-archivos.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Estados de archivo | Crear" />
            <div className="w-full max-w-2xl p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                            id="nombre"
                            placeholder="Ej. Aprobado"
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
                            placeholder="Descripción breve del estado"
                            value={data.descripcion}
                            onChange={(e) => setData('descripcion', e.target.value)}
                        />
                        {errors.descripcion && (
                            <p className="text-sm text-destructive">{errors.descripcion}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="es_final"
                            type="checkbox"
                            checked={data.es_final}
                            onChange={(e) => setData('es_final', e.target.checked)}
                        />
                        <Label htmlFor="es_final">Estado final</Label>
                    </div>
                    {errors.es_final && (
                        <p className="text-sm text-destructive">{errors.es_final}</p>
                    )}

                    <Button disabled={processing} type="submit">
                        Crear estado
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
