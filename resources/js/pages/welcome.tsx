import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import Carousel from '@/components/carousel';
import AppLogoIcon from '@/components/app-logo-icon';
import { Sparkles, ArrowRight, Users, ShieldCheck } from 'lucide-react';

interface PageProps extends SharedData {
  carouselImages?: string[];
}

export default function Welcome() {
  const { auth, carouselImages = [] } = usePage<PageProps>().props;

  return (
    <>
      <Head title="Bienvenido a ExaDocs">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
      </Head>

      <div
        className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-[#0b0c0f] via-[#0f1117] to-[#0b0c0f] text-white flex flex-col justify-between"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(11,12,15,0.72), rgba(15,17,23,0.78)), url('/images/welcome.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Glow Effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.08),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.07),transparent_35%)]" />
        </div>

        {/* Header */}
        <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/15 backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:bg-white/10">
              <AppLogoIcon className="size-6 fill-current text-white" />
            </div>
            <span className="text-md font-bold tracking-tight text-white/90 group-hover:text-white transition-colors duration-150">ExaDocs</span>
          </Link>

          {auth.user ? (
            <Link
              href={dashboard()}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold backdrop-blur hover:bg-white/10 hover:border-white/25 transition-all duration-150"
            >
              Ir al dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href={login()}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white/90 hover:border-white/25 hover:bg-white/10 transition-all duration-150"
              >
                Iniciar sesión
              </Link>
              <Link
                href={register()}
                className="inline-flex items-center gap-2 rounded-full bg-white text-[#0f1117] px-5 py-2 text-sm font-bold hover:bg-slate-100 transition-all duration-150"
              >
                Crear cuenta
              </Link>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 py-12 lg:flex-row lg:items-center">
          {/* Left Column: Carousel */}
          <div className="w-full lg:w-[65%]">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="overflow-hidden rounded-2xl">
                <Carousel
                  images={carouselImages}
                  autoPlay
                  interval={4500}
                  pauseOnHover
                />
              </div>
            </div>
          </div>

          {/* Right Column: Hero copy */}
          <div className="w-full space-y-6 lg:w-[35%] lg:pl-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
              <Sparkles className="h-3 w-3" />
              PAW 2025
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl text-white">
                Tu conocimiento, <br />
                <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  en un solo lugar.
                </span>
              </h1>
              <p className="text-sm text-white/60 leading-relaxed max-w-lg">
                ExaDocs es la plataforma definitiva para compartir, validar y colaborar con apuntes, exámenes y resúmenes académicos de toda la comunidad estudiantil.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
              <div className="rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-sky-400" />
                  <p className="text-xs font-bold uppercase tracking-wider text-white/95">Archivos Validados</p>
                </div>
                <p className="text-xs text-white/50 leading-normal">Moderación activa y control de calidad para asegurar apuntes excelentes.</p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Users className="h-4.5 w-4.5 text-indigo-400" />
                  <p className="text-xs font-bold uppercase tracking-wider text-white/95">Comunidad Activa</p>
                </div>
                <p className="text-xs text-white/50 leading-normal">Comentarios, valoraciones y favoritos para aprender juntos de forma social.</p>
              </div>
            </div>

            {!auth.user && (
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/5">
                <Link
                  href={register()}
                  className="inline-flex items-center gap-2 rounded-full bg-white text-[#0f1117] px-6 py-3 text-sm font-bold hover:bg-slate-100 transition-all duration-150 hover:shadow-lg"
                >
                  Comenzar gratis <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={login()}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white transition-colors duration-150"
                >
                  Ya tengo cuenta
                </Link>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 py-6 text-center text-[10px] font-medium tracking-wider uppercase text-white/30">
          © {new Date().getFullYear()} ExaDocs. Diseñado con fines académicos.
        </footer>
      </div>
    </>
  );
}
