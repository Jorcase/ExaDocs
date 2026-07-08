import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { route } from 'ziggy-js';

interface MateriaProgreso {
    id: number;
    nombre: string;
    codigo: string;
    estado: 'cursando' | 'regular' | 'aprobada' | 'promocionada' | 'pendiente';
    nota: number | null;
    fecha_aprobacion: string | null;
}

interface ProgressModalProps {
    materia: MateriaProgreso | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ProgressModal({ materia, isOpen, onClose }: ProgressModalProps) {
    const { data, setData, post, processing, reset, errors } = useForm({
        materia_id: 0,
        estado: 'pendiente',
        nota: '' as string | number,
        fecha_aprobacion: '',
    });

    useEffect(() => {
        if (materia) {
            setData({
                materia_id: materia.id,
                estado: materia.estado,
                nota: materia.nota ?? '',
                fecha_aprobacion: materia.fecha_aprobacion ?? '',
            });
        }
    }, [materia, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('progreso.update'), {
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    if (!materia) return null;

    const showGradeAndDate = data.estado === 'aprobada' || data.estado === 'promocionada';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-xl">
                <DialogHeader className="space-y-1.5 text-left">
                    <DialogTitle className="text-lg font-bold text-card-foreground">
                        Actualizar Progreso
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {materia.nombre} ({materia.codigo})
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* Estado de la Materia */}
                    <div className="space-y-1.5">
                        <Label htmlFor="estado" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Estado actual
                        </Label>
                        <select
                            id="estado"
                            value={data.estado}
                            onChange={(e) => setData('estado', e.target.value)}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition"
                        >
                            <option value="pendiente" className="bg-card text-card-foreground">Pendiente</option>
                            <option value="cursando" className="bg-card text-card-foreground">Cursando</option>
                            <option value="regular" className="bg-card text-card-foreground">Regular</option>
                            <option value="aprobada" className="bg-card text-card-foreground">Finalizado / Aprobado</option>
                            <option value="promocionada" className="bg-card text-card-foreground">Promocionado</option>
                        </select>
                        {errors.estado && <p className="text-xs font-medium text-destructive">{errors.estado}</p>}
                    </div>

                    {showGradeAndDate && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                            {/* Nota */}
                            <div className="space-y-1.5">
                                <Label htmlFor="nota" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Calificación (Nota)
                                </Label>
                                <Input
                                    id="nota"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={data.nota}
                                    placeholder="Ej: 8"
                                    onChange={(e) => setData('nota', e.target.value === '' ? '' : Number(e.target.value))}
                                    className="focus-visible:ring-2 focus-visible:ring-primary/20 dark:focus-visible:ring-sky-500/20"
                                />
                                {errors.nota && <p className="text-xs font-medium text-destructive">{errors.nota}</p>}
                            </div>

                            {/* Fecha */}
                            <div className="space-y-1.5">
                                <Label htmlFor="fecha" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Fecha aprobación
                                </Label>
                                <Input
                                    id="fecha"
                                    type="date"
                                    value={data.fecha_aprobacion}
                                    onChange={(e) => setData('fecha_aprobacion', e.target.value)}
                                    className="focus-visible:ring-2 focus-visible:ring-primary/20 dark:focus-visible:ring-sky-500/20"
                                />
                                {errors.fecha_aprobacion && (
                                    <p className="text-xs font-medium text-destructive">{errors.fecha_aprobacion}</p>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-4 flex justify-end gap-2 border-t border-border/40">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing} className="rounded-lg">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing} className="rounded-lg bg-primary hover:bg-primary/95 text-white">
                            {processing ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
