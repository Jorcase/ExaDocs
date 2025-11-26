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
    can_set_estado,
    estado_default_id,
}: {
    carreras: CarreraOption[];
    tipos: Option[];
    estados: Option[];
    planes: PlanOption[];
    can_set_estado: boolean;
    estado_default_id?: number | null;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Archivos', href: route('archivos.index') },
        { title: 'Crear', href: route('archivos.create') },
    ];

    const [preview, setPreview] = useState<string | null>(null);
    const [carreraSearch, setCarreraSearch] = useState('');
    const [materiaSearch, setMateriaSearch] = useState('');

    const { data, setData, post, processing, errors, transform } = useForm({
        carrera_id: '' as number | '',
        materia_id: '' as number | '',
        tipo_archivo_id: '' as number | '',
        plan_estudio_id: '' as number | '',
        estado_archivo_id: can_set_estado ? ('' as number | '') : (estado_default_id ?? '' as number | ''),
        titulo: '',
        descripcion: '',
        archivo: null as File | null,
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

    const carrerasFiltradas = useMemo(() => {
        const term = carreraSearch.trim().toLowerCase();
        if (!term) return carreras;
        return carreras.filter((c) => (c.nombre ?? '').toLowerCase().includes(term));
    }, [carreraSearch, carreras]);

    const materiasFiltradas = useMemo(() => {
        const term = materiaSearch.trim().toLowerCase();
        if (!term) return materiasDisponibles;
        return materiasDisponibles.filter((m) => (m.nombre ?? '').toLowerCase().includes(term));
    }, [materiaSearch, materiasDisponibles]);

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
            <div className="flex justify-center px-4 py-6">
                <div className="w-full max-w-2xl space-y-4 rounded-2xl border-2 border-border/70 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 shadow-lg backdrop-blur-sm dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Carrera</Label>
                        <Select
                            value={data.carrera_id === '' ? '' : String(data.carrera_id)}
                            onValueChange={(v) => {
                                const val = Number(v);
                                setData('carrera_id', val);
                                setData('materia_id', '');
                                setData('plan_estudio_id', '');
                                setMateriaSearch('');
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccioná una opción" />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="p-2">
                                    <Input
                                        placeholder="Buscar carrera..."
                                        className="h-8 text-sm"
                                        value={carreraSearch}
                                        onChange={(e) => setCarreraSearch(e.target.value)}
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                </div>
                                {carrerasFiltradas.map((opt) => (
                                    <SelectItem key={opt.id} value={String(opt.id)}>
                                        {opt.nombre}
                                    </SelectItem>
                                ))}
                                {carrerasFiltradas.length === 0 && (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</div>
                                )}
                            </SelectContent>
                        </Select>
                        {errors.carrera_id && <p className="text-sm text-destructive">{errors.carrera_id}</p>}
                    </div>
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
                    <div className="space-y-1.5">
                        <Label>Materia</Label>
                        <Select
                            value={data.materia_id === '' ? '' : String(data.materia_id)}
                            onValueChange={(v) => {
                                const val = Number(v);
                                setData('materia_id', val);
                                if (!data.plan_estudio_id) {
                                    const planesConMateria = planesDeCarrera.filter((p) =>
                                        p.materias?.some((m) => m.id === val),
                                    );
                                    if (planesConMateria.length === 1) {
                                        setData('plan_estudio_id', planesConMateria[0].id);
                                    }
                                }
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={data.carrera_id ? 'Seleccioná una materia' : 'Elegí primero una carrera'} />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="p-2">
                                    <Input
                                        placeholder="Buscar materia..."
                                        className="h-8 text-sm"
                                        value={materiaSearch}
                                        onChange={(e) => setMateriaSearch(e.target.value)}
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                </div>
                                {materiasFiltradas.map((opt) => (
                                    <SelectItem key={opt.id} value={String(opt.id)}>
                                        {opt.nombre}
                                    </SelectItem>
                                ))}
                                {materiasFiltradas.length === 0 && (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</div>
                                )}
                            </SelectContent>
                        </Select>
                        {errors.materia_id && <p className="text-sm text-destructive">{errors.materia_id}</p>}
                    </div>
                    {renderSelect('Tipo de archivo', data.tipo_archivo_id, (val) => setData('tipo_archivo_id', val), tipos, errors.tipo_archivo_id)}
                    {can_set_estado ? (
                        renderSelect('Estado', data.estado_archivo_id, (val) => setData('estado_archivo_id', val), estados, errors.estado_archivo_id)
                    ) : (
                        <input type="hidden" name="estado_archivo_id" value={data.estado_archivo_id ?? ''} />
                    )}

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
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md"
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

                    <Button disabled={processing} type="submit">
                        Guardar archivo
                    </Button>
                </form>
                </div>
            </div>
        </AppLayout>
    );
}
