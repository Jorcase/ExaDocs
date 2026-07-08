import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { FormLayout } from '@/components/form-layout';

interface Option {
  id: number;
  name?: string;
  titulo?: string;
}

interface Comentario {
  id: number;
  archivo_id: number;
  user_id: number;
  cuerpo: string;
  destacado: boolean;
}

export default function Edit({
  comentario,
  archivos,
  usuarios,
}: {
  comentario: Comentario;
  archivos: Option[];
  usuarios: Option[];
}) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Comentarios', href: route('comentarios.index') },
    { title: `Editar #${comentario.id}`, href: route('comentarios.edit', comentario.id) },
  ];

  const { data, setData, put, processing, errors } = useForm({
    archivo_id: comentario.archivo_id,
    user_id: comentario.user_id,
    cuerpo: comentario.cuerpo,
    destacado: comentario.destacado,
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    put(route('comentarios.update', comentario.id));
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
      <Head title={`Editar comentario #${comentario.id}`} />
      <div className="mx-auto max-w-7xl px-4 py-8 animate-in fade-in duration-300">
        <FormLayout
          onSubmit={handleSubmit}
          processing={processing}
          cancelHref={route('comentarios.index')}
          submitLabel="Guardar cambios"
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            {/* Row 1: Archivo & Autor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderSelectField('Archivo', data.archivo_id, (val) => setData('archivo_id', val), archivos, errors.archivo_id)}
              {renderSelectField('Autor', data.user_id, (val) => setData('user_id', val), usuarios, errors.user_id)}
            </div>

            {/* Row 2: Comentario */}
            <div className="space-y-1.5">
              <Label htmlFor="cuerpo">Comentario</Label>
              <Textarea
                id="cuerpo"
                value={data.cuerpo}
                onChange={(e) => setData('cuerpo', e.target.value)}
                className="rounded-lg resize-none min-h-[120px]"
              />
              {errors.cuerpo && <p className="text-sm text-destructive">{errors.cuerpo}</p>}
            </div>

            {/* Row 3: Destacado */}
            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                id="destacado"
                checked={data.destacado}
                onCheckedChange={(val) => setData('destacado', Boolean(val))}
              />
              <Label htmlFor="destacado" className="cursor-pointer font-medium select-none">Destacado</Label>
            </div>
          </div>
        </FormLayout>
      </div>
    </AppLayout>
  );
}
