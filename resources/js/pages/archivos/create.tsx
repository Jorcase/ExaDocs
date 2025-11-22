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
import { type FormEvent, useMemo, useState } from 'react';

interface Option {
    id: number;
    nombre?: string;
}

interface PlanOption {
    id: number;
    nombre: string;
    carrera_id: number;
    materias?: Option[];
}

interface CarreraOption {
    id: number;
    nombre: string;
    materias?: Option[];
    planesEstudio?: Option[];
    planes_estudio?: Option[];
}

export default function Create({
    carreras,
    tipos,
    estados,
    planes,
}: {
    carreras: CarreraOption[];
    tipos: Option[];
    estados: Option[];
    planes: PlanOption[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Archivos', href: route('archivos.index') },
        { title: 'Crear', href: route('archivos.create') },
    ];

    const [preview, setPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, transform } = useForm({
        carrera_id: '' as number | '',
        materia_id: '' as number | '',
        tipo_archivo_id: '' as number | '',
        plan_estudio_id: '' as number | '',
        estado_archivo_id: '' as number | '',
        titulo: '',
        descripcion: '',
        archivo: null as File | null,
        observaciones_admin: '',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        transform((formData) => ({
            ...formData,
            plan_estudio_id: formData.plan_estudio_id === '' ? null : formData.plan_estudio_id,
        }));
        post(route('archivos.store'), {
            forceFormData: true,
        });
    };

    const planesDeCarrera = useMemo(
        () => planes.filter((p) => p.carrera_id === data.carrera_id),
        [planes, data.carrera_id],
    );

    const materiasDisponibles = useMemo(() => {
        if (data.plan_estudio_id) {
            return planesDeCarrera.find((p) => p.id === data.plan_estudio_id)?.materias ?? [];
        }
        return data.carrera_id
            ? carreras.find((c) => c.id === data.carrera_id)?.materias ?? []
            : [];
    }, [data.carrera_id, data.plan_estudio_id, carreras, planesDeCarrera]);

    const renderSelect = (
        label: string,
        value: number | '',
        onChange: (val: number | '') => void,
        options: Option[],
        error?: string,
        placeholder = 'Seleccioná una opción',
    ) => (
        <div className="space-y-1.5">
            <Label>{label}</Label>
            <Select value={value === '' ? '' : String(value)} onValueChange={(v) => onChange(Number(v))}>
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={opt.id} value={String(opt.id)}>
                            {opt.nombre}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archivos | Crear" />
            <div className="w-full max-w-3xl p-4 space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {renderSelect('Carrera', data.carrera_id, (val) => {
                        setData('carrera_id', val);
                        setData('materia_id', '');
                        setData('plan_estudio_id', '');
                    }, carreras, errors.carrera_id)}
                    {renderSelect(
                        'Plan de estudio',
                        data.plan_estudio_id,
                        (val) => {
                            setData('plan_estudio_id', val);
                            setData('materia_id', '');
                        },
                        planesDeCarrera,
                        errors.plan_estudio_id,
                        'Opcional',
                    )}
                    {renderSelect(
                        'Materia',
                        data.materia_id,
                        (val) => {
                            setData('materia_id', val);
                            if (!data.plan_estudio_id) {
                                const planesConMateria = planesDeCarrera.filter((p) =>
                                    p.materias?.some((m) => m.id === val),
                                );
                                if (planesConMateria.length === 1) {
                                    setData('plan_estudio_id', planesConMateria[0].id);
                                }
                            }
                        },
                        materiasDisponibles,
                        errors.materia_id,
                        data.carrera_id ? 'Seleccioná una materia' : 'Elegí primero una carrera',
                    )}
                    {renderSelect('Tipo de archivo', data.tipo_archivo_id, (val) => setData('tipo_archivo_id', val), tipos, errors.tipo_archivo_id)}
                    {renderSelect('Estado', data.estado_archivo_id, (val) => setData('estado_archivo_id', val), estados, errors.estado_archivo_id)}

                    <div className="space-y-1.5">
                        <Label htmlFor="titulo">Título</Label>
                        <Input
                            id="titulo"
                            value={data.titulo}
                            onChange={(e) => setData('titulo', e.target.value)}
                        />
                        {errors.titulo && <p className="text-sm text-destructive">{errors.titulo}</p>}
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
                        <Label htmlFor="archivo">Archivo</Label>
                        <Input
                            id="archivo"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                            onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                setData('archivo', file);
                                if (file && file.type.startsWith('image/')) {
                                    setPreview(URL.createObjectURL(file));
                                } else {
                                    setPreview(null);
                                }
                            }}
                        />
                        {errors.archivo && (
                            <p className="text-sm text-destructive">{errors.archivo}</p>
                        )}
                        {preview && (
                            <div className="mt-2 rounded border p-2">
                                <p className="text-xs text-muted-foreground mb-1">Previsualización</p>
                                <img src={preview} alt="Preview" className="max-h-48 rounded object-contain" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="observaciones_admin">Observaciones</Label>
                        <Textarea
                            id="observaciones_admin"
                            value={data.observaciones_admin}
                            onChange={(e) => setData('observaciones_admin', e.target.value)}
                        />
                        {errors.observaciones_admin && (
                            <p className="text-sm text-destructive">{errors.observaciones_admin}</p>
                        )}
                    </div>

                    <Button disabled={processing} type="submit">
                        Guardar archivo
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
