import { Button } from '@/components/ui/button';
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
import { Head, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { type FormEvent, useMemo, useState } from 'react';
import { type SharedData } from '@/types';

interface Option {
  id: number;
  title?: string;
  titulo?: string;
  name?: string;
  nombre?: string;
}

interface ArchivoOption extends Option {
  estado?: { nombre: string } | null;
}

interface PageProps extends SharedData {
  auth: { user: { id: number; name: string } };
}

export default function Create({
  archivos,
  usuarios,
  estados,
  prefill,
}: {
  archivos: ArchivoOption[];
  usuarios: Option[];
  estados: Option[];
  prefill?: {
    archivo_id?: number | null;
    estado_previo?: string | null;
    estado_nuevo_id?: number | null;
  };
}) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Historial de revisiones', href: route('historial-revisiones.index') },
    { title: 'Registrar', href: route('historial-revisiones.create') },
  ];

  const initialArchivoId = prefill?.archivo_id ?? '';
  const archivoInicial = initialArchivoId ? archivos.find((a) => a.id === initialArchivoId) : null;
  const initialEstadoPrevio = prefill?.estado_previo ?? archivoInicial?.estado?.nombre ?? '';
  const initialEstadoNuevoId = prefill?.estado_nuevo_id ?? archivoInicial?.estado_archivo_id ?? '';
  const initialEstadoNuevoNombre =
    initialEstadoNuevoId !== '' ? estados.find((e) => e.id === initialEstadoNuevoId)?.nombre ?? '' : '';
  const { auth } = usePage<PageProps>().props;
  const [archivoSearch, setArchivoSearch] = useState('');

  const { data, setData, post, processing, errors } = useForm({
    archivo_id: initialArchivoId as number | '',
    revisor_id: auth?.user?.id ?? ('' as number | ''),
    estado_previo: initialEstadoPrevio,
    estado_nuevo: initialEstadoNuevoNombre,
    estado_nuevo_id: initialEstadoNuevoId as number | '',
    comentario: '',
  });

  const archivosFiltrados = useMemo(() => {
    const term = archivoSearch.trim().toLowerCase();
    if (!term) return archivos;
    return archivos.filter((a) =>
      (a.titulo ?? a.title ?? '').toLowerCase().includes(term)
    );
  }, [archivoSearch, archivos]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post(route('historial-revisiones.store'));
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
      <Head title="Registrar revisión" />
      <div className="flex justify-center px-4 py-6">
        <div className="w-full max-w-2xl space-y-4 rounded-2xl border-2 border-border/70 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-6 shadow-lg backdrop-blur-sm dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Archivo</Label>
            <Select
              value={data.archivo_id === '' ? '' : String(data.archivo_id)}
              onValueChange={(v) => {
                const val = Number(v);
                setData('archivo_id', val);
                const archivo = archivos.find((a) => a.id === val);
                setData('estado_previo', archivo?.estado?.nombre ?? '');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná un archivo" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="Buscar archivo..."
                    className="h-8 text-sm"
                    value={archivoSearch}
                    onChange={(e) => setArchivoSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
                {archivosFiltrados.map((opt) => (
                  <SelectItem key={opt.id} value={String(opt.id)}>
                    {opt.titulo ?? opt.title ?? opt.name ?? opt.id}
                  </SelectItem>
                ))}
                {archivosFiltrados.length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</div>
                )}
              </SelectContent>
            </Select>
            {errors.archivo_id && <p className="text-sm text-destructive">{errors.archivo_id}</p>}
          </div>
          {renderSelect('Revisor', data.revisor_id, (val) => setData('revisor_id', val), usuarios, errors.revisor_id)}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="estado_previo">Estado previo</Label>
              <Input
                id="estado_previo"
                value={data.estado_previo}
                readOnly
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
                <SelectTrigger>
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

          <div className="space-y-1.5">
            <Label htmlFor="comentario">Comentario</Label>
            <Textarea
              id="comentario"
              value={data.comentario}
              onChange={(e) => setData('comentario', e.target.value)}
            />
            {errors.comentario && <p className="text-sm text-destructive">{errors.comentario}</p>}
          </div>

          <Button disabled={processing} type="submit">
            Guardar
          </Button>
        </form>
        </div>
      </div>
    </AppLayout>
  );
}
