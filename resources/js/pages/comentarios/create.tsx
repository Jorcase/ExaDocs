import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface Option {
  id: number;
  name?: string;
  titulo?: string;
}

export default function Create({
  archivos,
  usuarios,
}: {
  archivos: Option[];
  usuarios: Option[];
}) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Comentarios', href: route('comentarios.index') },
    { title: 'Crear', href: route('comentarios.create') },
  ];

  const { data, setData, post, processing, errors } = useForm({
    archivo_id: '' as number | '',
    user_id: '' as number | '',
    cuerpo: '',
    destacado: false,
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post(route('comentarios.store'));
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
      <Head title="Crear comentario" />
        <div className="flex justify-center px-4 py-6">
        <div className="w-full max-w-2xl space-y-4 rounded-2xl border-2 border-border/70 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 shadow-lg backdrop-blur-sm dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">        <form onSubmit={handleSubmit} className="space-y-4">
          {renderSelect('Archivo', data.archivo_id, (val) => setData('archivo_id', val), archivos, errors.archivo_id)}
          {renderSelect('Autor', data.user_id, (val) => setData('user_id', val), usuarios, errors.user_id)}

          <div className="space-y-1.5">
            <Label htmlFor="cuerpo">Comentario</Label>
            <Textarea
              id="cuerpo"
              value={data.cuerpo}
              onChange={(e) => setData('cuerpo', e.target.value)}
            />
            {errors.cuerpo && <p className="text-sm text-destructive">{errors.cuerpo}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="destacado"
              checked={data.destacado}
              onCheckedChange={(val) => setData('destacado', Boolean(val))}
            />
            <Label htmlFor="destacado">Destacado</Label>
          </div>

          <Button disabled={processing} type="submit">
            Guardar comentario
          </Button>
        </form>
      </div>
      </div>
    </AppLayout>
  );
}
