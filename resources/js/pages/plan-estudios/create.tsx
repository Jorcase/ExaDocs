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
import { FormLayout } from '@/components/form-layout';

interface CarreraOption {
    id: number;
    nombre: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Planes de estudio', href: route('planes-estudio.index') },
    { title: 'Crear', href: route('planes-estudio.create') },
];

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
    const { data, setData, post, processing, errors } = useForm({
        carrera_id: '' as number | '',
        nombre: '',
        anio_plan: new Date().getFullYear(),
        estado: 'vigente' as 'vigente' | 'no_vigente' | 'discontinuado',
        vigente_desde: '',
        vigente_hasta: '',
        optativas_requeridas: 0,
        descripcion: '',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('planes-estudio.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Planes de estudio | Crear" />
            <div className="mx-auto max-w-7xl px-4 py-8 animate-in fade-in duration-300">
                <FormLayout
                    onSubmit={handleSubmit}
                    processing={processing}
                    cancelHref={route('planes-estudio.index')}
                    submitLabel="Crear plan"
                    maxWidth="max-w-4xl"
                >
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Carrera</Label>
                            <Select
                                value={String(data.carrera_id)}
                                onValueChange={(value) => setData('carrera_id', Number(value))}
                            >
                                <SelectTrigger className="rounded-lg">
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
                                className="rounded-lg"
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
                                    className="rounded-lg"
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
                                    <SelectTrigger className="rounded-lg">
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
                                    className="rounded-lg"
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
                                    className="rounded-lg"
                                />
                                {errors.vigente_hasta && (
                                    <p className="text-sm text-destructive">
                                        {errors.vigente_hasta}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="optativas_requeridas">Materias optativas requeridas</Label>
                            <Input
                                id="optativas_requeridas"
                                type="number"
                                min={0}
                                value={data.optativas_requeridas}
                                onChange={(e) => setData('optativas_requeridas', Number(e.target.value))}
                                className="rounded-lg"
                            />
                            {errors.optativas_requeridas && (
                                <p className="text-sm text-destructive">{errors.optativas_requeridas}</p>
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
