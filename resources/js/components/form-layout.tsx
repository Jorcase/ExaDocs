import React, { type FormEvent } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

interface FormLayoutProps {
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    processing: boolean;
    cancelHref: string;
    submitLabel?: string;
    children: React.ReactNode; // Contenido principal del formulario (columna izquierda o columna única)
    sidebar?: React.ReactNode; // Contenido lateral del formulario (columna derecha opcional)
    maxWidth?: string; // Ancho máximo personalizado para formularios sin barra lateral (ej: "max-w-4xl")
}

export function FormLayout({
    onSubmit,
    processing,
    cancelHref,
    submitLabel = 'Guardar cambios',
    children,
    sidebar,
    maxWidth = 'max-w-2xl',
}: FormLayoutProps) {
    if (sidebar) {
        return (
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column Card */}
                    <Card className="rounded-xl border border-border/80 bg-card text-card-foreground shadow-xs p-6">
                        {children}
                    </Card>

                    {/* Right Column Card */}
                    <Card className="rounded-xl border border-border/80 bg-card text-card-foreground shadow-xs p-6">
                        {sidebar}
                    </Card>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
                    <Link href={cancelHref}>
                        <Button type="button" variant="outline" className="rounded-lg">
                            Cancelar
                        </Button>
                    </Link>
                    <Button disabled={processing} type="submit" className="rounded-lg">
                        {submitLabel}
                    </Button>
                </div>
            </form>
        );
    }

    return (
        <div className="flex justify-center">
            <form onSubmit={onSubmit} className={`w-full ${maxWidth} space-y-6`}>
                {/* Main Single Card */}
                <Card className="rounded-xl border border-border/80 bg-card text-card-foreground shadow-xs p-6">
                    {children}
                </Card>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
                    <Link href={cancelHref}>
                        <Button type="button" variant="outline" className="rounded-lg">
                            Cancelar
                        </Button>
                    </Link>
                    <Button disabled={processing} type="submit" className="rounded-lg">
                        {submitLabel}
                    </Button>
                </div>
            </form>
        </div>
    );
}
