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
import { type FormEvent, useEffect, useMemo } from 'react';

interface Carrera {
    id: number;
    nombre: string;
    planesEstudio: { id: number; nombre: string; carrera_id: number }[];
}

interface Materia {
    id: number;
    nombre: string;
    codigo: string;
    descripcion?: string | null;
    tipo: 'obligatoria' | 'optativa' | 'taller';
}

const tipos = [
    { value: 'obligatoria', label: 'Obligatoria' },
    { value: 'optativa', label: 'Optativa' },
    { value: 'taller', label: 'Taller' },
];

export default function Edit({
    materia,
    carreras,
}: {
    materia: Materia & {
        carreras?: { id: number; nombre: string }[];
        planes_estudio?: { id: number; nombre: string; carrera_id: number }[];
        planesEstudio?: { id: number; nombre: string; carrera_id: number }[];
    };
    carreras: Carrera[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Materias',
            href: route('materias.index'),
        },
        {
            title: `Editar ${materia.nombre}`,
            href: route('materias.edit', materia.id),
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        nombre: materia.nombre,
        codigo: materia.codigo,
        descripcion: materia.descripcion ?? '',
        tipo: materia.tipo,
        asignaciones: [] as { carrera_id: number | ''; plan_estudio_id: number | '' }[],
    });

    useEffect(() => {
        const planes = materia.planesEstudio ?? (materia as any).planes_estudio ?? [];
        const carrerasMateria = materia.carreras ?? [];
        const asignaciones: { carrera_id: number | ''; plan_estudio_id: number | '' }[] = [];

        planes.forEach((plan) => {
            asignaciones.push({
                carrera_id: plan.carrera_id,
                plan_estudio_id: plan.id,
            });
        });

        carrerasMateria.forEach((c) => {
            const yaEsta = asignaciones.some((a) => a.carrera_id === c.id);
            if (!yaEsta) {
                asignaciones.push({
                    carrera_id: c.id,
                    plan_estudio_id: '',
                });
            }
        });

        setData((prev) => ({
            ...prev,
            asignaciones,
        }));
    }, [materia, setData]);

    const planesPorCarrera = useMemo(() => {
        const map = new Map<number, { id: number; nombre: string; carrera_id: number }[]>();
        carreras.forEach((c) => {
            const planes = (c as any).planesEstudio ?? (c as any).planes_estudio ?? [];
            map.set(c.id, planes);
        });
        return map;
    }, [carreras]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(route('materias.update', materia.id));
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Materias | Editar ${materia.nombre}`} />
            <div className="flex justify-center px-4 py-6">
            <div className="w-full max-w-2xl space-y-4 rounded-2xl border-2 border-border/70 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 shadow-lg backdrop-blur-sm dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
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
                        <Label htmlFor="codigo">Código</Label>
                        <Input
                            id="codigo"
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
                        Actualizar materia
                    </Button>
                </form>
            </div>
            </div>
        </AppLayout>
    );
}
