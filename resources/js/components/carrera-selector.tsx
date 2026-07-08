import { usePage, router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, GraduationCap, Plus } from 'lucide-react';
import { route } from 'ziggy-js';

export function CarreraSelector() {
    const { auth } = usePage<SharedData>().props;

    const carreras = auth.carreras || [];
    const activeCarreraId = auth.active_carrera_id;

    const activeCarrera = carreras.find((c) => c.id === activeCarreraId);

    const handleSelect = (id: number) => {
        router.post(route('active-carrera.store'), { carrera_id: id }, {
            preserveScroll: true,
        });
    };

    if (carreras.length === 0) {
        return (
            <Button variant="ghost" className="h-9 gap-2 text-white/70 dark:text-muted-foreground cursor-default hover:bg-transparent">
                <GraduationCap className="h-4 w-4 text-white/70 dark:text-muted-foreground" />
                <span>Sin Carrera</span>
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="h-9 gap-1.5 px-3 font-semibold text-white/80 hover:bg-white/15 hover:text-white dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10 rounded-lg transition flex items-center justify-center focus:outline-none"
                >
                    <GraduationCap className="h-4 w-4 text-white/90 dark:text-blue-400" />
                    <span className="text-sm truncate max-w-[180px] md:max-w-[260px]">
                        {activeCarrera?.codigo|| 'Seleccionar carrera'}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-80 dark:opacity-60" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 mt-1 rounded-xl shadow-lg border border-border bg-white dark:bg-neutral-950">
                {carreras.map((carrera) => (
                    <DropdownMenuItem
                        key={carrera.id}
                        onClick={() => handleSelect(carrera.id)}
                        className={`flex items-center justify-between cursor-pointer px-3 py-2 rounded-lg text-sm transition-colors ${
                            carrera.id === activeCarreraId
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300 font-semibold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-900'
                        }`}
                    >
                        <span className="truncate">{carrera.nombre}</span>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="my-1 border-t border-border/60" />
                <DropdownMenuItem
                    asChild
                    className="flex items-center gap-2 cursor-pointer px-3 py-2 text-xs font-semibold text-primary dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-neutral-900 rounded-lg"
                >
                    <a href={route('perfil.edit')} className="w-full">
                        <Plus className="h-3.5 w-3.5" />
                        <span>Agregar otra carrera</span>
                    </a>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
