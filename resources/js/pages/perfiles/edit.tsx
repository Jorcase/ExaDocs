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
  email?: string;
  nombre?: string;
}

interface Perfil {
  id: number;
  user_id: number;
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

  const { data, setData, put, processing, errors } = useForm({
    user_id: perfil.user_id,
    documento: perfil.documento ?? '',
    carrera_principal_id: perfil.carrera_principal_id ?? '',
    telefono: perfil.telefono ?? '',
    avatar: null as File | null,
    bio: perfil.bio ?? '',
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = { ...data } as Record<string, any>;
    if (!formData.avatar) {
      delete formData.avatar;
    }
    put(route('perfiles.update', perfil.id), {
      forceFormData: true,
      data: formData,
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
      <div className="w-full max-w-2xl p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderSelect('Usuario', data.user_id, (val) => setData('user_id', val), usuarios, errors.user_id)}
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
    </AppLayout>
  );
}
