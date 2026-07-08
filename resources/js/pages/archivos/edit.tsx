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
import { Head, useForm, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { type FormEvent, useMemo, useState, useRef } from 'react';
import { ArrowLeft, FileText, FileUp, UploadCloud, Eye, Download, Info, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (file: File | null) => {
    setData('archivo', file);
    if (file && file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (fileLocked) return;
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (fileLocked) return;
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFileChange(file);
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
      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Select value={value === '' ? '' : String(value)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className="h-10 bg-background border-border">
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
      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  );

  const fileLocked = is_aprobado && !can_replace_file;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Archivos | Editar ${archivo.titulo}`} />
      <div className="mx-auto max-w-5xl w-full px-4 py-8">

        <Card className="border border-border/80 bg-card text-card-foreground shadow-xs overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-8 md:grid-cols-2">
                {/* Left Column: Locked Academic Context */}
                <div className="space-y-5">


                  {/* Carrera */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Carrera</Label>
                    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs font-medium text-foreground/80">
                      {carreraSeleccionada?.nombre ?? 'Sin carrera'}
                    </div>
                    <input type="hidden" name="carrera_id" value={data.carrera_id ?? ''} />
                  </div>

                  {/* Plan de estudio */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Plan de estudio</Label>
                    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs font-medium text-foreground/80">
                      {planSeleccionado?.nombre ?? 'Sin plan asociado'}
                    </div>
                    <input type="hidden" name="plan_estudio_id" value={data.plan_estudio_id ?? ''} />
                  </div>

                  {/* Materia */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Materia</Label>
                    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs font-medium text-foreground/80">
                      {materiaSeleccionada?.nombre ?? 'Sin materia'}
                    </div>
                    <input type="hidden" name="materia_id" value={data.materia_id ?? ''} />
                  </div>

                  {/* Tipo de archivo */}
                  {renderSelect('Tipo de archivo', data.tipo_archivo_id, (val) => setData('tipo_archivo_id', val), tipos, errors.tipo_archivo_id)}

                  {/* Estado (Solo moderadores) */}
                  {can_set_estado ? (
                    renderSelect('Estado', data.estado_archivo_id, (val) => setData('estado_archivo_id', val), estados, errors.estado_archivo_id)
                  ) : (
                    <input type="hidden" name="estado_archivo_id" value={data.estado_archivo_id ?? ''} />
                  )}
                </div>

                {/* Right Column: Title, Description, and File Replacement */}
                <div className="space-y-5">


                  {/* Título */}
                  <div className="space-y-1.5">
                    <Label htmlFor="titulo" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Título
                    </Label>
                    <Input
                      id="titulo"
                      value={data.titulo}
                      onChange={(e) => setData('titulo', e.target.value)}
                      className="h-10 bg-background border-border"
                    />
                    {errors.titulo && <p className="text-xs text-destructive font-medium">{errors.titulo}</p>}
                  </div>

                  {/* Descripción */}
                  <div className="space-y-1.5">
                    <Label htmlFor="descripcion" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Descripción (Opcional)
                    </Label>
                    <Textarea
                      id="descripcion"
                      value={data.descripcion}
                      onChange={(e) => setData('descripcion', e.target.value)}
                      placeholder="Detalles sobre el contenido del archivo..."
                      className="min-h-24 bg-background border-border resize-none"
                    />
                    {errors.descripcion && (
                      <p className="text-xs text-destructive font-medium">{errors.descripcion}</p>
                    )}
                  </div>

                  {/* Archivo Actual Info */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Archivo actual</Label>
                    <div className="rounded-lg border border-border p-3.5 bg-muted/10 space-y-3">
                      <div className="flex items-start gap-3">
                        <FileText className="h-8 w-8 text-primary/80 dark:text-sky-400/80 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <p className="text-xs font-semibold text-foreground truncate">{archivo.titulo}</p>
                          {archivo.peso_bytes && (
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {(archivo.peso_bytes / 1024 / 1024).toFixed(2)} MB
                            </p>
                          )}
                        </div>
                      </div>

                      {archivo.file_path && archivo.file_path.match(/\.(png|jpg|jpeg|gif|webp)$/i) && (
                        <div className="flex justify-center max-h-36 overflow-hidden rounded border bg-black/5 dark:bg-black/20 p-1">
                          <img
                            src={`/storage/${archivo.file_path}`}
                            alt={archivo.titulo}
                            className="max-h-32 object-contain"
                          />
                        </div>
                      )}

                      <div className="flex gap-2 pt-1">
                        <a
                          className="inline-flex items-center gap-1.5 text-xs text-primary dark:text-sky-400 font-semibold hover:underline"
                          href={`/storage/${archivo.file_path}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Eye className="h-3.5 w-3.5" /> Ver / Descargar
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Reemplazar Archivo Drag & Drop */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Reemplazar archivo (opcional)
                    </Label>
                    <div
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                      onClick={() => !fileLocked && fileInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-300 ${
                        fileLocked
                          ? 'border-border/60 bg-muted/15 cursor-not-allowed opacity-75'
                          : isDragging
                          ? 'border-primary bg-primary/5 dark:border-sky-500 dark:bg-sky-500/5 scale-[1.01]'
                          : 'border-border hover:border-primary/50 hover:bg-muted/30 dark:hover:border-sky-500/50'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md"
                        disabled={fileLocked}
                        onChange={(e) => {
                          if (fileLocked) return;
                          const file = e.target.files?.[0] ?? null;
                          handleFileChange(file);
                        }}
                        className="hidden"
                      />

                      {data.archivo ? (
                        <div className="space-y-3 w-full" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center p-2 rounded-lg bg-primary/10 text-primary dark:bg-sky-500/10 dark:text-sky-400 w-10 h-10 mx-auto">
                            <FileUp className="h-5 w-5" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold truncate max-w-xs mx-auto text-foreground">
                              {data.archivo.name}
                            </p>
                            <p className="text-[9px] text-muted-foreground font-mono">
                              {(data.archivo.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleFileChange(null)}
                            className="h-8 text-xs text-destructive hover:bg-destructive/5 hover:text-destructive shrink-0"
                          >
                            Quitar reemplazo
                          </Button>
                        </div>
                      ) : fileLocked ? (
                        <div className="space-y-1.5 py-2">
                          <Info className="h-6 w-6 text-muted-foreground mx-auto" />
                          <p className="text-xs font-semibold text-muted-foreground">Archivo bloqueado</p>
                          <p className="text-[10px] text-muted-foreground max-w-xs mx-auto">
                            No puedes reemplazar el archivo porque ya se encuentra aprobado.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5 pointer-events-none">
                          <UploadCloud className="h-8 w-8 text-muted-foreground opacity-75 mx-auto" />
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-foreground">Arrastrá un archivo nuevo acá</p>
                            <p className="text-[10px] text-muted-foreground">o hacé clic para reemplazar el archivo actual</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.archivo && <p className="text-xs text-destructive font-medium">{errors.archivo}</p>}

                    {/* Preview (Images) */}
                    {preview && (
                      <div className="mt-3 rounded-lg border border-border p-2 bg-muted/25">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                          Vista previa (nuevo)
                        </p>
                        <div className="flex justify-center max-h-40 overflow-hidden rounded border bg-black/5 dark:bg-black/20">
                          <img src={preview} alt="Vista previa" className="max-h-36 object-contain" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-center gap-3 pt-4 border-t border-border/40">
                <Link href={route('archivos.index')}>
                  <Button type="button" variant="outline" className="h-10 px-6 font-semibold">
                    Cancelar
                  </Button>
                </Link>
                <Button
                  disabled={processing}
                  type="submit"
                  className="h-10 px-6 bg-[#0061a5] hover:bg-[#004b80] text-white shadow-sm dark:bg-[#9fcaff] dark:text-neutral-950 dark:hover:bg-sky-400 font-semibold"
                >
                  Actualizar archivo
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
