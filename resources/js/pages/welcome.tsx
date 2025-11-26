import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import Carousel from '@/components/carousel';
import { Sparkles, ArrowRight } from 'lucide-react';

interface PageProps extends SharedData {
  carouselImages?: string[];
}

export default function Welcome() {
  const { auth, carouselImages = [] } = usePage<PageProps>().props;

  return (
    <>
      <Head title="Welcome">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
      </Head>

      <div
        className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0b0c0f] via-[#0f1117] to-[#0b0c0f] text-white"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(11,12,15,0.68), rgba(15,17,23,0.72)), url('/images/welcome.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.08),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.07),transparent_35%)]" />
        </div>
        <header className="mx-auto flex w-full max-w-6xl items-center justify-end px-6 py-6 text-sm">
          {auth.user ? (
            <Link
              href={dashboard()}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium backdrop-blur hover:border-white/25"
            >
              Ir al dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href={login()}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 hover:border-white/25"
              >
                Iniciar sesión
              </Link>
              <Link
                href={register()}
                className="inline-flex items-center gap-2 rounded-full bg-white text-[#0f1117] px-4 py-2 text-sm font-semibold hover:bg-slate-100"
              >
                Crear cuenta
              </Link>
            </div>
          )}
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-12 lg:flex-row lg:items-center">
          <div className="w-full lg:w-3/5">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
              <Carousel
                images={carouselImages}
                autoPlay
                interval={4500}
                pauseOnHover
              />
            </div>
          </div>

          <div className="w-full space-y-5 lg:w-2/5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.08em] text-white/80">
              <Sparkles className="h-3.5 w-3.5" />
              PAW 2025
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Bienvenido a ExaDocs
              </h1>
              <p className="text-base text-white/70">
                Comparte, revisa y aprende con nuestro repositorio de apuntes y archivos académicos.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-sm font-semibold text-white/90">Archivos</p>
                <p className="text-xs text-white/60">Moderación y estados para asegurar calidad.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-sm font-semibold text-white/90">Colaboración</p>
                <p className="text-xs text-white/60">Comentarios, valoraciones y guardados rápidos.</p>
              </div>
            </div>
            {!auth.user && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={register()}
                  className="inline-flex items-center gap-2 rounded-full bg-white text-[#0f1117] px-4 py-2 text-sm font-semibold hover:bg-slate-100"
                >
                  Comenzar gratis
                </Link>
                <Link
                  href={login()}
                  className="inline-flex items-center gap-2 text-sm font-medium text-white/80 underline-offset-4 hover:underline"
                >
                  Ya tengo cuenta
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
