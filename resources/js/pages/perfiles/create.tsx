import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState, type FormEvent } from 'react';
import { Camera, User, GraduationCap } from 'lucide-react';
import CarreraMultiselect from '@/components/carrera-multiselect';
import { FormLayout } from '@/components/form-layout';

interface Option {
  id: number;
  name?: string;
  email?: string;
  nombre?: string;
  codigo?: string;
}

export default function Create({
  usuarios,
  carreras,
}: {
  usuarios: Option[];
  carreras: Option[];
}) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Perfiles', href: route('perfiles.index') },
    { title: 'Crear', href: route('perfiles.create') },
  ];

  const { data, setData, post, processing, errors } = useForm({
    user_id: '' as number | '',
    nombre_completo: '',
    documento: '',
    carrera_principal_id: '' as number | '',
    telefono: '',
    avatar: null as File | null,
    bio: '',
    carreras_secundarias: [] as number[],
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post(route('perfiles.store'), {
      forceFormData: true,
    });
  };

  const details = (
    <div className="space-y-6">
      {/* Section 1: User Account & Photo */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group shrink-0">
          <div className="w-24 h-24 rounded-xl overflow-hidden border border-border bg-accent/40 dark:bg-muted relative">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary dark:text-blue-400 text-3xl font-black bg-slate-100 dark:bg-neutral-900">
                {(data.nombre_completo || 'U').slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 bg-primary dark:bg-blue-500 text-white p-2 rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform flex items-center justify-center">
            <Camera className="h-4 w-4" />
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setData('avatar', file);
                if (file) {
                  setAvatarPreview(URL.createObjectURL(file));
                }
              }}
            />
          </label>
        </div>

        <div className="flex-1 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="user_id">Usuario a Vincular</Label>
            <select
              id="user_id"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition"
              value={data.user_id ?? ''}
              onChange={(e) => setData('user_id', e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Seleccioná un usuario</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name ?? u.email ?? u.id}
                </option>
              ))}
            </select>
          </div>
          {errors.user_id && <p className="text-xs text-destructive">{errors.user_id}</p>}
          {errors.avatar && <p className="text-xs text-destructive font-semibold">{errors.avatar}</p>}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border/60 pt-5">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 border-b border-border/60 pb-3 mb-4">
          <GraduationCap className="h-5 w-5 text-slate-400" />
          <h3 className="text-base font-bold">Información Académica</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="carrera">Carrera Principal</Label>
            <CarreraMultiselect
              carreras={carreras}
              selectedIds={data.carrera_principal_id ? [Number(data.carrera_principal_id)] : []}
              multiple={false}
              excludeIds={data.carreras_secundarias}
              onChange={(ids) => {
                const id = ids[0] ?? '';
                setData('carrera_principal_id', id);
                if (id) {
                  setData((prev) => ({
                    ...prev,
                    carrera_principal_id: id,
                    carreras_secundarias: prev.carreras_secundarias.filter(x => x !== id)
                  }));
                }
              }}
              placeholder="Buscá carrera principal..."
            />
            {errors.carrera_principal_id && <p className="text-xs text-destructive">{errors.carrera_principal_id}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Otras Carreras (Secundarias)</Label>
            <CarreraMultiselect
              carreras={carreras}
              selectedIds={data.carreras_secundarias}
              multiple={true}
              excludeIds={data.carrera_principal_id ? [Number(data.carrera_principal_id)] : []}
              onChange={(ids) => setData('carreras_secundarias', ids)}
              placeholder="Buscá y agregá carreras..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const sidebar = (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 border-b border-border/60 pb-3 mb-4">
        <User className="h-5 w-5 text-slate-400" />
        <h3 className="text-base font-bold">Información Personal</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="nombre_completo">Nombre Completo</Label>
          <Input
            id="nombre_completo"
            value={data.nombre_completo}
            onChange={(e) => setData('nombre_completo', e.target.value)}
            placeholder="Nombre del estudiante"
            className="rounded-lg"
          />
          {errors.nombre_completo && <p className="text-xs text-destructive">{errors.nombre_completo}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="documento">DNI</Label>
            <Input
              id="documento"
              value={data.documento}
              onChange={(e) => setData('documento', e.target.value)}
              placeholder="DNI"
              className="rounded-lg"
            />
            {errors.documento && <p className="text-xs text-destructive">{errors.documento}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={data.telefono}
              onChange={(e) => setData('telefono', e.target.value)}
              placeholder="Teléfono"
              className="rounded-lg"
            />
            {errors.telefono && <p className="text-xs text-destructive">{errors.telefono}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">Biografía</Label>
          <Textarea
            id="bio"
            value={data.bio}
            onChange={(e) => setData('bio', e.target.value)}
            placeholder="Biografía académica..."
            className="rounded-lg min-h-[140px] resize-none"
          />
          {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Crear perfil" />
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6 animate-in fade-in duration-300">
        <FormLayout
          onSubmit={handleSubmit}
          processing={processing}
          cancelHref={route('perfiles.index')}
          submitLabel="Guardar perfil"
          sidebar={sidebar}
        >
          {details}
        </FormLayout>
      </div>
    </AppLayout>
  );
}
