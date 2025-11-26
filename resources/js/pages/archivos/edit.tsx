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
    publicado_en?: string | null;
}

export default function Edit({
    archivo,
    carreras,
    tipos,
    estados,
    planes,
    can_set_estado,
    can_replace_file,
    is_aprobado,
}: {
    archivo: Archivo;
    carreras: { id: number; nombre: string; materias?: Option[]; planesEstudio?: Option[]; planes_estudio?: Option[] }[];
    tipos: Option[];
    estados: Option[];
    planes: PlanOption[];
    can_set_estado: boolean;
    can_replace_file: boolean;
    is_aprobado: boolean;
}) {
    const initialCarreraId = useMemo(() => {
        if (archivo.plan_estudio_id) {
            const plan = planes.find((p) => p.id === archivo.plan_estudio_id);
            if (plan) return plan.carrera_id;
        }
        if (archivo.carrera_id) {
            return archivo.carrera_id;
        }
        const carreraFromMateria = carreras.find((c) => c.materias?.some((m) => m.id === archivo.materia_id));
        return carreraFromMateria?.id ?? '';
    }, [archivo.carrera_id, archivo.materia_id, archivo.plan_estudio_id, carreras, planes]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Archivos', href: route('archivos.index') },
        { title: `Editar ${archivo.titulo}`, href: route('archivos.edit', archivo.id) },
    ];

    const [preview, setPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, transform } = useForm({
        _method: 'put',
        carrera_id: initialCarreraId ?? '',
        materia_id: archivo.materia_id,
        tipo_archivo_id: archivo.tipo_archivo_id,
        plan_estudio_id: archivo.plan_estudio_id ?? '',
        estado_archivo_id: archivo.estado_archivo_id,
        titulo: archivo.titulo,
        descripcion: archivo.descripcion ?? '',
        archivo: null as File | null,
    });

    const carreraSeleccionada = useMemo(
        () => carreras.find((c) => c.id === data.carrera_id),
        [carreras, data.carrera_id],
    );
    const materiaSeleccionada = useMemo(
        () => carreraSeleccionada?.materias?.find((m) => m.id === data.materia_id),
        [carreraSeleccionada, data.materia_id],
    );
    const planSeleccionado = useMemo(
        () => planes.find((p) => p.id === data.plan_estudio_id),
        [planes, data.plan_estudio_id],
    );

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        transform((formData) => {
            const payload = {
                ...formData,
                plan_estudio_id: formData.plan_estudio_id === '' ? null : formData.plan_estudio_id,
            };
            if (!formData.archivo) {
                delete (payload as { archivo?: File | null }).archivo;
            }
            return payload;
        });
        post(route('archivos.update', archivo.id), {
            forceFormData: true,
        });
    };

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

    const fileLocked = is_aprobado && !can_replace_file;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Archivos | Editar ${archivo.titulo}`} />
            <div className="flex justify-center px-4 py-6">
            <div className="w-full max-w-2xl space-y-4 rounded-2xl border-2 border-border/70 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 shadow-lg backdrop-blur-sm dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Carrera</Label>
                        <div className="rounded border px-3 py-2 text-sm bg-muted/30">
                            {carreraSeleccionada?.nombre ?? 'Sin carrera'}
                        </div>
                        <input type="hidden" name="carrera_id" value={data.carrera_id ?? ''} />
                        {errors.carrera_id && <p className="text-sm text-destructive">{errors.carrera_id}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Materia</Label>
                        <div className="rounded border px-3 py-2 text-sm bg-muted/30">
                            {materiaSeleccionada?.nombre ?? 'Sin materia'}
                        </div>
                        <input type="hidden" name="materia_id" value={data.materia_id ?? ''} />
                        {errors.materia_id && <p className="text-sm text-destructive">{errors.materia_id}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Plan de estudio</Label>
                        <div className="rounded border px-3 py-2 text-sm bg-muted/30">
                            {planSeleccionado?.nombre ?? 'Sin plan asociado'}
                        </div>
                        <input type="hidden" name="plan_estudio_id" value={data.plan_estudio_id ?? ''} />
                        {errors.plan_estudio_id && <p className="text-sm text-destructive">{errors.plan_estudio_id}</p>}
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
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md"
                            disabled={fileLocked}
                            onChange={(e) => {
                                if (fileLocked) return;
                                const file = e.target.files?.[0] ?? null;
                                setData('archivo', file);
                                if (file && file.type.startsWith('image/')) {
                                    setPreview(URL.createObjectURL(file));
                                } else {
                                    setPreview(null);
                                }
                            }}
                        />
                        {fileLocked && (
                            <p className="text-sm text-muted-foreground">
                                No puedes reemplazar el archivo porque está aprobado.
                            </p>
                        )}
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

                    <Button disabled={processing} type="submit">
                        Actualizar archivo
                    </Button>
                </form>
                </div>
            </div>
        </AppLayout>
    );
}
