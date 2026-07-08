import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
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
  AreaChart,
  Area,
} from 'recharts';
import {
  Users,
  FileText,
  BookOpen,
  Clock,
  TrendingUp,
  Award,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Estadísticas de Administración', href: route('estadisticas.index') },
];

interface CarreraChart {
  carrera: string;
  usuarios: number;
}

interface EstadoChart {
  estado: string;
  valor: number;
}

interface MateriaChart {
  nombre: string;
  vistas: number;
}

interface CarreraUsuarioChart {
  rango: string;
  usuarios: number;
}

interface ArchivoMesChart {
  mes: string;
  archivos: number;
}

interface EstadisticasProps {
  usuariosPorCarrera?: CarreraChart[];
  revisionesPorEstado?: EstadoChart[];
  topMaterias?: MateriaChart[];
  carrerasPorUsuario?: CarreraUsuarioChart[];
  archivosPorMes?: ArchivoMesChart[];
  kpis?: {
    total_usuarios: number;
    total_archivos: number;
    total_materias: number;
    archivos_pendientes: number;
  };
}

export default function Estadisticas({
  usuariosPorCarrera = [],
  revisionesPorEstado = [],
  topMaterias = [],
  carrerasPorUsuario = [],
  archivosPorMes = [],
  kpis = {
    total_usuarios: 0,
    total_archivos: 0,
    total_materias: 0,
    archivos_pendientes: 0,
  },
}: EstadisticasProps) {
  // Balanced professional palette
  const mainPalette = ['#0284c7', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
  const cellColors = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Estadísticas de Administración" />
      <div className="mx-auto max-w-[1380px] w-full px-4 py-8 md:px-6 space-y-8 animate-in fade-in duration-300">
        

        {/* 1. Quick KPIs Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* KPI: Total Users */}
          <Card className="border border-border/80 bg-card shadow-xs p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Users className="h-5.5 w-5.5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Total Estudiantes</p>
              <p className="text-xl font-extrabold text-foreground leading-none">{kpis.total_usuarios.toLocaleString()}</p>
            </div>
          </Card>

          {/* KPI: Total Files */}
          <Card className="border border-border/80 bg-card shadow-xs p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FileText className="h-5.5 w-5.5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Archivos Subidos</p>
              <p className="text-xl font-extrabold text-foreground leading-none">{kpis.total_archivos.toLocaleString()}</p>
            </div>
          </Card>

          {/* KPI: Active Subjects */}
          <Card className="border border-border/80 bg-card shadow-xs p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BookOpen className="h-5.5 w-5.5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Materias Registradas</p>
              <p className="text-xl font-extrabold text-foreground leading-none">{kpis.total_materias.toLocaleString()}</p>
            </div>
          </Card>

          {/* KPI: Pending Moderation */}
          <Card className="border border-border/80 bg-card shadow-xs p-4 flex items-center gap-4 relative overflow-hidden">
            <div className="p-3 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Clock className="h-5.5 w-5.5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Pendientes de Moderación</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-extrabold text-foreground leading-none">{kpis.archivos_pendientes.toLocaleString()}</p>
                {kpis.archivos_pendientes > 0 && (
                  <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border-0 text-[10px] py-0 px-1.5 font-bold">
                    Acción requerida
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* 2. Main Full-Width Chart */}
        <div className="w-full">
          <Card className="border border-border/80 bg-card shadow-xs p-5 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">Alumnos matriculados por carrera</h3>
            </div>
            <div className="h-72 w-full pt-2">
              {usuariosPorCarrera.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usuariosPorCarrera} margin={{ bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                    <XAxis
                      dataKey="carrera"
                      tick={false}
                      axisLine={false}
                    />
                    <YAxis tick={{ fill: 'currentColor', fontSize: 10 }} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--card-foreground))',
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                    />
                    <Bar dataKey="usuarios" name="Matrículas" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  Sin datos de matrícula de alumnos
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* 3. Distribution & Moderation Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Chart 2: Double-Major Career Distribution */}
          <Card className="border border-border/80 bg-card shadow-xs p-5 space-y-4 flex flex-col justify-between min-h-[320px]">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">Distribución de carreras por estudiante</h3>
            </div>
            <div className="h-44 w-full flex items-center justify-center relative">
              {carrerasPorUsuario.some(c => c.usuarios > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={carrerasPorUsuario}
                      dataKey="usuarios"
                      nameKey="rango"
                      cx="50%"
                      cy="50%"
                      outerRadius={55}
                      innerRadius={35}
                      paddingAngle={3}
                      label={false}
                    >
                      {carrerasPorUsuario.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={cellColors[index % cellColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 8,
                        fontSize: 10,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-muted-foreground">Sin registros de inscripción</div>
              )}
            </div>
            
            {/* Detailed legend indicator with colors */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2 mt-2 border-t border-border/40">
              {carrerasPorUsuario.map((entry, idx) => (
                <div key={entry.rango} className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: cellColors[idx % cellColors.length] }}
                    />
                    <span className="truncate max-w-[80px]">{entry.rango}</span>
                  </div>
                  <p className="text-xs font-bold text-foreground">{entry.usuarios} alumnos</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Chart 4: Review States */}
          <Card className="border border-border/80 bg-card shadow-xs p-5 space-y-4 flex flex-col justify-between min-h-[320px]">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">Estado de revisión de archivos</h3>
            </div>
            
            <div className="h-44 w-full flex items-center justify-center">
              {revisionesPorEstado.some(r => r.valor > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revisionesPorEstado}
                      dataKey="valor"
                      nameKey="estado"
                      cx="50%"
                      cy="50%"
                      outerRadius={55}
                      innerRadius={35}
                      paddingAngle={2}
                      label={false}
                    >
                      {revisionesPorEstado.map((entry, index) => (
                        <Cell key={`cell-rev-${index}`} fill={mainPalette[index % mainPalette.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 8,
                        fontSize: 10,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-muted-foreground">Sin registros de moderación</div>
              )}
            </div>

            {/* Status details legend list */}
            <div className="space-y-2 border-t border-border/40 pt-3">
              {revisionesPorEstado.map((entry, idx) => (
                <div key={entry.estado} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: mainPalette[idx % mainPalette.length] }}
                    />
                    {entry.estado}
                  </span>
                  <span className="font-bold text-foreground">{entry.valor} archivos</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 4. Top 10 Active Subjects Table */}
        {topMaterias.length > 0 && (
          <Card className="border border-border/80 bg-card shadow-xs p-5 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">Materias con mayor actividad y visitas</h3>

            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-semibold">
                    <th className="py-2.5 px-3">Asignatura / Materia</th>
                    <th className="py-2.5 px-3 text-right">Vistas Totales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {topMaterias.map((item, idx) => (
                    <tr key={item.nombre} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3 flex items-center gap-2 text-foreground">
                        <span className="font-bold text-muted-foreground w-4">#{idx + 1}</span>
                        {item.nombre}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-primary">{item.vistas.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

      </div>
    </AppLayout>
  );
}
