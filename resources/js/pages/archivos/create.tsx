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
import { Search, X, UploadCloud, FileUp, FileText, ArrowLeft } from 'lucide-react';
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
  prefill,
}: {
  carreras: CarreraOption[];
  tipos: Option[];
  estados: Option[];
  planes: PlanOption[];
  can_set_estado: boolean;
  estado_default_id?: number | null;
  prefill?: {
    carrera_id?: number | null;
    plan_estudio_id?: number | null;
    materia_id?: number | null;
  };
}) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Archivos', href: route('archivos.index') },
    { title: 'Subir archivo', href: route('archivos.create') },
  ];

  const [preview, setPreview] = useState<string | null>(null);
  const [carreraSearch, setCarreraSearch] = useState('');
  const [materiaSearch, setMateriaSearch] = useState('');
  const [showCarreraDropdown, setShowCarreraDropdown] = useState(false);
  const [showMateriaDropdown, setShowMateriaDropdown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toNumberOrEmpty = (value: number | string | null | undefined) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? (parsed as number) : ('' as number | '');
  };

  const prefillCarrera = toNumberOrEmpty(prefill?.carrera_id);
  const prefillPlan = toNumberOrEmpty(prefill?.plan_estudio_id);
  const prefillMateria = toNumberOrEmpty(prefill?.materia_id);

  const initialCarrera = useMemo(() => {
    if (prefillPlan !== '') {
      const plan = planes.find((p) => p.id === prefillPlan);
      if (plan) return plan.carrera_id;
    }
    if (prefillCarrera !== '') return prefillCarrera;
    if (prefillMateria !== '') {
      const carreraFromMateria = carreras.find((c) => c.materias?.some((m) => m.id === prefillMateria));
      return carreraFromMateria?.id ?? '';
    }
    return '' as number | '';
  }, [prefillPlan, prefillCarrera, prefillMateria, planes, carreras]);

  const initialPlan = useMemo(() => {
    if (prefillPlan !== '') {
      const plan = planes.find((p) => p.id === prefillPlan);
      if (plan && (initialCarrera === '' || plan.carrera_id === initialCarrera)) {
        return plan.id;
      }
    }
    return '' as number | '';
  }, [prefillPlan, initialCarrera, planes]);

  const initialMateria = useMemo(() => {
    if (prefillMateria === '') return '' as number | '';
    if (prefillPlan !== '') {
      const plan = planes.find((p) => p.id === prefillPlan);
      if (plan?.materias?.some((m) => m.id === prefillMateria)) return prefillMateria;
    }
    if (initialCarrera) {
      const carrera = carreras.find((c) => c.id === initialCarrera);
      if (carrera?.materias?.some((m) => m.id === prefillMateria)) return prefillMateria;
    }
    return '' as number | '';
  }, [prefillMateria, prefillPlan, initialCarrera, planes, carreras]);

  const { data, setData, post, processing, errors, transform } = useForm({
    carrera_id: initialCarrera,
    materia_id: initialMateria,
    tipo_archivo_id: '' as number | '',
    plan_estudio_id: initialPlan,
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

  const selectedCarreraObj = useMemo(
    () => carreras.find((c) => c.id === data.carrera_id),
    [carreras, data.carrera_id],
  );

  const selectedMateriaObj = useMemo(
    () => materiasDisponibles.find((m) => m.id === data.materia_id),
    [materiasDisponibles, data.materia_id],
  );

  const carrerasFiltradas = useMemo(() => {
    const term = carreraSearch.trim().toLowerCase();
    if (!term) return carreras.slice(0, 5);
    return carreras.filter((c) => (c.nombre ?? '').toLowerCase().includes(term));
  }, [carreraSearch, carreras]);

  const materiasFiltradas = useMemo(() => {
    const term = materiaSearch.trim().toLowerCase();
    if (!term) return materiasDisponibles.slice(0, 5);
    return materiasDisponibles.filter((m) => (m.nombre ?? '').toLowerCase().includes(term));
  }, [materiaSearch, materiasDisponibles]);

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
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Archivos | Subir archivo" />
      <div className="mx-auto max-w-5xl w-full px-4 py-8">


        <Card className="border border-border/80 bg-card text-card-foreground shadow-xs overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-8 md:grid-cols-2">
                {/* Left Column: Academic Metadata */}
                <div className="space-y-5">


                  {/* Carrera */}
                  <div className="space-y-1.5 relative">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Carrera</Label>
                    {data.carrera_id ? (
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-primary/20 bg-primary/5 dark:border-sky-500/20 dark:bg-sky-500/5">
                        <span className="text-xs font-semibold text-primary dark:text-sky-400 truncate">
                          {selectedCarreraObj?.nombre}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setData((prev) => ({
                              ...prev,
                              carrera_id: '',
                              plan_estudio_id: '',
                              materia_id: '',
                            }));
                            setCarreraSearch('');
                          }}
                          className="h-6 w-6 rounded-md hover:bg-primary/10 text-primary dark:text-sky-400 shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Input
                          placeholder="Escribí para buscar carrera..."
                          value={carreraSearch}
                          onChange={(e) => {
                            setCarreraSearch(e.target.value);
                            setShowCarreraDropdown(true);
                          }}
                          onFocus={() => setShowCarreraDropdown(true)}
                          onBlur={() => setTimeout(() => setShowCarreraDropdown(false), 250)}
                          className="h-10 pr-9 bg-background border-border"
                          autoComplete="off"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                        {showCarreraDropdown && carrerasFiltradas.length > 0 && (
                          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-auto rounded-md border border-border bg-popover py-1 text-xs shadow-md">
                            {carrerasFiltradas.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                className="flex w-full items-center px-3 py-2.5 text-left hover:bg-muted font-medium text-foreground transition-colors"
                                onMouseDown={() => {
                                  setData((prev) => ({
                                    ...prev,
                                    carrera_id: c.id,
                                    plan_estudio_id: '',
                                    materia_id: '',
                                  }));
                                  setCarreraSearch('');
                                  setShowCarreraDropdown(false);
                                }}
                              >
                                {c.nombre}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {errors.carrera_id && <p className="text-xs text-destructive font-medium">{errors.carrera_id}</p>}
                  </div>

                  {/* Plan de estudio */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Plan de estudio</Label>
                    <select
                      className="w-full h-10 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      value={data.plan_estudio_id}
                      disabled={!data.carrera_id}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setData((prev) => ({
                          ...prev,
                          plan_estudio_id: val,
                          materia_id: '',
                        }));
                      }}
                    >
                      <option value="">Opcional</option>
                      {planesDeCarrera.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                    {errors.plan_estudio_id && (
                      <p className="text-xs text-destructive font-medium">{errors.plan_estudio_id}</p>
                    )}
                  </div>

                  {/* Materia */}
                  <div className="space-y-1.5 relative">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Materia</Label>
                    {data.materia_id ? (
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-primary/20 bg-primary/5 dark:border-sky-500/20 dark:bg-sky-500/5">
                        <span className="text-xs font-semibold text-primary dark:text-sky-400 truncate">
                          {selectedMateriaObj?.nombre}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setData('materia_id', '');
                            setMateriaSearch('');
                          }}
                          className="h-6 w-6 rounded-md hover:bg-primary/10 text-primary dark:text-sky-400 shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Input
                          placeholder={data.carrera_id ? 'Escribí para buscar materia...' : 'Elegí primero una carrera'}
                          value={materiaSearch}
                          disabled={!data.carrera_id}
                          onChange={(e) => {
                            setMateriaSearch(e.target.value);
                            setShowMateriaDropdown(true);
                          }}
                          onFocus={() => setShowMateriaDropdown(true)}
                          onBlur={() => setTimeout(() => setShowMateriaDropdown(false), 250)}
                          className="h-10 pr-9 bg-background border-border disabled:opacity-60"
                          autoComplete="off"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                        {showMateriaDropdown && materiasFiltradas.length > 0 && (
                          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-auto rounded-md border border-border bg-popover py-1 text-xs shadow-md">
                            {materiasFiltradas.map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                className="flex w-full items-center px-3 py-2.5 text-left hover:bg-muted font-medium text-foreground transition-colors"
                                onMouseDown={() => {
                                  setData('materia_id', m.id);
                                  if (!data.plan_estudio_id) {
                                    const planesConMateria = planesDeCarrera.filter((p) =>
                                      p.materias?.some((x) => x.id === m.id),
                                    );
                                    if (planesConMateria.length === 1) {
                                      setData((prev) => ({
                                        ...prev,
                                        materia_id: m.id,
                                        plan_estudio_id: planesConMateria[0].id,
                                      }));
                                    }
                                  }
                                  setMateriaSearch('');
                                  setShowMateriaDropdown(false);
                                }}
                              >
                                {m.nombre}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {errors.materia_id && <p className="text-xs text-destructive font-medium">{errors.materia_id}</p>}
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

                {/* Right Column: Content & File Upload */}
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
                      placeholder='Nombre del archivo...'
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

                  {/* Archivo Drag & Drop */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Archivo</Label>
                    <div
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                        isDragging
                          ? 'border-primary bg-primary/5 dark:border-sky-500 dark:bg-sky-500/5 scale-[1.01]'
                          : 'border-border hover:border-primary/50 hover:bg-muted/30 dark:hover:border-sky-500/50'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          handleFileChange(file);
                        }}
                        className="hidden"
                      />

                      {data.archivo ? (
                        <div className="space-y-3 w-full" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center p-2 rounded-lg bg-primary/10 text-primary dark:bg-sky-500/10 dark:text-sky-400 w-12 h-12 mx-auto">
                            {data.archivo.type.startsWith('image/') ? (
                              <FileUp className="h-6 w-6" />
                            ) : (
                              <FileText className="h-6 w-6" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold truncate max-w-xs mx-auto text-foreground">
                              {data.archivo.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono">
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
                            Quitar archivo
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2 pointer-events-none">
                          <UploadCloud className="h-10 w-10 text-muted-foreground opacity-75 mx-auto" />
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-foreground">Arrastrá tu archivo acá</p>
                            <p className="text-[11px] text-muted-foreground">o hacé clic para buscar en tu dispositivo</p>
                          </div>

                        </div>
                      )}
                    </div>
                    {errors.archivo && <p className="text-xs text-destructive font-medium">{errors.archivo}</p>}

                    {/* Preview (Images) */}
                    {preview && (
                      <div className="mt-3 rounded-lg border border-border p-2 bg-muted/25">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                          Vista previa de la imagen
                        </p>
                        <div className="flex justify-center max-h-48 overflow-hidden rounded border bg-black/5 dark:bg-black/20">
                          <img src={preview} alt="Vista previa" className="max-h-44 object-contain" />
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
                  Guardar archivo
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
