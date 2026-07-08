import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { type FormEvent } from 'react';
import { FormLayout } from '@/components/form-layout';

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
            <div className="mx-auto max-w-7xl px-4 py-8 animate-in fade-in duration-300">
                <FormLayout
                    onSubmit={handleSubmit}
                    processing={processing}
                    cancelHref={route('tipo-archivos.index')}
                    submitLabel="Guardar cambios"
                >
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input
                                id="nombre"
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                                className="rounded-lg"
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
                                className="rounded-lg resize-none min-h-[100px]"
                            />
                            {errors.descripcion && (
                                <p className="text-sm text-destructive">{errors.descripcion}</p>
                            )}
                        </div>
                    </div>
                </FormLayout>
            </div>
        </AppLayout>
    );
}
