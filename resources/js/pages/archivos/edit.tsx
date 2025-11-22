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

interface Archivo {
    id: number;
    carrera_id?: number | null;
    materia_id: number;
    tipo_archivo_id: number;
    plan_estudio_id?: number | null;
    estado_archivo_id: number;
    titulo: string;
    descripcion?: string | null;
    file_path: string;
    peso_bytes?: number | null;
    observaciones_admin?: string | null;
    publicado_en?: string | null;
}

export default function Edit({
    archivo,
    carreras,
    tipos,
    estados,
    planes,
}: {
    archivo: Archivo;
    carreras: { id: number; nombre: string; materias?: Option[]; planesEstudio?: Option[]; planes_estudio?: Option[] }[];
    tipos: Option[];
    estados: Option[];
    planes: PlanOption[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Archivos', href: route('archivos.index') },
        { title: `Editar ${archivo.titulo}`, href: route('archivos.edit', archivo.id) },
    ];

    const [preview, setPreview] = useState<string | null>(null);

    const { data, setData, put, processing, errors, transform } = useForm({
        carrera_id: archivo.carrera_id ?? '',
        materia_id: archivo.materia_id,
        tipo_archivo_id: archivo.tipo_archivo_id,
        plan_estudio_id: archivo.plan_estudio_id ?? '',
        estado_archivo_id: archivo.estado_archivo_id,
        titulo: archivo.titulo,
        descripcion: archivo.descripcion ?? '',
        archivo: null as File | null,
        observaciones_admin: archivo.observaciones_admin ?? '',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        transform((formData) => {
            const payload = { ...formData };
            if (!payload.archivo) {
                delete (payload as { archivo?: File | null }).archivo;
            }
            payload.plan_estudio_id = payload.plan_estudio_id === '' ? null : payload.plan_estudio_id;
            return payload;
        });
        put(route('archivos.update', archivo.id), {
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
            <Head title={`Archivos | Editar ${archivo.titulo}`} />
            <div className="w-full max-w-3xl p-4 space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {renderSelect('Carrera', data.carrera_id, (val) => {
                        setData('carrera_id', val);
                        setData('materia_id', '');
                        setData('plan_estudio_id', '');
                    }, carreras, errors.carrera_id)}
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
                        <Label>Archivo actual</Label>
                        <div className="rounded border p-3 text-sm space-y-2">
                            <p className="font-medium break-all">{archivo.titulo}</p>
                            {archivo.file_path && archivo.file_path.match(/\.(png|jpg|jpeg|gif|webp)$/i) && (
                                <img
                                    src={`/storage/${archivo.file_path}`}
                                    alt={archivo.titulo}
                                    className="max-h-48 rounded object-contain"
                                />
                            )}
                            {archivo.peso_bytes && (
                                <p className="text-muted-foreground">
                                    Peso: {(archivo.peso_bytes / 1024 / 1024).toFixed(2)} MB
                                </p>
                            )}
                            <a
                                className="text-primary underline"
                                href={`/storage/${archivo.file_path}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Ver / descargar
                            </a>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="archivo">Reemplazar archivo (opcional)</Label>
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
                                <p className="text-xs text-muted-foreground mb-1">Previsualización (nuevo)</p>
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
                        Actualizar archivo
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
