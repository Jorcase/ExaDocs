import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { type FormEvent } from 'react';
import { FormLayout } from '@/components/form-layout';

interface EstadoArchivo {
    id: number;
    nombre: string;
    descripcion?: string | null;
    es_final: boolean;
}

export default function Edit({ estado }: { estado: EstadoArchivo }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Estados de archivo',
            href: route('estado-archivos.index'),
        },
        {
            title: `Editar ${estado.nombre}`,
            href: route('estado-archivos.edit', estado.id),
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        nombre: estado.nombre,
        descripcion: estado.descripcion ?? '',
        es_final: estado.es_final,
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(route('estado-archivos.update', estado.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Estados de archivo | Editar ${estado.nombre}`} />
            <div className="mx-auto max-w-7xl px-4 py-8 animate-in fade-in duration-300">
                <FormLayout
                    onSubmit={handleSubmit}
                    processing={processing}
                    cancelHref={route('estado-archivos.index')}
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

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                id="es_final"
                                type="checkbox"
                                checked={data.es_final}
                                onChange={(e) => setData('es_final', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-neutral-800 dark:bg-neutral-950"
                            />
                            <Label htmlFor="es_final" className="cursor-pointer font-medium">Estado final</Label>
                        </div>
                        {errors.es_final && (
                            <p className="text-sm text-destructive">{errors.es_final}</p>
                        )}
                    </div>
                </FormLayout>
            </div>
        </AppLayout>
    );
}
