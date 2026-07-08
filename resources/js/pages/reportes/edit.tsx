import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Reporte {
  id: number;
  archivo_id: number;
  reportante_id: number;
  motivo: string;
  detalle?: string | null;
  estado: string;
  resuelto_por?: number | null;
  resuelto_en?: string | null;
  archivo?: { id: number; titulo: string } | null;
  reportante?: { id: number; name: string } | null;
  moderador?: { id: number; name: string } | null;
}

export default function Edit({
  reporte,
}: {
  reporte: Reporte;
}) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reportes de contenido', href: route('reportes.index') },
    { title: `Revisar #${reporte.id}`, href: route('reportes.edit', reporte.id) },
  ];

  const { data, setData, put, processing, errors } = useForm({
    archivo_id: reporte.archivo_id,
    reportante_id: reporte.reportante_id,
    motivo: reporte.motivo,
    detalle: reporte.detalle ?? '',
    estado: reporte.estado,
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    put(route('reportes.update', reporte.id));
  };

  const formatDate = (val?: string | null) => {
    if (!val) return '—';
    const date = new Date(val);
    if (Number.isNaN(date.getTime())) return val;
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Revisar reporte #${reporte.id}`} />
      <div className="mx-auto max-w-4xl px-4 py-8 animate-in fade-in duration-300">
        <FormLayout
          onSubmit={handleSubmit}
          processing={processing}
          cancelHref={route('reportes.index')}
          submitLabel="Guardar resolución"
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6">
            
            {/* Header info */}
            <div>
              <h2 className="text-lg font-bold text-foreground">Detalles del Reporte de Contenido</h2>
              <p className="text-xs text-muted-foreground">Esta información fue provista por el usuario y no es editable.</p>
            </div>

            {/* Read-only details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 border border-border p-5 rounded-2xl">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Archivo Reportado</span>
                <span className="text-sm font-semibold text-foreground">
                  {reporte.archivo?.titulo ?? '—'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Reportante</span>
                <span className="text-sm font-semibold text-foreground">
                  {reporte.reportante?.name ?? '—'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Motivo</span>
                <Badge variant="outline" className="capitalize text-xs font-semibold px-2.5 py-0.5 mt-0.5">
                  {reporte.motivo.replace('_', ' ')}
                </Badge>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-1 pt-2 border-t border-border/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Detalle / Explicación del usuario</span>
                <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap bg-background p-3 rounded-lg border border-border/60">
                  {reporte.detalle || 'Sin comentarios adicionales.'}
                </p>
              </div>
            </div>

            <Separator className="my-2" />

            {/* Editable Resolution section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-bold text-foreground">Resolución del Reporte</h3>
                <p className="text-xs text-muted-foreground">Cambia el estado de moderación para archivar o gestionar el reporte.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado</Label>
                  <Select value={data.estado} onValueChange={(v) => setData('estado', v as any)}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="en_revision">En revisión</SelectItem>
                      <SelectItem value="resuelto">Resuelto</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.estado && <p className="text-xs text-destructive font-medium">{errors.estado}</p>}
                </div>

                {reporte.estado === 'resuelto' && (
                  <div className="space-y-2 p-3 bg-primary/5 rounded-xl border border-primary/10 text-xs">
                    <p className="font-bold text-primary dark:text-sky-400">Datos de Resolución</p>
                    <div className="space-y-1 text-muted-foreground">
                      <p>
                        <span className="font-semibold text-foreground">Moderador:</span>{' '}
                        {reporte.moderador?.name ?? 'Sistema'}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">Fecha:</span>{' '}
                        {formatDate(reporte.resuelto_en)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </FormLayout>
      </div>
    </AppLayout>
  );
}
