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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Carreras',
        href: route('carreras.index'),
    },
    {
        title: 'Crear',
        href: route('carreras.create'),
    },
];

const estados = [
    { value: 'activa', label: 'Activa' },
    { value: 'inactiva', label: 'Inactiva' },
];

interface TipoOption {
    id: number;
    nombre: string;
}

export default function Create({ tipos }: { tipos: TipoOption[] }) {
    const { data, setData, post, processing, errors } = useForm({
        tipo_carrera_id: '' as number | '',
        nombre: '',
        codigo: '',
        descripcion: '',
        estado: 'activa' as 'activa' | 'inactiva',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('carreras.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Carreras | Crear" />
            <div className="w-full max-w-3xl p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Tipo de carrera</Label>
                        <Select
                            value={
                                data.tipo_carrera_id === ''
                                    ? ''
                                    : String(data.tipo_carrera_id)
                            }
                            onValueChange={(value) =>
                                setData('tipo_carrera_id', Number(value))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccioná un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {tipos.map((tipo) => (
                                    <SelectItem key={tipo.id} value={String(tipo.id)}>
                                        {tipo.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.tipo_carrera_id && (
                            <p className="text-sm text-destructive">{errors.tipo_carrera_id}</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                            id="nombre"
                            placeholder="Ej. Licenciatura en Sistemas"
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
                            placeholder="Ej. LIC-SIS"
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
                            placeholder="Descripción breve de la carrera"
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
                        Crear carrera
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
