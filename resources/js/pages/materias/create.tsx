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
        title: 'Materias',
        href: route('materias.index'),
    },
    {
        title: 'Crear',
        href: route('materias.create'),
    },
];

const tipos = [
    { value: 'obligatoria', label: 'Obligatoria' },
    { value: 'optativa', label: 'Optativa' },
    { value: 'taller', label: 'Taller' },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        codigo: '',
        descripcion: '',
        tipo: 'obligatoria' as 'obligatoria' | 'optativa' | 'taller',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('materias.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Materias | Crear" />
            <div className="w-full max-w-3xl p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                            id="nombre"
                            placeholder="Ej. Álgebra I"
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
                            placeholder="Ej. MAT-101"
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
                            placeholder="Descripción breve de la materia"
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
                        Crear materia
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
