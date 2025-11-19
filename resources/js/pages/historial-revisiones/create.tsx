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
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { type FormEvent } from 'react';

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

export default function Create({
  archivos,
  usuarios,
  estados,
}: {
  archivos: ArchivoOption[];
  usuarios: Option[];
  estados: Option[];
}) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Historial de revisiones', href: route('historial-revisiones.index') },
    { title: 'Registrar', href: route('historial-revisiones.create') },
  ];

  const { data, setData, post, processing, errors } = useForm({
    archivo_id: '' as number | '',
    revisor_id: '' as number | '',
    estado_previo: '',
    estado_nuevo: '',
    estado_nuevo_id: '' as number | '',
    comentario: '',
  });

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
      <div className="w-full max-w-2xl p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderSelect('Archivo', data.archivo_id, (val) => {
            setData('archivo_id', val);
            const archivo = archivos.find((a) => a.id === val);
            setData('estado_previo', archivo?.estado?.nombre ?? '');
          }, archivos, errors.archivo_id)}
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
    </AppLayout>
  );
}
