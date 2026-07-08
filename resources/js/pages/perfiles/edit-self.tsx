import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState, type FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { Camera, User, GraduationCap, Trash2 } from 'lucide-react';
import CarreraMultiselect from '@/components/carrera-multiselect';

interface Option {
  id: number;
  nombre?: string;
  codigo?: string;
}

interface UserCarrera {
  id: number;
  es_principal: boolean;
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
  userCarreras,
}: {
  perfil: Perfil;
  carreras: Option[];
  userCarreras?: UserCarrera[];
}) {
  const page = usePage();
  const userEmail = (page.props as any).auth?.user?.email ?? '';

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Perfil', href: route('perfil.show') },
    { title: 'Editar', href: route('perfil.edit') },
  ];

  const initialSecundarias = userCarreras
    ? userCarreras.filter((c) => !c.es_principal).map((c) => c.id)
    : [];

  const { data, setData, post, processing, errors } = useForm({
    _method: 'put',
    user_id: perfil.user_id,
    nombre_completo: perfil.nombre_completo ?? '',
    documento: perfil.documento ?? '',
    carrera_principal_id: perfil.carrera_principal_id ?? '',
    telefono: perfil.telefono ?? '',
    avatar: null as File | null,
    bio: perfil.bio ?? '',
    carreras_secundarias: initialSecundarias as number[],
    remove_avatar: false,
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post(route('perfil.update'), {
      forceFormData: true,
    });
  };

  const handleRemoveAvatar = () => {
    setData((prev) => ({
      ...prev,
      avatar: null,
      remove_avatar: true,
    }));
    setAvatarPreview(null);
    setIsAvatarRemoved(true);
  };

  const hasAvatar = avatarPreview || (perfil.avatar_url && !isAvatarRemoved);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Editar mi perfil" />
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 space-y-6 animate-in fade-in duration-300">
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="user_id" value={data.user_id} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            
            {/* Left Column: Photo & Academic (2 Cards stacked) */}
            <div className="flex flex-col gap-6">
              
              {/* Card 1: Profile Photo */}
              <section className="bg-card text-card-foreground rounded-2xl p-6 border border-border/80 shadow-xs flex flex-col sm:flex-row items-center gap-6 flex-1">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-border bg-accent/40 dark:bg-muted relative">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (perfil.avatar_url && !isAvatarRemoved) ? (
                      <img src={perfil.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary dark:text-blue-400 text-3xl font-black bg-slate-100 dark:bg-neutral-900">
                        {(data.nombre_completo || 'U').slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 bg-primary dark:bg-blue-500 text-white p-2 rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform flex items-center justify-center">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setData((prev) => ({
                          ...prev,
                          avatar: file,
                          remove_avatar: false,
                        }));
                        if (file) {
                          setAvatarPreview(URL.createObjectURL(file));
                          setIsAvatarRemoved(false);
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">Foto de Perfil</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      Formatos recomendados: JPG, PNG o WEBP. Tamaño máximo: 5MB.
                    </p>
                  </div>
                  {hasAvatar && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="rounded-xl gap-1.5 h-8 text-xs font-semibold"
                      onClick={handleRemoveAvatar}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar Foto
                    </Button>
                  )}
                  {errors.avatar && <p className="text-xs text-destructive font-semibold">{errors.avatar}</p>}
                </div>
              </section>

              {/* Card 2: Academic Credentials */}
              <section className="bg-card text-card-foreground rounded-2xl p-6 border border-border/80 shadow-xs space-y-5 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 border-b border-border/60 pb-3">
                  <GraduationCap className="h-5 w-5" />
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
                      placeholder="Buscá tu carrera principal..."
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
                      placeholder="Buscá y agregá tus otras carreras..."
                    />
                  </div>
                </div>
              </section>

            </div>

            {/* Right Column: Personal Information (1 tall Card) */}
            <section className="bg-card text-card-foreground rounded-2xl p-6 border border-border/80 shadow-xs space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 border-b border-border/60 pb-3 mb-4">
                  <User className="h-5 w-5" />
                  <h3 className="text-base font-bold">Información Personal</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nombre_completo">Nombre Completo</Label>
                    <Input
                      id="nombre_completo"
                      value={data.nombre_completo}
                      onChange={(e) => setData('nombre_completo', e.target.value)}
                      placeholder="Tu nombre completo"
                      className="rounded-xl"
                    />
                    {errors.nombre_completo && <p className="text-xs text-destructive">{errors.nombre_completo}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      value={userEmail}
                      disabled
                      className="rounded-xl bg-muted/50 cursor-not-allowed opacity-80"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="documento">DNI</Label>
                      <Input
                        id="documento"
                        value={data.documento}
                        onChange={(e) => setData('documento', e.target.value)}
                        placeholder="DNI"
                        className="rounded-xl"
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
                        className="rounded-xl"
                      />
                      {errors.telefono && <p className="text-xs text-destructive">{errors.telefono}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bio">Biografía Académica</Label>
                    <Textarea
                      id="bio"
                      value={data.bio}
                      onChange={(e) => setData('bio', e.target.value)}
                      placeholder="Contanos tus intereses académicos, proyectos o sobre vos..."
                      className="rounded-xl min-h-[110px] resize-none"
                    />
                    {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* Bottom Actions Row */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
            <Link href={route('perfil.show')}>
              <Button type="button" variant="outline" className="rounded-xl">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={processing}
              className="rounded-xl"
            >
              Guardar cambios
            </Button>
          </div>

        </form>
      </div>
    </AppLayout>
  );
}
