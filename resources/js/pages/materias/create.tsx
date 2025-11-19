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
import { type FormEvent, useMemo } from 'react';

interface Carrera {
    id: number;
    nombre: string;
    planesEstudio: { id: number; nombre: string; carrera_id: number }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Materias',
        href: route('materias.index'),
    },
    {
        title: 'Crear',
        href: route('materias.create'),
    },
];

const tipos = [
    { value: 'obligatoria', label: 'Obligatoria' },
    { value: 'optativa', label: 'Optativa' },
    { value: 'taller', label: 'Taller' },
];

export default function Create({ carreras }: { carreras: Carrera[] }) {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        codigo: '',
        descripcion: '',
        tipo: 'obligatoria' as 'obligatoria' | 'optativa' | 'taller',
        asignaciones: [] as { carrera_id: number | ''; plan_estudio_id: number | '' }[],
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('materias.store'));
    };

    const handleAddAsignacion = () => {
        setData('asignaciones', [...data.asignaciones, { carrera_id: '', plan_estudio_id: '' }]);
    };

    const handleRemoveAsignacion = (idx: number) => {
        setData(
            'asignaciones',
            data.asignaciones.filter((_, i) => i !== idx),
        );
    };

    const planesPorCarrera = useMemo(() => {
        const map = new Map<number, { id: number; nombre: string; carrera_id: number }[]>();
        carreras.forEach((c) => {
            const planes = (c as any).planesEstudio ?? (c as any).planes_estudio ?? [];
            map.set(c.id, planes);
        });
        return map;
    }, [carreras]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Materias | Crear" />
            <div className="w-full max-w-3xl p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                            id="nombre"
                            placeholder="Ej. Álgebra I"
                            value={data.nombre}
                            onChange={(e) => setData('nombre', e.target.value)}
                        />
                        {errors.nombre && (
                            <p className="text-sm text-destructive">{errors.nombre}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="codigo">Código</Label>
                        <Input
                            id="codigo"
                            placeholder="Ej. MAT-101"
                            value={data.codigo}
                            onChange={(e) => setData('codigo', e.target.value)}
                        />
                        {errors.codigo && (
                            <p className="text-sm text-destructive">{errors.codigo}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea
                            id="descripcion"
                            placeholder="Descripción breve de la materia"
                            value={data.descripcion}
                            onChange={(e) => setData('descripcion', e.target.value)}
                        />
                        {errors.descripcion && (
                            <p className="text-sm text-destructive">{errors.descripcion}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Tipo</Label>
                        <Select
                            value={data.tipo}
                            onValueChange={(value) =>
                                setData('tipo', value as 'obligatoria' | 'optativa' | 'taller')
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccioná un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {tipos.map((tipo) => (
                                    <SelectItem key={tipo.value} value={tipo.value}>
                                        {tipo.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.tipo && (
                            <p className="text-sm text-destructive">{errors.tipo}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Asignar a carreras / planes</Label>
                            <Button type="button" variant="secondary" onClick={handleAddAsignacion}>
                                Agregar asignación
                            </Button>
                        </div>
                        {data.asignaciones.length === 0 && (
                            <p className="text-sm text-muted-foreground">Aún no agregaste ninguna carrera.</p>
                        )}
                        <div className="space-y-3">
                            {data.asignaciones.map((asig, idx) => (
                                <div key={idx} className="flex flex-col gap-3 rounded border p-3">
                                    <div className="space-y-1.5">
                                        <Label>Carrera</Label>
                                        <Select
                                            value={asig.carrera_id === '' ? '' : String(asig.carrera_id)}
                                            onValueChange={(v) => {
                                                const updated = [...data.asignaciones];
                                                updated[idx] = {
                                                    carrera_id: Number(v),
                                                    plan_estudio_id: '',
                                                };
                                                setData('asignaciones', updated);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccioná una carrera" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {carreras.map((c) => (
                                                    <SelectItem key={c.id} value={String(c.id)}>
                                                        {c.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors[`asignaciones.${idx}.carrera_id` as keyof typeof errors] && (
                                            <p className="text-sm text-destructive">
                                                {errors[`asignaciones.${idx}.carrera_id` as keyof typeof errors]}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Plan de estudio (opcional)</Label>
                                        <Select
                                            value={
                                                asig.plan_estudio_id === '' ? '' : String(asig.plan_estudio_id)
                                            }
                                            onValueChange={(v) => {
                                                const updated = [...data.asignaciones];
                                                updated[idx] = {
                                                    ...updated[idx],
                                                    plan_estudio_id: v === '' ? '' : Number(v),
                                                };
                                                setData('asignaciones', updated);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccioná un plan (opcional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(asig.carrera_id
                                                    ? planesPorCarrera.get(Number(asig.carrera_id)) ?? []
                                                    : []
                                                ).map((plan) => (
                                                    <SelectItem key={plan.id} value={String(plan.id)}>
                                                        {plan.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors[`asignaciones.${idx}.plan_estudio_id` as keyof typeof errors] && (
                                            <p className="text-sm text-destructive">
                                                {errors[`asignaciones.${idx}.plan_estudio_id` as keyof typeof errors]}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleRemoveAsignacion(idx)}
                                        >
                                            Quitar
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button disabled={processing} type="submit">
                        Crear materia
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
