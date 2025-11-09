<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\CarreraController;
use App\Http\Controllers\MateriaController;
use App\Http\Controllers\PlanEstudioController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    //Carrera
    Route::get('carrera', [CarreraController::class,'index'])->name('carreras.index');
    Route::get('carreras/create', [CarreraController::class, 'create'])->name('carreras.create');
    Route::post('carreras', [CarreraController::class, 'store'])->name('carreras.store');
    Route::get('carreras/edit/{carrera}', [CarreraController::class, 'edit'])->name('carreras.edit');
    Route::put('carreras/{carrera}', [CarreraController::class, 'update'])->name('carreras.update');
    Route::delete('carreras/{carrera}', [carreraController::class, 'destroy'])->name('carreras.destroy');
    //Materia
    Route::get('materia', [MateriaController::class,'index'])->name('materias.index');
    Route::get('materias/create', [MateriaController::class, 'create'])->name('materias.create');
    Route::post('materias', [MateriaController::class, 'store'])->name('materias.store');
    Route::get('materias/edit/{materia}', [MateriaController::class, 'edit'])->name('materias.edit');
    Route::put('materias/{materia}', [MateriaController::class, 'update'])->name('materias.update');
    Route::delete('materias/{materia}', [MateriaController::class, 'destroy'])->name('materias.destroy');
    //Plan Estudio
    Route::get('planes-estudio', [PlanEstudioController::class, 'index'])->name('planes-estudio.index');
    Route::get('planes-estudio/create', [PlanEstudioController::class, 'create'])->name('planes-estudio.create');
    Route::post('planes-estudio', [PlanEstudioController::class, 'store'])->name('planes-estudio.store');
    Route::get('planes-estudio/{plan}', [PlanEstudioController::class, 'show'])->name('planes-estudio.show');
    Route::get('planes-estudio/{plan}/edit', [PlanEstudioController::class, 'edit'])->name('planes-estudio.edit');
    Route::put('planes-estudio/{plan}', [PlanEstudioController::class, 'update'])->name('planes-estudio.update');
    Route::delete('planes-estudio/{plan}', [PlanEstudioController::class, 'destroy'])->name('planes-estudio.destroy');
    
});

require __DIR__.'/settings.php';
