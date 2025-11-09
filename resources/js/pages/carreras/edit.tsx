import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { type FormEvent } from 'react';

interface Carrera {
    id: number;
    nombre: string;
    codigo: string;
    descripcion?: string | null;
    estado: 'activa' | 'inactiva';
}

const estados = [
    { value: 'activa', label: 'Activa' },
    { value: 'inactiva', label: 'Inactiva' },
];

export default function Edit({ carrera }: { carrera: Carrera }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Carreras',
            href: route('carreras.index'),
        },
        {
            title: `Editar ${carrera.nombre}`,
            href: route('carreras.edit', carrera.id),
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        nombre: carrera.nombre,
        codigo: carrera.codigo,
        descripcion: carrera.descripcion ?? '',
        estado: carrera.estado as 'activa' | 'inactiva',
    });

    const handleUpdate = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(route('carreras.update', carrera.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Carreras | Editar ${carrera.nombre}`} />
            <div className="w-full max-w-3xl p-4">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                            id="nombre"
                            value={data.nombre}
                            onChange={(e) => setData('nombre', e.target.value)}
                        />
                        {errors.nombre && (
                            <p className="text-sm text-destructive">{errors.nombre}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="codigo">Código</Label>
                        <Input
                            id="codigo"
                            value={data.codigo}
                            onChange={(e) => setData('codigo', e.target.value)}
                        />
                        {errors.codigo && (
                            <p className="text-sm text-destructive">{errors.codigo}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea
                            id="descripcion"
                            value={data.descripcion}
                            onChange={(e) => setData('descripcion', e.target.value)}
                        />
                        {errors.descripcion && (
                            <p className="text-sm text-destructive">{errors.descripcion}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Estado</Label>
                        <Select
                            value={data.estado}
                            onValueChange={(value) =>
                                setData('estado', value as 'activa' | 'inactiva')
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccioná un estado" />
                            </SelectTrigger>
                            <SelectContent>
                                {estados.map((estado) => (
                                    <SelectItem key={estado.value} value={estado.value}>
                                        {estado.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.estado && (
                            <p className="text-sm text-destructive">{errors.estado}</p>
                        )}
                    </div>

                    <Button disabled={processing} type="submit">
                        Actualizar carrera
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
