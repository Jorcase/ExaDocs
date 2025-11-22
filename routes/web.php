<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CarreraController;
use App\Http\Controllers\MateriaController;
use App\Http\Controllers\PlanEstudioController;
use App\Http\Controllers\TipoCarreraController;
use App\Http\Controllers\TipoArchivoController;
use App\Http\Controllers\EstadoArchivoController;
use App\Http\Controllers\ArchivoController;
use App\Http\Controllers\HistorialRevisionController;
use App\Http\Controllers\ReporteContenidoController;
use App\Http\Controllers\ComentarioController;
use App\Http\Controllers\ValoracionController;
use App\Http\Controllers\NotificacionController;
use App\Http\Controllers\AuditoriaController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Tipos de carrera
    Route::get('tipo-carreras', [TipoCarreraController::class, 'index'])->name('tipo-carreras.index')->can('view_tipocarrera');
    Route::get('tipo-carreras/create', [TipoCarreraController::class, 'create'])->name('tipo-carreras.create')->can('view_tipocarrera');
    Route::post('tipo-carreras', [TipoCarreraController::class, 'store'])->name('tipo-carreras.store')->can('view_tipocarrera');
    Route::get('tipo-carreras/{tipoCarrera}', [TipoCarreraController::class, 'show'])->name('tipo-carreras.show')->can('view_tipocarrera');
    Route::get('tipo-carreras/edit/{tipoCarrera}', [TipoCarreraController::class, 'edit'])->name('tipo-carreras.edit')->can('view_tipocarrera');
    Route::put('tipo-carreras/{tipoCarrera}', [TipoCarreraController::class, 'update'])->name('tipo-carreras.update')->can('view_tipocarrera');
    Route::delete('tipo-carreras/{tipoCarrera}', [TipoCarreraController::class, 'destroy'])->name('tipo-carreras.destroy')->can('view_tipocarrera');

    // Carreras
    Route::get('carrera', [CarreraController::class, 'index'])->name('carreras.index')->can('view_catalogos');
    Route::get('carreras/create', [CarreraController::class, 'create'])->name('carreras.create');
    Route::post('carreras', [CarreraController::class, 'store'])->name('carreras.store');
    Route::get('carreras/edit/{carrera}', [CarreraController::class, 'edit'])->name('carreras.edit');
    Route::put('carreras/{carrera}', [CarreraController::class, 'update'])->name('carreras.update');
    Route::delete('carreras/{carrera}', [CarreraController::class, 'destroy'])->name('carreras.destroy');
    Route::get('carreras/report', [CarreraController::class, 'generateReport'])->name('carreras.report');
    Route::get('carreras/export', [CarreraController::class, 'exportCarreras'])->name('carreras.export');
    
    // Materias
    Route::get('materia', [MateriaController::class, 'index'])->name('materias.index');
    Route::get('materias/create', [MateriaController::class, 'create'])->name('materias.create');
    Route::post('materias', [MateriaController::class, 'store'])->name('materias.store');
    Route::get('materias/edit/{materia}', [MateriaController::class, 'edit'])->name('materias.edit');
    Route::put('materias/{materia}', [MateriaController::class, 'update'])->name('materias.update');
    Route::delete('materias/{materia}', [MateriaController::class, 'destroy'])->name('materias.destroy');
    Route::get('materias/report', [MateriaController::class, 'generateReport'])->name('materias.report');
    Route::get('materias/export', [MateriaController::class, 'exportMaterias'])->name('materias.export');

    // Planes de estudio
    Route::get('planes-estudio', [PlanEstudioController::class, 'index'])->name('planes-estudio.index');
    Route::get('planes-estudio/create', [PlanEstudioController::class, 'create'])->name('planes-estudio.create');
    Route::post('planes-estudio', [PlanEstudioController::class, 'store'])->name('planes-estudio.store');
    Route::get('planes-estudio/{plan}', [PlanEstudioController::class, 'show'])->name('planes-estudio.show');
    Route::get('planes-estudio/{plan}/edit', [PlanEstudioController::class, 'edit'])->name('planes-estudio.edit');
    Route::put('planes-estudio/{plan}', [PlanEstudioController::class, 'update'])->name('planes-estudio.update');
    Route::delete('planes-estudio/{plan}', [PlanEstudioController::class, 'destroy'])->name('planes-estudio.destroy');

    // Tipos de archivo
    Route::get('tipo-archivos', [TipoArchivoController::class, 'index'])->name('tipo-archivos.index');
    Route::get('tipo-archivos/report', [TipoArchivoController::class, 'generateReport'])->name('tipo-archivos.report');
    Route::get('tipo-archivos/create', [TipoArchivoController::class, 'create'])->name('tipo-archivos.create');
    Route::post('tipo-archivos', [TipoArchivoController::class, 'store'])->name('tipo-archivos.store');
    Route::get('tipo-archivos/{tipoArchivo}', [TipoArchivoController::class, 'show'])->name('tipo-archivos.show');
    Route::get('tipo-archivos/edit/{tipoArchivo}', [TipoArchivoController::class, 'edit'])->name('tipo-archivos.edit');
    Route::put('tipo-archivos/{tipoArchivo}', [TipoArchivoController::class, 'update'])->name('tipo-archivos.update');
    Route::delete('tipo-archivos/{tipoArchivo}', [TipoArchivoController::class, 'destroy'])->name('tipo-archivos.destroy');

    // Estado archivos
    Route::get('estado-archivos', [EstadoArchivoController::class, 'index'])->name('estado-archivos.index')->can('view_estadoarchivo');
    Route::get('estado-archivos/create', [EstadoArchivoController::class, 'create'])->name('estado-archivos.create')->can('view_estadoarchivo');
    Route::post('estado-archivos', [EstadoArchivoController::class, 'store'])->name('estado-archivos.store')->can('view_estadoarchivo');
    Route::get('estado-archivos/{estadoArchivo}', [EstadoArchivoController::class, 'show'])->name('estado-archivos.show')->can('view_estadoarchivo');
    Route::get('estado-archivos/edit/{estadoArchivo}', [EstadoArchivoController::class, 'edit'])->name('estado-archivos.edit')->can('view_estadoarchivo');
    Route::put('estado-archivos/{estadoArchivo}', [EstadoArchivoController::class, 'update'])->name('estado-archivos.update')->can('view_estadoarchivo');
    Route::delete('estado-archivos/{estadoArchivo}', [EstadoArchivoController::class, 'destroy'])->name('estado-archivos.destroy')->can('view_estadoarchivo');

    // Archivos
    Route::get('archivos', [ArchivoController::class, 'index'])->name('archivos.index');
    Route::get('archivos/create', [ArchivoController::class, 'create'])->name('archivos.create');
    Route::post('archivos', [ArchivoController::class, 'store'])->name('archivos.store');
    Route::get('archivos/report', [ArchivoController::class, 'generateReport'])->name('archivos.report')->can('view_pdf');
    Route::get('archivos/export', [ArchivoController::class, 'export'])->name('archivos.export')->can('view_excel');
    Route::get('archivos/{archivo}/report', [ArchivoController::class, 'generateDetailReport'])->name('archivos.detail-report')->can('view_pdf');
    Route::get('archivos/{archivo}', [ArchivoController::class, 'show'])->name('archivos.show');
    Route::get('archivos/edit/{archivo}', [ArchivoController::class, 'edit'])->name('archivos.edit')->can('update', 'archivo');
    Route::put('archivos/{archivo}', [ArchivoController::class, 'update'])->name('archivos.update')->can('update', 'archivo');
    Route::delete('archivos/{archivo}', [ArchivoController::class, 'destroy'])->name('archivos.destroy')->can('delete', 'archivo');

    // Historial revisiones
    Route::get('historial-revisiones', [HistorialRevisionController::class, 'index'])->name('historial-revisiones.index');
    Route::get('historial-revisiones/create', [HistorialRevisionController::class, 'create'])->name('historial-revisiones.create');
    Route::post('historial-revisiones', [HistorialRevisionController::class, 'store'])->name('historial-revisiones.store');
    Route::get('historial-revisiones/edit/{historialRevision}', [HistorialRevisionController::class, 'edit'])->name('historial-revisiones.edit');
    Route::put('historial-revisiones/{historialRevision}', [HistorialRevisionController::class, 'update'])->name('historial-revisiones.update');
    Route::delete('historial-revisiones/{historialRevision}', [HistorialRevisionController::class, 'destroy'])->name('historial-revisiones.destroy');

    // Reportes de contenido
    Route::get('reportes', [ReporteContenidoController::class, 'index'])->name('reportes.index');
    Route::get('reportes/create', [ReporteContenidoController::class, 'create'])->name('reportes.create');
    Route::post('reportes', [ReporteContenidoController::class, 'store'])->name('reportes.store');
    Route::get('reportes/edit/{reporte}', [ReporteContenidoController::class, 'edit'])->name('reportes.edit');
    Route::put('reportes/{reporte}', [ReporteContenidoController::class, 'update'])->name('reportes.update');
    Route::delete('reportes/{reporte}', [ReporteContenidoController::class, 'destroy'])->name('reportes.destroy');

    // Comentarios
    Route::get('comentarios', [ComentarioController::class, 'index'])->name('comentarios.index');
    Route::get('comentarios/create', [ComentarioController::class, 'create'])->name('comentarios.create');
    Route::post('comentarios', [ComentarioController::class, 'store'])->name('comentarios.store');
    Route::get('comentarios/edit/{comentario}', [ComentarioController::class, 'edit'])->name('comentarios.edit');
    Route::put('comentarios/{comentario}', [ComentarioController::class, 'update'])->name('comentarios.update');
    Route::delete('comentarios/{comentario}', [ComentarioController::class, 'destroy'])->name('comentarios.destroy');

    // Valoraciones
    Route::get('valoraciones', [ValoracionController::class, 'index'])->name('valoraciones.index');
    Route::get('valoraciones/create', [ValoracionController::class, 'create'])->name('valoraciones.create');
    Route::post('valoraciones', [ValoracionController::class, 'store'])->name('valoraciones.store');
    Route::get('valoraciones/edit/{valoracion}', [ValoracionController::class, 'edit'])->name('valoraciones.edit');
    Route::put('valoraciones/{valoracion}', [ValoracionController::class, 'update'])->name('valoraciones.update');
    Route::delete('valoraciones/{valoracion}', [ValoracionController::class, 'destroy'])->name('valoraciones.destroy');

    // Notificaciones
    Route::get('notificaciones', [NotificacionController::class, 'index'])->name('notificaciones.index');
    Route::get('notificaciones/create', [NotificacionController::class, 'create'])->name('notificaciones.create');
    Route::post('notificaciones', [NotificacionController::class, 'store'])->name('notificaciones.store');
    Route::get('notificaciones/edit/{notificacion}', [NotificacionController::class, 'edit'])->name('notificaciones.edit');
    Route::put('notificaciones/{notificacion}', [NotificacionController::class, 'update'])->name('notificaciones.update');
    Route::delete('notificaciones/{notificacion}', [NotificacionController::class, 'destroy'])->name('notificaciones.destroy');

    // Auditorías
    Route::get('auditorias', [AuditoriaController::class, 'index'])->name('auditorias.index');
    Route::get('auditorias/create', [AuditoriaController::class, 'create'])->name('auditorias.create');
    Route::post('auditorias', [AuditoriaController::class, 'store'])->name('auditorias.store');
    Route::get('auditorias/edit/{auditoria}', [AuditoriaController::class, 'edit'])->name('auditorias.edit');
    Route::put('auditorias/{auditoria}', [AuditoriaController::class, 'update'])->name('auditorias.update');
    Route::delete('auditorias/{auditoria}', [AuditoriaController::class, 'destroy'])->name('auditorias.destroy');

    // Perfiles de usuario
    Route::get('perfiles', [UserProfileController::class, 'index'])->name('perfiles.index');
    Route::get('perfiles/create', [UserProfileController::class, 'create'])->name('perfiles.create');
    Route::post('perfiles', [UserProfileController::class, 'store'])->name('perfiles.store');
    Route::get('perfiles/edit/{perfile}', [UserProfileController::class, 'edit'])->name('perfiles.edit');
    Route::put('perfiles/{perfile}', [UserProfileController::class, 'update'])->name('perfiles.update');
    Route::delete('perfiles/{perfile}', [UserProfileController::class, 'destroy'])->name('perfiles.destroy');
    Route::get('perfiles/report', [UserProfileController::class, 'generateReport'])->name('perfiles.report');

    // Roles y permisos
    Route::get('permissions', [PermissionController::class, 'index'])->name('permissions.index')->can('view_permisos');
    Route::get('permissions/create', [PermissionController::class, 'create'])->name('permissions.create')->can('view_permisos');
    Route::post('permissions', [PermissionController::class, 'store'])->name('permissions.store')->can('view_permisos');
    Route::get('permissions/{permiso}/edit', [PermissionController::class, 'edit'])->name('permissions.edit')->can('view_permisos');
    Route::put('permissions/{permiso}', [PermissionController::class, 'update'])->name('permissions.update')->can('view_permisos');
    Route::delete('permissions/{permiso}', [PermissionController::class, 'destroy'])->name('permissions.destroy')->can('view_permisos');

    Route::get('roles', [RoleController::class, 'index'])->name('roles.index')->can('view_roles');
    Route::get('roles/create', [RoleController::class, 'create'])->name('roles.create')->can('view_roles');
    Route::post('roles', [RoleController::class, 'store'])->name('roles.store')->can('view_roles');
    Route::get('roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit')->can('view_roles');
    Route::put('roles/{role}', [RoleController::class, 'update'])->name('roles.update')->can('view_roles');
    Route::delete('roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy')->can('view_roles');

    // Usuarios (administración)
    Route::get('users', [UserController::class, 'index'])->name('users.index')->can('view_usuarios');
    Route::get('users/create', [UserController::class, 'create'])->name('users.create')->can('view_usuarios');
    Route::post('users', [UserController::class, 'store'])->name('users.store')->can('view_usuarios');
    Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit')->can('view_usuarios');
    Route::put('users/{user}', [UserController::class, 'update'])->name('users.update')->can('view_usuarios');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy')->can('view_usuarios');
});

require __DIR__.'/settings.php';
