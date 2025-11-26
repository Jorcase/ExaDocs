import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Estadísticas', href: route('estadisticas.index') },
];

type CarreraChart = { carrera: string; usuarios: number };
type EstadoChart = { estado: string; valor: number };
type MateriaChart = { nombre: string; vistas: number };

export default function Estadisticas({
  usuariosPorCarrera = [],
  revisionesPorEstado = [],
  topMaterias = [],
}: {
  usuariosPorCarrera?: CarreraChart[];
  revisionesPorEstado?: EstadoChart[];
  topMaterias?: MateriaChart[];
}) {
  const palette = ['#38bdf8', '#22c55e', '#f97316', '#8b5cf6', '#ef4444'];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Estadísticas" />
      <section className="m-4 space-y-3 rounded-2xl border border-border/60 bg-gradient-to-r from-slate-100 via-slate-50 to-white p-5 text-slate-900 shadow-lg backdrop-blur dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-slate-50">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Estadísticas</h1>
          <p className="text-sm text-slate-700 dark:text-slate-200">Actividad reciente y salud de la plataforma.</p>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-white/70 p-4 dark:bg-white/5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Usuarios por carrera</p>
              <span className="text-xs text-muted-foreground">Distribución actual</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usuariosPorCarrera}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
                  <XAxis
                    dataKey="carrera"
                    stroke="currentColor"
                    tick={false}
                    axisLine={false}
                  />
                  <YAxis stroke="currentColor" />
                  <Tooltip contentStyle={{ background: '#0f172a', color: 'white', borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="usuarios" name="Usuarios" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-white/70 p-4 dark:bg-white/5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Estado de revisiones</p>
              <span className="text-xs text-muted-foreground">Distribución actual</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={revisionesPorEstado} dataKey="valor" nameKey="estado" outerRadius={80} label>
                    {revisionesPorEstado.map((entry, index) => (
                      <Cell key={entry.estado} fill={palette[index % palette.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#3e5a9bff', color: 'white', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-white/70 p-4 dark:bg-white/5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Materias más vistas</p>
              <span className="text-xs text-muted-foreground">Últimos 30 días</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topMaterias}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
                  <XAxis 
                    dataKey="nombre" 
                    stroke="currentColor"
                    tick={false}
                    axisLine={false} />
                  <YAxis stroke="currentColor" />
                  <Tooltip contentStyle={{ background: '#0f172a', color: 'white', borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="vistas" name="Vistas" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
