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
import { FormLayout } from '@/components/form-layout';

interface Option {
  id: number;
  name?: string;
}

interface Notificacion {
  id: number;
  user_id: number;
  tipo: string;
  data: Record<string, any>;
  leido_en?: string | null;
}

export default function Edit({
  notificacion,
  usuarios,
}: {
  notificacion: Notificacion;
  usuarios: Option[];
}) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Notificaciones', href: route('admin.notificaciones.index') },
    { title: `Editar #${notificacion.id}`, href: route('admin.notificaciones.edit', notificacion.id) },
  ];

  const { data, setData, put, processing, errors } = useForm({
    user_id: notificacion.user_id,
    tipo: notificacion.tipo,
    data: JSON.stringify(notificacion.data ?? {}, null, 2),
    leido_en: notificacion.leido_en ?? '',
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let parsed = {};
    if (data.data) {
      try {
        parsed = JSON.parse(data.data as unknown as string);
      } catch (_e) {
        alert('Data debe ser JSON válido');
        return;
      }
    }
    put(route('admin.notificaciones.update', notificacion.id), {
      data: {
        ...data,
        data: parsed,
      },
    } as any);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Editar notificación #${notificacion.id}`} />
      <div className="mx-auto max-w-7xl px-4 py-8 animate-in fade-in duration-300">
        <FormLayout
          onSubmit={handleSubmit}
          processing={processing}
          cancelHref={route('admin.notificaciones.index')}
          submitLabel="Guardar cambios"
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            {/* Row 1: Usuario & Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Usuario</Label>
                <Select
                  value={data.user_id === '' ? '' : String(data.user_id)}
                  onValueChange={(v) => setData('user_id', Number(v))}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Seleccioná un usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.user_id && <p className="text-sm text-destructive">{errors.user_id}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tipo">Tipo</Label>
                <Input
                  id="tipo"
                  value={data.tipo}
                  onChange={(e) => setData('tipo', e.target.value)}
                  className="rounded-lg"
                />
                {errors.tipo && <p className="text-sm text-destructive">{errors.tipo}</p>}
              </div>
            </div>

            {/* Row 2: Leído en */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="leido_en">Leído en</Label>
                <Input
                  id="leido_en"
                  type="datetime-local"
                  value={data.leido_en ?? ''}
                  onChange={(e) => setData('leido_en', e.target.value)}
                  className="rounded-lg"
                />
                {errors.leido_en && <p className="text-sm text-destructive">{errors.leido_en}</p>}
              </div>
            </div>

            {/* Row 3: Data (JSON) */}
            <div className="space-y-1.5">
              <Label htmlFor="data">Data (JSON)</Label>
              <Textarea
                id="data"
                value={data.data as unknown as string}
                onChange={(e) => setData('data', e.target.value)}
                className="rounded-lg resize-none min-h-[120px] font-mono text-xs"
              />
              {errors.data && <p className="text-sm text-destructive">{errors.data}</p>}
            </div>
          </div>
        </FormLayout>
      </div>
    </AppLayout>
  );
}
