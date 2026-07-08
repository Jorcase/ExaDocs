import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import {
  Eye,
  Star,
  MessageSquare,
  Bookmark,
  BookOpen,
  Building,
  Users,
  FileText,
  GraduationCap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  Sparkles,
} from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import React, { useState } from 'react';

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
  relevancia_estado?: 'cursando' | 'regular' | 'pendiente' | 'completada';
  tipo?: string | null;
}

interface ProgresoStats {
  carrera_nombre: string;
  aprobadas: number;
  cursando: number;
  regulares: number;
  total: number;
}

interface DashboardProps {
  popularArchivos: ArchivoCard[];
  recentArchivos: ArchivoCard[];
  recommendedArchivos: ArchivoCard[];
  userProgresoStats: ProgresoStats | null;
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
  const isImage = (path?: string | null) => !!path && /\.(png|jpe?g|gif|webp)$/i.test(path);

  const src = archivo.thumbnail_path
    ? `/storage/${archivo.thumbnail_path}`
    : isImage(archivo.file_path)
    ? `/storage/${archivo.file_path}`
    : null;

  return (
    <Link
      href={route('archivos.show', archivo.id)}
      className="group block overflow-hidden rounded-xl border border-border/80 bg-card text-card-foreground shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-muted/20 border-b border-border/50 relative">
        {src ? (
          <img
            src={src}
            alt={archivo.titulo}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-103"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#002045] to-[#0061a5] text-white p-4 text-center select-none transition-transform duration-500 group-hover:scale-103">
            <BookOpen className="h-10 w-10 opacity-80 mb-1.5 animate-pulse" />
            <span className="text-[9px] uppercase font-black tracking-widest opacity-95 truncate max-w-full px-2">
              {archivo.tipo || 'Documento'}
            </span>
          </div>
        )}

        {/* Priority recommendation badges */}
        {archivo.relevancia_estado && (
          <div className="absolute top-2.5 left-2.5 z-10">
            {archivo.relevancia_estado === 'cursando' && (
              <Badge className="bg-emerald-500/90 text-white border-0 hover:bg-emerald-600 text-[10px] font-bold py-0.5 px-2 flex items-center gap-1 shadow-xs">
                <Clock className="h-3 w-3" /> Cursando actualmente
              </Badge>
            )}
            {archivo.relevancia_estado === 'regular' && (
              <Badge className="bg-amber-500/90 text-white border-0 hover:bg-amber-600 text-[10px] font-bold py-0.5 px-2 flex items-center gap-1 shadow-xs">
                <Clock className="h-3 w-3" /> Materia regular
              </Badge>
            )}
            {archivo.relevancia_estado === 'pendiente' && (
              <Badge className="bg-indigo-500/90 text-white border-0 hover:bg-indigo-600 text-[10px] font-bold py-0.5 px-2 flex items-center gap-1 shadow-xs">
                 Siguiente en tu plan
              </Badge>
            )}
            {archivo.relevancia_estado === 'completada' && (
              <Badge variant="secondary" className="text-[10px] font-bold py-0.5 px-2">
                Materia aprobada
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 p-3.5">
        <p className="line-clamp-2 text-xs font-bold leading-normal text-foreground group-hover:text-primary transition-colors min-h-[32px]">
          {archivo.titulo}
        </p>
        <p className="text-[11px] text-muted-foreground truncate font-medium">
          {archivo.materia ?? 'Sin materia'} · {archivo.autor ?? 'Anónimo'}
        </p>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40 font-semibold">
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3 w-3" /> {archivo.visitas ?? 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <Bookmark className="h-3 w-3" /> {archivo.saves ?? 0}
          </span>
          <span className="inline-flex items-center gap-1 text-amber-500">
            <Star className="h-3 w-3 fill-current" />
            {archivo.valoraciones_avg !== undefined && archivo.valoraciones_avg !== null
              ? Number(archivo.valoraciones_avg).toFixed(1)
              : '—'}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> {archivo.comentarios ?? 0}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard({
  popularArchivos = [],
  recentArchivos = [],
  recommendedArchivos = [],
  userProgresoStats = null,
  canViewCosas = true,
  stats,
}: DashboardProps) {
  const { can } = usePermissions();
  const canInteractArchivos = can('interaction_archivos');
  const [feedbackBody, setFeedbackBody] = useState('');

  // Calculate percentage of approved subjects
  const progressPercent = userProgresoStats
    ? Math.round((userProgresoStats.aprobadas / Math.max(userProgresoStats.total, 1)) * 100)
    : 0;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="mx-auto max-w-[1380px] w-full px-4 py-8 md:px-6 space-y-8 animate-in fade-in duration-300">
        
        {/* Warning: Profile Incomplete */}
        {!canViewCosas && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-500/25 dark:bg-amber-950/20 shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold text-amber-800 dark:text-amber-400">Completá tu perfil académico</CardTitle>
              <CardDescription className="text-xs text-amber-700/90 dark:text-amber-300/80 leading-normal">
                Para desbloquear recomendaciones de archivos según tu plan de estudio, marcar archivos favoritos y participar en la comunidad de estudiantes, primero completá tu carrera en tu perfil.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Link href={route('perfil.edit')}>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs">
                  Completar perfil ahora
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Hero Section & Career Progress Wrapper */}
        <div className="grid gap-6 lg:grid-cols-12 items-stretch">
          
          {/* Dashboard Hero Header */}
          <div className={userProgresoStats ? "lg:col-span-7 flex" : "lg:col-span-12 flex"}>
            <Card className="border border-border/80 bg-card shadow-xs relative overflow-hidden flex flex-col justify-between p-6 flex-1">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-xl" />
              
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
                  Bienvenido a ExaDocs
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground max-w-xl leading-relaxed">
                  Explorá apuntes de materias, compartí tus resúmenes y colaborá en el repositorio académico de tu carrera.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-6">
                {canInteractArchivos && (
                  <Link href={route('archivos.create')}>
                    <Button className="bg-[#0061a5] hover:bg-[#004b80] text-white dark:bg-[#9fcaff] dark:text-neutral-950 dark:hover:bg-sky-400 font-bold text-xs h-9.5">
                      Subir archivo
                    </Button>
                  </Link>
                )}
                <Link href={route('archivos.index')}>
                  <Button variant="outline" className="font-bold text-xs h-9.5">
                    Ver archivos disponibles
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Academic Career Progress Card */}
          {userProgresoStats && (
            <div className="lg:col-span-5 flex">
              <Card className="border border-border/80 bg-card shadow-xs flex flex-col p-5 flex-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tu Carrera</span>
                    <h3 className="text-sm font-bold text-foreground truncate max-w-[260px]" title={userProgresoStats.carrera_nombre}>
                      {userProgresoStats.carrera_nombre}
                    </h3>
                  </div>
                  <GraduationCap className="h-6 w-6 text-primary shrink-0 opacity-80" />
                </div>

                {/* Progress bar visual (centered in height) */}
                <div className="flex-1 flex flex-col justify-center py-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Progreso del plan</span>
                      <span className="text-primary">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 border border-border/20 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Progress Details Grid */}
                <div className="grid grid-cols-4 gap-2 text-center border-t border-border/40 pt-3.5">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {userProgresoStats.aprobadas}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-semibold">Aprobadas</p>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center justify-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {userProgresoStats.cursando}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-semibold">Cursando</p>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-amber-600 dark:text-amber-500 flex items-center justify-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {userProgresoStats.regulares}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-semibold">Regulares</p>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-foreground">
                      {Math.max(userProgresoStats.total - userProgresoStats.aprobadas - userProgresoStats.cursando - userProgresoStats.regulares, 0)}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-semibold">Pendientes</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* 1. Recommended Files Carousel (Academic Relevance) */}
        {canViewCosas && recommendedArchivos.length > 0 && (
          <section className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div className="space-y-0.5">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                   Recomendados para tu plan
                </h2>
              </div>
              <Link href={route('archivos.index')} className="text-xs font-bold text-primary dark:text-sky-300 hover:underline flex items-center gap-1 shrink-0">
                Ver todos <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="relative">
              <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={16}
                slidesPerView={1.1}
                breakpoints={{
                  640: { slidesPerView: 2.2 },
                  1024: { slidesPerView: 3.2 },
                  1280: { slidesPerView: 4 },
                }}
                className="relative z-10"
              >
                {recommendedArchivos.map((archivo) => (
                  <SwiperSlide key={`rec-${archivo.id}`}>
                    <ArchivoSlide archivo={archivo} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </section>
        )}

        {/* 2. Popular Files Section */}
        {canViewCosas && popularArchivos.length > 0 && (
          <section className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div className="space-y-0.5">
                <h2 className="text-xl font-bold text-foreground">Más populares de la comunidad</h2>
              </div>
              <Link href={route('archivos.index')} className="text-xs font-bold text-primary dark:text-sky-300 hover:underline flex items-center gap-1 shrink-0">
                Ver todos <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="relative">
              <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={16}
                slidesPerView={1.1}
                breakpoints={{
                  640: { slidesPerView: 2.2 },
                  1024: { slidesPerView: 3.2 },
                  1280: { slidesPerView: 4 },
                }}
                className="relative z-10"
              >
                {popularArchivos.map((archivo) => (
                  <SwiperSlide key={`pop-${archivo.id}`}>
                    <ArchivoSlide archivo={archivo} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </section>
        )}

        {/* 3. Recent Uploads Section */}
        {recentArchivos.length > 0 && (
          <section className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div className="space-y-0.5">
                <h2 className="text-xl font-bold text-foreground">Cargados recientemente</h2>
              </div>
              <Link href={route('archivos.index')} className="text-xs font-bold text-primary dark:text-sky-300 hover:underline flex items-center gap-1 shrink-0">
                Ver todos <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="relative">
              <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={16}
                slidesPerView={1.1}
                breakpoints={{
                  640: { slidesPerView: 2.2 },
                  1024: { slidesPerView: 3.2 },
                  1280: { slidesPerView: 4 },
                }}
                className="relative z-10"
              >
                {recentArchivos.map((archivo) => (
                  <SwiperSlide key={`rec-new-${archivo.id}`}>
                    <ArchivoSlide archivo={archivo} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </section>
        )}

        {/* ExaDocs Platform Stats Banner */}
        {stats && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
              Estadísticas del repositorio
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              
              <Card className="border border-border/70 bg-card shadow-xs p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Archivos compartidos</p>
                  <p className="text-xl font-extrabold text-foreground">{stats.archivos.toLocaleString()}</p>
                </div>
              </Card>

              <Card className="border border-border/70 bg-card shadow-xs p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Materias activas</p>
                  <p className="text-xl font-extrabold text-foreground">{stats.materias.toLocaleString()}</p>
                </div>
              </Card>

              <Card className="border border-border/70 bg-card shadow-xs p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Carreras integradas</p>
                  <p className="text-xl font-extrabold text-foreground">{stats.carreras.toLocaleString()}</p>
                </div>
              </Card>

              <Card className="border border-border/70 bg-card shadow-xs p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Usuarios registrados</p>
                  <p className="text-xl font-extrabold text-foreground">{stats.usuarios.toLocaleString()}</p>
                </div>
              </Card>

            </div>
          </section>
        )}

        {/* Feedback Quick Form */}
        <Card className="border border-border/80 bg-card shadow-xs p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">¿Querés dejarnos un mensaje?</h3>
            <p className="text-xs text-muted-foreground leading-normal">
              Contanos tus dudas, comentarios o ideas para mejorar la plataforma de apuntes.
            </p>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
            <Textarea
              placeholder="Escribí tu mensaje aquí..."
              value={feedbackBody}
              onChange={(e) => setFeedbackBody(e.target.value)}
              className="w-full text-xs min-h-[72px] resize-none"
            />
            <div className="flex justify-end">
              <Button size="sm" disabled={!feedbackBody.trim()} className="font-semibold text-xs gap-1.5 h-8.5">
                <Send className="h-3.5 w-3.5" /> Enviar mensaje
              </Button>
            </div>
          </form>
        </Card>

        {/* Global Premium Footer */}
        <footer className="rounded-xl border border-border/60 bg-card p-6 text-xs text-muted-foreground shadow-xs">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground">Navegación</h3>
              <div className="flex flex-col gap-1.5 font-medium">
                <Link href={route('dashboard')} className="hover:text-primary transition-colors">Inicio / Dashboard</Link>
                <Link href={route('archivos.index')} className="hover:text-primary transition-colors">Repositorio de Archivos</Link>
                <Link href={route('mis-cosas')} className="hover:text-primary transition-colors">Mis Apuntes y Guardados</Link>
                <Link href={route('perfil.show')} className="hover:text-primary transition-colors">Mi Perfil Académico</Link>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground">Soporte Técnico</h3>
              <p className="leading-relaxed">
                Si encontrás algún error en las previsualizaciones o querés sugerir una nueva funcionalidad:
              </p>
              <div className="flex items-center gap-2 font-semibold text-foreground pt-1">
                <span>✉</span>
                <span className="hover:underline cursor-pointer">soporte@exadocs.com</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground">Redes Sociales</h3>
              <div className="flex items-center gap-2.5">
                {['Instagram', 'Facebook', 'X', 'GitHub'].map((label) => (
                  <Badge key={label} variant="outline" className="cursor-pointer hover:bg-muted font-bold text-[10px] py-0.5 px-2">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </div>
    </AppLayout>
  );
}
