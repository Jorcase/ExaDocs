<?php

namespace App\Http\Controllers;

use App\Models\Archivo;
use App\Models\Carrera;
use App\Models\Materia;
use App\Models\Plan_Estudio;
use App\Models\UserProfile;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            [
                'label' => 'Archivos',
                'value' => Archivo::count(),
                'helper' => 'Total de archivos subidos',
            ],
            [
                'label' => 'Carreras',
                'value' => Carrera::count(),
                'helper' => 'Carreras registrados',
            ],
            [
                'label' => 'Materias',
                'value' => Materia::count(),
                'helper' => 'Asignaturas disponibles',
            ],
            [
                'label' => 'Planes de estudio',
                'value' => Plan_Estudio::count(),
                'helper' => 'Planes de estudio vigentes',
            ],
        ];

        $recentArchivos = Archivo::with(['autor', 'estado', 'materia'])
            ->orderByDesc('publicado_en')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn (Archivo $archivo) => [
                'id' => $archivo->id,
                'titulo' => $archivo->titulo,
                'materia' => $archivo->materia->nombre ?? null,
                'estado' => $archivo->estado->nombre ?? null,
                'autor' => $archivo->autor->name ?? null,
                'publicado_en' => $archivo->publicado_en
                    ? $archivo->publicado_en->format('d/m/Y H:i')
                    : $archivo->created_at?->format('d/m/Y H:i'),
            ]);

        $recentProfiles = UserProfile::with(['user', 'carrera'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn (UserProfile $profile) => [
                'id' => $profile->id,
                'usuario' => $profile->user->name ?? null,
                'email' => $profile->user->email ?? null,
                'carrera' => $profile->carrera->nombre ?? null,
                'creado_en' => $profile->created_at?->format('d/m/Y H:i'),
            ]);

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentArchivos' => $recentArchivos,
            'recentProfiles' => $recentProfiles,
        ]);
    }
}
