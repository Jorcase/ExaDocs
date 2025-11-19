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
    { title: 'Reportes de contenido', href: route('reportes.index') },
    { title: 'Crear', href: route('reportes.create') },
  ];

  const { data, setData, post, processing, errors } = useForm({
    archivo_id: '' as number | '',
    reportante_id: '' as number | '',
    motivo: 'spam',
    detalle: '',
    estado: 'pendiente',
    resuelto_por: '' as number | '',
    resuelto_en: '',
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post(route('reportes.store'));
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
      <Head title="Crear reporte" />
      <div className="w-full max-w-2xl p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderSelect('Archivo', data.archivo_id, (val) => setData('archivo_id', val), archivos, errors.archivo_id)}
          {renderSelect('Reportante', data.reportante_id, (val) => setData('reportante_id', val), usuarios, errors.reportante_id)}

          <div className="space-y-1.5">
            <Label>Motivo</Label>
            <Select value={data.motivo} onValueChange={(v) => setData('motivo', v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="contenido_incorrecto">Contenido incorrecto</SelectItem>
                <SelectItem value="copyright">Copyright</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
            {errors.motivo && <p className="text-sm text-destructive">{errors.motivo}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="detalle">Detalle</Label>
            <Textarea
              id="detalle"
              value={data.detalle}
              onChange={(e) => setData('detalle', e.target.value)}
            />
            {errors.detalle && <p className="text-sm text-destructive">{errors.detalle}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={data.estado} onValueChange={(v) => setData('estado', v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_revision">En revisión</SelectItem>
                  <SelectItem value="resuelto">Resuelto</SelectItem>
                </SelectContent>
              </Select>
              {errors.estado && <p className="text-sm text-destructive">{errors.estado}</p>}
            </div>
            <div className="space-y-1.5">
              {renderSelect('Resuelto por', data.resuelto_por, (val) => setData('resuelto_por', val), usuarios, errors.resuelto_por, 'Opcional')}
              <div className="space-y-1.5">
                <Label htmlFor="resuelto_en">Resuelto en</Label>
                <Input
                  id="resuelto_en"
                  type="datetime-local"
                  value={data.resuelto_en ?? ''}
                  onChange={(e) => setData('resuelto_en', e.target.value)}
                />
                {errors.resuelto_en && <p className="text-sm text-destructive">{errors.resuelto_en}</p>}
              </div>
            </div>
          </div>

          <Button disabled={processing} type="submit">
            Guardar reporte
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
