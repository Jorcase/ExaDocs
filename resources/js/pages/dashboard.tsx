import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Eye, Star, MessageSquare, Bookmark, BookOpen, Building, Users, FileText } from 'lucide-react';

interface ArchivoCard {
  id: number;
  titulo: string;
  materia?: string | null;
  autor?: string | null;
  visitas?: number;
  saves?: number;
  valoraciones?: number;
  valoraciones_avg?: number | null;
  comentarios?: number;
  file_path?: string | null;
  thumbnail_path?: string | null;
}

interface DashboardProps {
  popularArchivos: ArchivoCard[];
  recentArchivos: ArchivoCard[];
  canViewCosas?: boolean;
  stats?: {
    archivos: number;
    materias: number;
    carreras: number;
    usuarios: number;
  };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: route('dashboard') }];

function ArchivoSlide({ archivo }: { archivo: ArchivoCard }) {
  const thumb = archivo.thumbnail_path || archivo.file_path;
  const imageUrl = thumb ? `/storage/${thumb}` : null;

  return (
    <Link
      href={route('archivos.show', archivo.id)}
      className="group block overflow-hidden rounded-2xl border-2 border-border/70 bg-gradient-to-br from-slate-100 via-slate-50 to-white text-slate-900 shadow-lg transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:from-sky-100 hover:via-slate-50 hover:to-white dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50 dark:hover:from-sky-900 dark:hover:via-neutral-950 dark:hover:to-neutral-950"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={archivo.titulo}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-600 dark:text-slate-200">
            Sin vista previa
          </div>
        )}
      </div>
      <div className="space-y-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-50">{archivo.titulo}</p>
        <p className="text-xs text-slate-700 dark:text-slate-200">
          {archivo.materia ?? 'Sin materia'} · {archivo.autor ?? 'Sin autor'}
        </p>
        <div className="flex items-center gap-3 text-[11px] text-slate-700 dark:text-slate-200">
          {archivo.visitas !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3" /> {archivo.visitas}
            </span>
          )}
          {archivo.saves !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Bookmark className="h-3 w-3" /> {archivo.saves}
            </span>
          )}
          {archivo.valoraciones !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3" />
              {archivo.valoraciones_avg !== undefined && archivo.valoraciones_avg !== null
                ? Number(archivo.valoraciones_avg).toFixed(1)
                : '—'}{' '}
              ({archivo.valoraciones})
            </span>
          )}
          {archivo.comentarios !== undefined && (
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> {archivo.comentarios}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard({ popularArchivos, recentArchivos, canViewCosas = true, stats }: DashboardProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="space-y-6 px-4 pb-6 pt-3 md:px-6 md:pt-5">
        {!canViewCosas && (
          <section className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-100">
            <h2 className="text-lg font-semibold">Completá tu perfil</h2>
            <p className="text-sm">
              Para ver recomendaciones, subir archivos y guardarlos, primero completá tu perfil.
            </p>
            <Link
              href={route('perfil.edit')}
              className="mt-3 inline-flex rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Completar perfil
            </Link>
          </section>
        )}

        <section className="relative overflow-hidden w-full rounded-2xl border border-border/60 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Bienvenido a ExaDocs</h1>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Encontrá lo que necesitas rápido: archivos populares para tu carrera, actualizados y en buena calidad.
          </p>
        </section>

        {canViewCosas && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Populares para vos</h2>
              <Link href={route('archivos.index')} className="text-sm font-medium text-primary hover:underline">
                Ver todos
              </Link>
            </div>
            {popularArchivos.length ? (
              <Swiper
                modules={[Navigation]}
                navigation
                loop={popularArchivos.length > 1}
                spaceBetween={12}
                slidesPerView={1.1}
                breakpoints={{
                  640: { slidesPerView: 2.1 },
                  1024: { slidesPerView: 3.1 },
                }}
              >
                {popularArchivos.map((archivo) => (
                  <SwiperSlide key={archivo.id}>
                    <ArchivoSlide archivo={archivo} />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <p className="text-sm text-muted-foreground">No hay sugerencias aún.</p>
            )}
          </section>
        )}


        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Subidos recientemente</h2>
            <Link href={route('archivos.index')} className="text-sm font-medium text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          {recentArchivos.length ? (
            <Swiper
              modules={[Navigation]}
              navigation
              loop={recentArchivos.length > 1}
              spaceBetween={12}
              slidesPerView={1.1}
              breakpoints={{
                640: { slidesPerView: 2.1 },
                1024: { slidesPerView: 3.1 },
              }}
            >
              {recentArchivos.map((archivo) => (
                <SwiperSlide key={archivo.id}>
                  <ArchivoSlide archivo={archivo} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="text-sm text-muted-foreground">Todavía no se subieron archivos.</p>
          )}
        </section>

        {stats && (
          <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 text-slate-900 shadow-lg dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
            <div className="pointer-events-none absolute inset-0 opacity-30">
              <div className="absolute -left-20 -top-24 h-56 w-56 rounded-full bg-cyan-400/30 blur-3xl" />
              <div className="absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-purple-500/30 blur-3xl" />
            </div>
            <div className="relative grid gap-4 text-center sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur-sm transition hover:border-black/10 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10">
                <div className="mb-2 flex items-center justify-center gap-2 text-amber-500 dark:text-amber-300">
                  <FileText className="h-5 w-5" />
                  <span className="text-lg font-semibold">Archivos</span>
                </div>
                <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{stats.archivos.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur-sm transition hover:border-black/10 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10">
                <div className="mb-2 flex items-center justify-center gap-2 text-amber-500 dark:text-amber-300">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-lg font-semibold">Materias</span>
                </div>
                <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{stats.materias.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur-sm transition hover:border-black/10 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10">
                <div className="mb-2 flex items-center justify-center gap-2 text-amber-500 dark:text-amber-300">
                  <Building className="h-5 w-5" />
                  <span className="text-lg font-semibold">Carreras</span>
                </div>
                <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{stats.carreras.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur-sm transition hover:border-black/10 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10">
                <div className="mb-2 flex items-center justify-center gap-2 text-amber-500 dark:text-amber-300">
                  <Users className="h-5 w-5" />
                  <span className="text-lg font-semibold">Usuarios</span>
                </div>
                <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{stats.usuarios.toLocaleString()}</div>
              </div>
            </div>
          </section>
        )}

        {canViewCosas && (
          <section className="w-full rounded-2xl border border-border/60 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
            <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">¿Querés dejarnos un mensaje?</h3>
            <p className="mb-3 text-sm text-slate-700 dark:text-slate-200">Enviá tus dudas o sugerencias y te contactaremos.</p>
            <form className="space-y-3">
              <textarea
                placeholder="Escribí tu mensaje..."
                className="w-full rounded-lg border border-border bg-white/70 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 dark:border-white/20 dark:bg-white/10 dark:text-slate-50 dark:placeholder:text-slate-300"
                rows={3}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white/90 dark:text-slate-900 dark:hover:bg-white"
                >
                  Enviar mensaje
                </button>
              </div>
            </form>
          </section>
        )}

        {canViewCosas && (
          <footer className="w-full rounded-2xl border border-border/60 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-6 text-sm text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Categorías</h3>
                <div className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-200">
                  <Link href={route('dashboard')} className="hover:underline">Inicio</Link>
                  <Link href={route('archivos.index')} className="hover:underline">Archivos</Link>
                  <Link href={route('mis-cosas')} className="hover:underline">Mis cosas</Link>
                  <Link href={route('perfil.show')} className="hover:underline">Perfil</Link>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Contactanos</h3>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <span className="text-lg">✉</span>
                  <span>soporte@exadocs.com</span>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Sigamos conectados</h3>
                <div className="flex items-center gap-3">
                  {['IG', 'FB', 'YT', 'X'].map((label) => (
                    <div
                      key={label}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold shadow dark:bg-white dark:text-slate-900"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </footer>
        )}

      </div>
    </AppLayout>
  );
}
