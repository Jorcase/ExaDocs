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
}

interface Auditoria {
  id: number;
  user_id?: number | null;
  accion: string;
  entidad_tipo?: string | null;
  entidad_id?: number | null;
  payload?: Record<string, any> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at?: string | null;
}

export default function Edit({
  auditoria,
  usuarios,
}: {
  auditoria: Auditoria;
  usuarios: Option[];
}) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Auditorías', href: route('auditorias.index') },
    { title: `Editar #${auditoria.id}`, href: route('auditorias.edit', auditoria.id) },
  ];

  const { data, setData, put, processing, errors } = useForm({
    user_id: auditoria.user_id ?? '',
    accion: auditoria.accion,
    entidad_tipo: auditoria.entidad_tipo ?? '',
    entidad_id: auditoria.entidad_id ?? '',
    payload: JSON.stringify(auditoria.payload ?? {}, null, 2),
    ip_address: auditoria.ip_address ?? '',
    user_agent: auditoria.user_agent ?? '',
    created_at: auditoria.created_at ?? '',
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let parsed = {};
    if (data.payload) {
      try {
        parsed = JSON.parse(data.payload as unknown as string);
      } catch (_e) {
        alert('Payload debe ser JSON válido');
        return;
      }
    }
    put(route('auditorias.update', auditoria.id), {
      data: {
        ...data,
        entidad_id: data.entidad_id === '' ? null : data.entidad_id,
        payload: parsed,
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Editar auditoría #${auditoria.id}`} />
      <div className="w-full max-w-2xl p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Usuario</Label>
            <Select
              value={data.user_id === '' ? '' : String(data.user_id)}
              onValueChange={(v) => setData('user_id', Number(v))}
            >
              <SelectTrigger>
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
            <Label htmlFor="accion">Acción</Label>
            <Input id="accion" value={data.accion} onChange={(e) => setData('accion', e.target.value)} />
            {errors.accion && <p className="text-sm text-destructive">{errors.accion}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="entidad_tipo">Entidad tipo</Label>
              <Input
                id="entidad_tipo"
                value={data.entidad_tipo}
                onChange={(e) => setData('entidad_tipo', e.target.value)}
              />
              {errors.entidad_tipo && <p className="text-sm text-destructive">{errors.entidad_tipo}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="entidad_id">Entidad ID</Label>
              <Input
                id="entidad_id"
                type="number"
                value={data.entidad_id}
                onChange={(e) => setData('entidad_id', e.target.value)}
              />
              {errors.entidad_id && <p className="text-sm text-destructive">{errors.entidad_id}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payload">Payload (JSON)</Label>
            <Textarea
              id="payload"
              value={data.payload as unknown as string}
              onChange={(e) => setData('payload', e.target.value)}
            />
            {errors.payload && <p className="text-sm text-destructive">{errors.payload}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ip_address">IP</Label>
              <Input
                id="ip_address"
                value={data.ip_address}
                onChange={(e) => setData('ip_address', e.target.value)}
              />
              {errors.ip_address && <p className="text-sm text-destructive">{errors.ip_address}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="created_at">Fecha</Label>
              <Input
                id="created_at"
                type="datetime-local"
                value={data.created_at ?? ''}
                onChange={(e) => setData('created_at', e.target.value)}
              />
              {errors.created_at && <p className="text-sm text-destructive">{errors.created_at}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="user_agent">User agent</Label>
            <Textarea
              id="user_agent"
              value={data.user_agent}
              onChange={(e) => setData('user_agent', e.target.value)}
            />
            {errors.user_agent && <p className="text-sm text-destructive">{errors.user_agent}</p>}
          </div>

          <Button disabled={processing} type="submit">
            Guardar cambios
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
