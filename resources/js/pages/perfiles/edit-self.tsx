import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { type FormEvent } from 'react';

interface Option {
  id: number;
  nombre?: string;
}

interface Perfil {
  id: number;
  user_id: number;
  nombre_completo?: string | null;
  documento?: string | null;
  carrera_principal_id?: number | null;
  telefono?: string | null;
  avatar_path?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
}

export default function EditSelf({
  perfil,
  carreras,
}: {
  perfil: Perfil;
  carreras: Option[];
}) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Perfil', href: route('perfil.show') },
    { title: 'Editar', href: route('perfil.edit') },
  ];

  const { data, setData, post, processing, errors } = useForm({
    _method: 'put',
    user_id: perfil.user_id,
    nombre_completo: perfil.nombre_completo ?? '',
    documento: perfil.documento ?? '',
    carrera_principal_id: perfil.carrera_principal_id ?? '',
    telefono: perfil.telefono ?? '',
    avatar: null as File | null,
    bio: perfil.bio ?? '',
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post(route('perfil.update'), {
      forceFormData: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Editar mi perfil" />
      <div className="flex justify-center px-4 py-6">
        <div className="w-full max-w-2xl space-y-4 rounded-2xl border-2 border-border/70 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 shadow-lg backdrop-blur-sm dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="user_id" value={data.user_id} />

          <div className="space-y-1.5">
            <Label htmlFor="nombre_completo">Nombre completo</Label>
            <Input
              id="nombre_completo"
              value={data.nombre_completo}
              onChange={(e) => setData('nombre_completo', e.target.value)}
              placeholder="Tu nombre completo"
            />
            {errors.nombre_completo && <p className="text-sm text-destructive">{errors.nombre_completo}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="documento">Documento</Label>
            <Input
              id="documento"
              value={data.documento}
              onChange={(e) => setData('documento', e.target.value)}
              placeholder="DNI"
            />
            {errors.documento && <p className="text-sm text-destructive">{errors.documento}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={data.telefono}
              onChange={(e) => setData('telefono', e.target.value)}
              placeholder="Teléfono"
            />
            {errors.telefono && <p className="text-sm text-destructive">{errors.telefono}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="carrera">Carrera principal</Label>
            <select
              id="carrera"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={data.carrera_principal_id ?? ''}
              onChange={(e) => setData('carrera_principal_id', e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Seleccioná una carrera</option>
              {carreras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            {errors.carrera_principal_id && <p className="text-sm text-destructive">{errors.carrera_principal_id}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="avatar">Avatar (imagen)</Label>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={(e) => setData('avatar', e.target.files?.[0] ?? null)}
            />
            {errors.avatar && <p className="text-sm text-destructive">{errors.avatar}</p>}
            {perfil.avatar_url && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Avatar actual</p>
                <img
                  src={perfil.avatar_url}
                  alt={perfil.user_id.toString()}
                  className="h-16 w-16 rounded-full object-cover border"
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={data.bio}
              onChange={(e) => setData('bio', e.target.value)}
              placeholder="Contanos sobre vos..."
            />
            {errors.bio && <p className="text-sm text-destructive">{errors.bio}</p>}
          </div>

          <Button disabled={processing} type="submit">
            Guardar cambios
          </Button>
        </form>
        </div>
      </div>
    </AppLayout>
  );
}
