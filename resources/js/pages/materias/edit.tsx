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

interface Materia {
    id: number;
    nombre: string;
    codigo: string;
    descripcion?: string | null;
    tipo: 'obligatoria' | 'optativa' | 'taller';
}

const tipos = [
    { value: 'obligatoria', label: 'Obligatoria' },
    { value: 'optativa', label: 'Optativa' },
    { value: 'taller', label: 'Taller' },
];

export default function Edit({ materia }: { materia: Materia }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Materias',
            href: route('materias.index'),
        },
        {
            title: `Editar ${materia.nombre}`,
            href: route('materias.edit', materia.id),
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        nombre: materia.nombre,
        codigo: materia.codigo,
        descripcion: materia.descripcion ?? '',
        tipo: materia.tipo,
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(route('materias.update', materia.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Materias | Editar ${materia.nombre}`} />
            <div className="w-full max-w-3xl p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <Label>Tipo</Label>
                        <Select
                            value={data.tipo}
                            onValueChange={(value) =>
                                setData('tipo', value as 'obligatoria' | 'optativa' | 'taller')
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccioná un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {tipos.map((tipo) => (
                                    <SelectItem key={tipo.value} value={tipo.value}>
                                        {tipo.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.tipo && (
                            <p className="text-sm text-destructive">{errors.tipo}</p>
                        )}
                    </div>

                    <Button disabled={processing} type="submit">
                        Actualizar materia
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
