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
import { type FormEvent, useEffect } from 'react';

interface Option {
  id: number;
  name?: string;
  email?: string;
  nombre?: string;
}

interface Perfil {
  id: number;
  user_id: number;
  user?: { id: number; name: string; email: string };
  documento?: string | null;
  carrera_principal_id?: number | null;
  telefono?: string | null;
  avatar_path?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
}

export default function Edit({
  perfil,
  usuarios,
  carreras,
}: {
  perfil: Perfil;
  usuarios: Option[];
  carreras: Option[];
}) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Perfiles', href: route('perfiles.index') },
    { title: `Editar #${perfil.id}`, href: route('perfiles.edit', perfil.id) },
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

  useEffect(() => {
    setData('user_id', perfil.user_id);
  }, [perfil.user_id, setData]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post(route('perfiles.update', perfil.id), {
      forceFormData: true,
    });
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
              {opt.name ?? opt.email ?? opt.nombre ?? opt.id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Editar perfil #${perfil.id}`} />
      <div className="flex justify-center px-4 py-6">
        <div className="w-full max-w-2xl space-y-4 rounded-2xl border-2 border-border/70 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 shadow-lg backdrop-blur-sm dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="user_id" value={data.user_id} />
          <div className="space-y-1.5">
            <Label>Usuario</Label>
            <Input
              value={
                usuarios.find((u) => u.id === perfil.user_id)?.name ??
                usuarios.find((u) => u.id === perfil.user_id)?.email ??
                `ID ${perfil.user_id}`
              }
              disabled
            />
            {errors.user_id && <p className="text-sm text-destructive">{errors.user_id}</p>}
          </div>
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
          {renderSelect(
            'Carrera principal',
            data.carrera_principal_id,
            (val) => setData('carrera_principal_id', val),
            carreras,
            errors.carrera_principal_id,
            'Opcional',
          )}

          <div className="space-y-1.5">
            <Label htmlFor="documento">Documento</Label>
            <Input
              id="documento"
              value={data.documento}
              onChange={(e) => setData('documento', e.target.value)}
            />
            {errors.documento && <p className="text-sm text-destructive">{errors.documento}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={data.telefono}
              onChange={(e) => setData('telefono', e.target.value)}
            />
            {errors.telefono && <p className="text-sm text-destructive">{errors.telefono}</p>}
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
                <img src={perfil.avatar_url} alt={perfil.user_id.toString()} className="h-16 w-16 rounded-full object-cover border" />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={data.bio}
              onChange={(e) => setData('bio', e.target.value)}
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
