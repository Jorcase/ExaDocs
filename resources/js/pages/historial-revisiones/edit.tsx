import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { type FormEvent, useMemo, useState } from 'react';
import { FormLayout } from '@/components/form-layout';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Option {
  id: number;
  titulo?: string;
  title?: string;
  name?: string;
  nombre?: string;
}

interface ArchivoOption extends Option {
  estado?: { nombre: string } | null;
}

interface Revision {
  id: number;
  archivo_id: number;
  revisor_id: number;
  estado_previo: string;
  estado_nuevo: string;
  comentario?: string | null;
}

export default function Edit({
  revision,
  archivos,
  usuarios,
  estados,
}: {
  revision: Revision;
  archivos: ArchivoOption[];
  usuarios: Option[];
  estados: Option[];
}) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Historial de revisiones', href: route('historial-revisiones.index') },
    { title: `Editar #${revision.id}`, href: route('historial-revisiones.edit', revision.id) },
  ];

  const { data, setData, put, processing, errors } = useForm({
    archivo_id: revision.archivo_id,
    revisor_id: revision.revisor_id,
    estado_previo: revision.estado_previo,
    estado_nuevo: revision.estado_nuevo,
    estado_nuevo_id: revision.estado_nuevo_id ?? '',
    comentario: revision.comentario ?? '',
  });

  const [archivoSearch, setArchivoSearch] = useState('');
  const [showArchivoDropdown, setShowArchivoDropdown] = useState(false);

  const selectedArchivoObj = useMemo(() => archivos.find((a) => a.id === data.archivo_id), [archivos, data.archivo_id]);

  const archivosFiltrados = useMemo(() => {
    const term = archivoSearch.trim().toLowerCase();
    if (!term) return archivos;
    return archivos.filter((a) =>
      (a.titulo ?? a.title ?? '').toLowerCase().includes(term)
    );
  }, [archivoSearch, archivos]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    put(route('historial-revisiones.update', revision.id));
  };

  const renderSelectField = (
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
        <SelectTrigger className="rounded-lg">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.id} value={String(opt.id)}>
              {opt.titulo ?? opt.title ?? opt.name ?? opt.id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Editar revisión #${revision.id}`} />
      <div className="mx-auto max-w-7xl px-4 py-8 animate-in fade-in duration-300">
        <FormLayout
          onSubmit={handleSubmit}
          processing={processing}
          cancelHref={route('historial-revisiones.index')}
          submitLabel="Guardar cambios"
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            {/* Row 1: Archivo & Revisor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 relative">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Archivo</Label>
                {data.archivo_id ? (
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-primary/20 bg-primary/5 dark:border-sky-500/20 dark:bg-sky-500/5">
                    <span className="text-xs font-semibold text-primary dark:text-sky-400 truncate">
                      {selectedArchivoObj?.titulo ?? selectedArchivoObj?.title ?? selectedArchivoObj?.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          archivo_id: '',
                          estado_previo: '',
                        }));
                        setArchivoSearch('');
                      }}
                      className="h-6 w-6 rounded-md hover:bg-primary/10 text-primary dark:text-sky-400 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      placeholder="Escribí para buscar archivo..."
                      value={archivoSearch}
                      onChange={(e) => {
                        setArchivoSearch(e.target.value);
                        setShowArchivoDropdown(true);
                      }}
                      onFocus={() => setShowArchivoDropdown(true)}
                      onBlur={() => setTimeout(() => setShowArchivoDropdown(false), 250)}
                      className="h-10 pr-9 bg-background border-border"
                      autoComplete="off"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                    {showArchivoDropdown && archivosFiltrados.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-auto rounded-md border border-border bg-popover py-1 text-xs shadow-md animate-in fade-in slide-in-from-top-1 duration-150">
                        {!archivoSearch.trim() && (
                          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/40 border-b border-border/40 mb-1 sticky top-0">
                            Sugerencias (Archivos Pendientes)
                          </div>
                        )}
                        {archivosFiltrados.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            className="flex w-full items-center px-3 py-2.5 text-left hover:bg-muted font-medium text-foreground transition-colors"
                            onMouseDown={() => {
                              setData((prev) => ({
                                ...prev,
                                archivo_id: a.id,
                                estado_previo: a.estado?.nombre ?? 'Sin estado',
                              }));
                              setArchivoSearch('');
                              setShowArchivoDropdown(false);
                            }}
                          >
                            {a.titulo ?? a.title ?? a.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {errors.archivo_id && <p className="text-xs text-destructive font-medium">{errors.archivo_id}</p>}
              </div>

              {renderSelectField('Revisor', data.revisor_id, (val) => setData('revisor_id', val), usuarios, errors.revisor_id)}
            </div>

            {/* Row 2: Estado Previo & Estado Nuevo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="estado_previo">Estado previo</Label>
                <Input
                  id="estado_previo"
                  value={data.estado_previo}
                  readOnly
                  className="rounded-lg bg-muted text-muted-foreground select-none"
                />
                {errors.estado_previo && <p className="text-sm text-destructive">{errors.estado_previo}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Estado nuevo</Label>
                <Select
                  value={data.estado_nuevo_id === '' ? '' : String(data.estado_nuevo_id)}
                  onValueChange={(v) => {
                    const id = Number(v);
                    setData('estado_nuevo_id', id);
                    const est = estados.find((e) => e.id === id);
                    setData('estado_nuevo', est?.nombre ?? est?.titulo ?? '');
                  }}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Seleccioná un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((est) => (
                      <SelectItem key={est.id} value={String(est.id)}>
                        {est.nombre ?? est.titulo ?? est.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.estado_nuevo_id && <p className="text-sm text-destructive">{errors.estado_nuevo_id}</p>}
              </div>
            </div>

            {/* Row 3: Comentario */}
            <div className="space-y-1.5">
              <Label htmlFor="comentario">Comentario</Label>
              <Textarea
                id="comentario"
                value={data.comentario}
                onChange={(e) => setData('comentario', e.target.value)}
                className="rounded-lg resize-none min-h-[120px]"
              />
              {errors.comentario && <p className="text-sm text-destructive">{errors.comentario}</p>}
            </div>
          </div>
        </FormLayout>
      </div>
    </AppLayout>
  );
}
