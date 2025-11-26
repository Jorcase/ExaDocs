import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { type FormEvent } from 'react';

interface CarreraOption {
    id: number;
    nombre: string;
}

const estados = [
    { value: 'vigente', label: 'Vigente' },
    { value: 'no_vigente', label: 'No vigente' },
    { value: 'discontinuado', label: 'Discontinuado' },
];

export default function Create({
    carreras,
}: {
    carreras: CarreraOption[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Planes de estudio', href: route('planes-estudio.index') },
        { title: 'Crear', href: route('planes-estudio.create') },
    ];

    const { data, setData, post, processing, errors } = useForm({
        carrera_id: '' as number | '',
        nombre: '',
        anio_plan: new Date().getFullYear(),
        estado: 'vigente' as 'vigente' | 'no_vigente' | 'discontinuado',
        vigente_desde: '',
        vigente_hasta: '',
        descripcion: '',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('planes-estudio.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Planes de estudio | Crear" />
            <div className="flex justify-center px-4 py-6">
            <div className="w-full max-w-2xl space-y-4 rounded-2xl border-2 border-border/70 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 shadow-lg backdrop-blur-sm dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Carrera</Label>
                        <Select
                            value={String(data.carrera_id)}
                            onValueChange={(value) => setData('carrera_id', Number(value))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccioná una carrera" />
                            </SelectTrigger>
                            <SelectContent>
                                {carreras.map((carrera) => (
                                    <SelectItem key={carrera.id} value={String(carrera.id)}>
                                        {carrera.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.carrera_id && (
                            <p className="text-sm text-destructive">{errors.carrera_id}</p>
                        )}
                    </div>

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

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="anio_plan">Año del plan</Label>
                            <Input
                                id="anio_plan"
                                type="number"
                                value={data.anio_plan}
                                onChange={(e) => setData('anio_plan', Number(e.target.value))}
                            />
                            {errors.anio_plan && (
                                <p className="text-sm text-destructive">{errors.anio_plan}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Estado</Label>
                            <Select
                                value={data.estado}
                                onValueChange={(value) =>
                                    setData('estado', value as typeof data.estado)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccioná un estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {estados.map((estado) => (
                                        <SelectItem key={estado.value} value={estado.value}>
                                            {estado.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.estado && (
                                <p className="text-sm text-destructive">{errors.estado}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="vigente_desde">Vigente desde</Label>
                            <Input
                                id="vigente_desde"
                                type="date"
                                value={data.vigente_desde}
                                onChange={(e) => setData('vigente_desde', e.target.value)}
                            />
                            {errors.vigente_desde && (
                                <p className="text-sm text-destructive">
                                    {errors.vigente_desde}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="vigente_hasta">Vigente hasta</Label>
                            <Input
                                id="vigente_hasta"
                                type="date"
                                value={data.vigente_hasta}
                                onChange={(e) => setData('vigente_hasta', e.target.value)}
                            />
                            {errors.vigente_hasta && (
                                <p className="text-sm text-destructive">
                                    {errors.vigente_hasta}
                                </p>
                            )}
                        </div>
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
                        Crear plan
                    </Button>
                </form>
            </div>
            </div>
        </AppLayout>
    );
}
