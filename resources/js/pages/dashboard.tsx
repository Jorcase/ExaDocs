import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
];

const estadoVariant = (
    nombre?: string
): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (!nombre) return 'secondary';
    const value = nombre.toLowerCase();
    if (value.includes('pend')) return 'outline';
    if (value.includes('rech')) return 'destructive';
    if (value.includes('acept') || value.includes('aprob') || value.includes('final')) return 'default';
    return 'secondary';
};

interface StatCard {
    label: string;
    value: number;
    helper?: string;
}

interface RecentArchivo {
    id: number;
    titulo: string;
    materia?: string | null;
    estado?: string | null;
    autor?: string | null;
    publicado_en?: string | null;
}

interface RecentProfile {
    id: number;
    usuario?: string | null;
    email?: string | null;
    carrera?: string | null;
    creado_en?: string | null;
}

interface DashboardProps {
    stats: StatCard[];
    recentArchivos: RecentArchivo[];
    recentProfiles: RecentProfile[];
}

export default function Dashboard({ stats, recentArchivos, recentProfiles }: DashboardProps) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="m-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.label}>
                            <CardContent className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                    {stat.label}
                                </p>
                                <p className="text-3xl font-semibold">{stat.value}</p>
                                {stat.helper && (
                                    <p className="text-sm text-muted-foreground">{stat.helper}</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Archivos recientes</CardTitle>
                                <Link href={route('archivos.index')} className="text-sm font-medium text-primary">
                                    Ver todos
                                </Link>
                            </div>
                            {recentArchivos.length > 0 ? (
                                <div className="space-y-3">
                                    {recentArchivos.map((archivo) => (
                                        <div
                                            key={archivo.id}
                                            className="rounded border border-border p-3 dark:border-border/70"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div>
                                                    <p className="font-semibold">{archivo.titulo}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {archivo.materia ?? 'Sin materia'} · {archivo.autor ?? 'Sin autor'}
                                                    </p>
                                                </div>
                                                <Badge variant={estadoVariant(archivo.estado)}>
                                                    {archivo.estado ?? 'Sin estado'}
                                                </Badge>
                                            </div>
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                {archivo.publicado_en ?? 'Fecha no disponible'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Todavía no se subieron archivos.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Perfiles recientes</CardTitle>
                                <Link href={route('perfiles.index')} className="text-sm font-medium text-primary">
                                    Ver todos
                                </Link>
                            </div>
                            {recentProfiles.length > 0 ? (
                                <div className="space-y-3">
                                    {recentProfiles.map((profile) => (
                                        <div key={profile.id} className="space-y-1 rounded border border-border p-3 dark:border-border/70">
                                            <p className="font-semibold">{profile.usuario ?? 'Usuario sin nombre'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {profile.email ?? 'Sin email'} · {profile.carrera ?? 'Sin carrera'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {profile.creado_en ?? 'Fecha no disponible'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Todavía no hay perfiles registrados.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
