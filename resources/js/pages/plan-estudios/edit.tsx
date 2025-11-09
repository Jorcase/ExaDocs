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

interface Plan {
    id: number;
    carrera_id: number;
    nombre: string;
    version: string;
    anio_plan: number;
    estado: 'vigente' | 'no_vigente' | 'discontinuado';
    vigente_desde?: string | null;
    vigente_hasta?: string | null;
    descripcion?: string | null;
}

const estados = [
    { value: 'vigente', label: 'Vigente' },
    { value: 'no_vigente', label: 'No vigente' },
    { value: 'discontinuado', label: 'Discontinuado' },
];

export default function Edit({
    plan,
    carreras,
}: {
    plan: Plan;
    carreras: CarreraOption[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Planes de estudio', href: route('planes-estudio.index') },
        { title: `Editar ${plan.nombre}`, href: route('planes-estudio.edit', plan.id) },
    ];

    const { data, setData, put, processing, errors } = useForm({
        carrera_id: plan.carrera_id,
        nombre: plan.nombre,
        version: plan.version,
        anio_plan: plan.anio_plan,
        estado: plan.estado,
        vigente_desde: plan.vigente_desde ?? '',
        vigente_hasta: plan.vigente_hasta ?? '',
        descripcion: plan.descripcion ?? '',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(route('planes-estudio.update', plan.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Planes de estudio | Editar ${plan.nombre}`} />
            <div className="w-full max-w-3xl p-4 space-y-6">
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

                    <div className="space-y-1.5">
                        <Label htmlFor="version">Versión</Label>
                        <Input
                            id="version"
                            value={data.version}
                            onChange={(e) => setData('version', e.target.value)}
                        />
                        {errors.version && (
                            <p className="text-sm text-destructive">{errors.version}</p>
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
                        Actualizar plan
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
