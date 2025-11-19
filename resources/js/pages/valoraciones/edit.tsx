import { Button } from '@/components/ui/button';
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
  name?: string;
  titulo?: string;
}

interface Valoracion {
  id: number;
  archivo_id: number;
  user_id: number;
  puntaje: number;
  comentario?: string | null;
}

export default function Edit({
  valoracion,
  archivos,
  usuarios,
}: {
  valoracion: Valoracion;
  archivos: Option[];
  usuarios: Option[];
}) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Valoraciones', href: route('valoraciones.index') },
    { title: `Editar #${valoracion.id}`, href: route('valoraciones.edit', valoracion.id) },
  ];

  const { data, setData, put, processing, errors } = useForm({
    archivo_id: valoracion.archivo_id,
    user_id: valoracion.user_id,
    puntaje: valoracion.puntaje,
    comentario: valoracion.comentario ?? '',
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    put(route('valoraciones.update', valoracion.id));
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
              {opt.titulo ?? opt.name ?? opt.id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Editar valoración #${valoracion.id}`} />
      <div className="w-full max-w-2xl p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderSelect('Archivo', data.archivo_id, (val) => setData('archivo_id', val), archivos, errors.archivo_id)}
          {renderSelect('Autor', data.user_id, (val) => setData('user_id', val), usuarios, errors.user_id)}

          <div className="space-y-1.5">
            <Label>Puntaje</Label>
            <Select value={String(data.puntaje)} onValueChange={(v) => setData('puntaje', Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.puntaje && <p className="text-sm text-destructive">{errors.puntaje}</p>}
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
            Guardar cambios
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
