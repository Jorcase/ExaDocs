import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { type FormEvent } from 'react';
import { FormLayout } from '@/components/form-layout';

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
            <div className="mx-auto max-w-7xl px-4 py-8 animate-in fade-in duration-300">
                <FormLayout
                    onSubmit={handleSubmit}
                    processing={processing}
                    cancelHref={route('estado-archivos.index')}
                    submitLabel="Crear estado"
                >
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input
                                id="nombre"
                                placeholder="Ej. Aprobado"
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
                                placeholder="Descripción breve del estado"
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
