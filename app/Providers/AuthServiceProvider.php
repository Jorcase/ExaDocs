<?php

namespace App\Providers;

use App\Models\Archivo;
use App\Policies\ArchivoPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Models\Carrera;
use App\Models\Materia;
use App\Models\Plan_Estudio;
use App\Policies\CarreraPolicy;
use App\Policies\MateriaPolicy;
use App\Policies\PlanEstudioPolicy;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Archivo::class => ArchivoPolicy::class,
        Carrera::class => CarreraPolicy::class,
        Materia::class => MateriaPolicy::class,
        Plan_Estudio::class => PlanEstudioPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
