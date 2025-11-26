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

export default function Create({ usuarios }: { usuarios: Option[] }) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Notificaciones', href: route('admin.notificaciones.index') },
    { title: 'Crear', href: route('admin.notificaciones.create') },
  ];

  const { data, setData, post, processing, errors } = useForm({
    user_id: '' as number | '',
    tipo: '',
    data: '' as string,
    leido_en: '',
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let parsed = {};
    if (data.data) {
      try {
        parsed = JSON.parse(data.data as unknown as string);
      } catch (e) {
        alert('Data debe ser JSON válido');
        return;
      }
    }
    post(route('admin.notificaciones.store'), {
      data: {
        ...data,
        data: parsed,
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Crear notificación" />
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
            <Label htmlFor="tipo">Tipo</Label>
            <Input id="tipo" value={data.tipo} onChange={(e) => setData('tipo', e.target.value)} />
            {errors.tipo && <p className="text-sm text-destructive">{errors.tipo}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="data">Data (JSON)</Label>
            <Textarea
              id="data"
              value={data.data}
              onChange={(e) => setData('data', e.target.value)}
              placeholder='{"mensaje": "texto"}'
            />
            {errors.data && <p className="text-sm text-destructive">{errors.data}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="leido_en">Leído en</Label>
            <Input
              id="leido_en"
              type="datetime-local"
              value={data.leido_en ?? ''}
              onChange={(e) => setData('leido_en', e.target.value)}
            />
            {errors.leido_en && <p className="text-sm text-destructive">{errors.leido_en}</p>}
          </div>

          <Button disabled={processing} type="submit">
            Guardar notificación
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
