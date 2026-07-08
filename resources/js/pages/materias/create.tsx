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
import { PageHeader } from '@/components/page-header';
import { FormLayout } from '@/components/form-layout';

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
        asignaciones: [] as { 
            carrera_id: number | ''; 
            plan_estudio_id: number | ''; 
            anio_sugerido: number | ''; 
            cuatrimestre: number | '';
        }[],
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('materias.store'));
    };

    const handleAddAsignacion = () => {
        setData('asignaciones', [
            ...data.asignaciones, 
            { carrera_id: '', plan_estudio_id: '', anio_sugerido: '', cuatrimestre: '' }
        ]);
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

    const details = (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                    id="nombre"
                    placeholder="Ej. Álgebra I"
                    value={data.nombre}
                    onChange={(e) => setData('nombre', e.target.value)}
                    className="rounded-lg"
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
                    className="rounded-lg"
                />
                {errors.codigo && (
                    <p className="text-sm text-destructive">{errors.codigo}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                    id="descripcion"
                    placeholder="Descripción breve de la materia, contenidos mínimos..."
                    value={data.descripcion}
                    onChange={(e) => setData('descripcion', e.target.value)}
                    className="rounded-lg min-h-[120px] resize-none"
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
                    <SelectTrigger className="rounded-lg">
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
        </div>
    );

    const sidebar = (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Asignar a Carreras</h2>
                <Button type="button" variant="secondary" onClick={handleAddAsignacion} className="rounded-lg text-sm h-9">
                    Agregar asignación
                </Button>
            </div>

            {data.asignaciones.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-border bg-muted/5 text-center">
                    <p className="text-sm text-muted-foreground font-medium">No has asignado ninguna carrera.</p>
                    <p className="text-sm text-muted-foreground/80 mt-1 max-w-[280px]">Haz clic en "Agregar asignación" para asociar esta materia a un plan curricular.</p>
                </div>
            )}

            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {data.asignaciones.map((asig, idx) => (
                    <div key={idx} className="flex flex-col gap-4 rounded-xl border border-border p-4 bg-muted/10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="font-semibold">Carrera</Label>
                                <Select
                                    value={asig.carrera_id === '' ? '' : String(asig.carrera_id)}
                                    onValueChange={(v) => {
                                        const updated = [...data.asignaciones];
                                        updated[idx] = {
                                            ...updated[idx],
                                            carrera_id: Number(v),
                                            plan_estudio_id: '',
                                        };
                                        setData('asignaciones', updated);
                                    }}
                                >
                                    <SelectTrigger className="rounded-lg">
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
                                <Label className="font-semibold">Plan de estudio (opcional)</Label>
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
                                    <SelectTrigger className="rounded-lg">
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
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="font-semibold">Año Sugerido</Label>
                                <Select
                                    value={asig.anio_sugerido === '' || asig.anio_sugerido === null || asig.anio_sugerido === undefined ? 'none' : String(asig.anio_sugerido)}
                                    onValueChange={(v) => {
                                        const updated = [...data.asignaciones];
                                        updated[idx] = {
                                            ...updated[idx],
                                            anio_sugerido: v === 'none' ? '' : Number(v),
                                        };
                                        setData('asignaciones', updated);
                                    }}
                                >
                                    <SelectTrigger className="rounded-lg">
                                        <SelectValue placeholder="No especificado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No especificado</SelectItem>
                                        {[1, 2, 3, 4, 5].map((anio) => (
                                            <SelectItem key={anio} value={String(anio)}>
                                                {anio}º Año
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors[`asignaciones.${idx}.anio_sugerido` as keyof typeof errors] && (
                                    <p className="text-sm text-destructive">
                                        {errors[`asignaciones.${idx}.anio_sugerido` as keyof typeof errors]}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="font-semibold">Cuatrimestre</Label>
                                <Select
                                    value={asig.cuatrimestre === '' || asig.cuatrimestre === null || asig.cuatrimestre === undefined ? 'none' : String(asig.cuatrimestre)}
                                    onValueChange={(v) => {
                                        const updated = [...data.asignaciones];
                                        updated[idx] = {
                                            ...updated[idx],
                                            cuatrimestre: v === 'none' ? '' : Number(v),
                                        };
                                        setData('asignaciones', updated);
                                    }}
                                >
                                    <SelectTrigger className="rounded-lg">
                                        <SelectValue placeholder="No especificado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No especificado</SelectItem>
                                        <SelectItem value="1">1º Cuatrimestre</SelectItem>
                                        <SelectItem value="2">2º Cuatrimestre</SelectItem>
                                        <SelectItem value="0">Anual</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors[`asignaciones.${idx}.cuatrimestre` as keyof typeof errors] && (
                                    <p className="text-sm text-destructive">
                                        {errors[`asignaciones.${idx}.cuatrimestre` as keyof typeof errors]}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="rounded-lg text-sm"
                                onClick={() => handleRemoveAsignacion(idx)}
                            >
                                Quitar Asignación
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Materias | Crear" />
            <div className="mx-auto max-w-7xl px-4 py-8 space-y-6 animate-in fade-in duration-300">
               
                <FormLayout
                    onSubmit={handleSubmit}
                    processing={processing}
                    cancelHref={route('materias.index')}
                    submitLabel="Crear materia"
                    sidebar={sidebar}
                >
                    {details}
                </FormLayout>
            </div>
        </AppLayout>
    );
}
