<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\CarouselController;
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
use App\Http\Controllers\EstadisticasController;

Route::get('/', [CarouselController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('mis-cosas', [ArchivoController::class, 'myStuff'])->name('mis-cosas')->middleware('auth');

    // Carrusel (moderación/catalogos)
    Route::get('carousel', [CarouselController::class, 'adminList'])->name('carousel.index')->can('view_catalogos');
    Route::get('carousel/create', [CarouselController::class, 'create'])->name('carousel.create')->can('view_catalogos');
    Route::post('carousel', [CarouselController::class, 'store'])->name('carousel.store')->can('view_catalogos');
    Route::get('carousel/edit/{carousel}', [CarouselController::class, 'edit'])->name('carousel.edit')->can('view_catalogos');
    Route::put('carousel/{carousel}', [CarouselController::class, 'update'])->name('carousel.update')->can('view_catalogos');
    Route::delete('carousel/{carousel}', [CarouselController::class, 'destroy'])->name('carousel.destroy')->can('view_catalogos');

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
    Route::get('materia', [MateriaController::class, 'index'])->name('materias.index')->can('view_catalogos');
    Route::get('materias/create', [MateriaController::class, 'create'])->name('materias.create')->can('view_catalogos');
    Route::post('materias', [MateriaController::class, 'store'])->name('materias.store')->can('view_catalogos');
    Route::get('materias/edit/{materia}', [MateriaController::class, 'edit'])->name('materias.edit')->can('view_catalogos');
    Route::put('materias/{materia}', [MateriaController::class, 'update'])->name('materias.update')->can('view_catalogos');
    Route::delete('materias/{materia}', [MateriaController::class, 'destroy'])->name('materias.destroy')->can('view_catalogos');
    Route::get('materias/report', [MateriaController::class, 'generateReport'])->name('materias.report')->can('view_catalogos');
    Route::get('materias/export', [MateriaController::class, 'exportMaterias'])->name('materias.export')->can('view_catalogos');

    // Planes de estudio
    Route::get('planes-estudio', [PlanEstudioController::class, 'index'])->name('planes-estudio.index')->can('view_catalogos');
    Route::get('planes-estudio/create', [PlanEstudioController::class, 'create'])->name('planes-estudio.create')->can('view_catalogos');
    Route::post('planes-estudio', [PlanEstudioController::class, 'store'])->name('planes-estudio.store')->can('view_catalogos');
    Route::get('planes-estudio/{plan}', [PlanEstudioController::class, 'show'])->name('planes-estudio.show')->can('view_catalogos');
    Route::get('planes-estudio/{plan}/edit', [PlanEstudioController::class, 'edit'])->name('planes-estudio.edit')->can('view_catalogos');
    Route::put('planes-estudio/{plan}', [PlanEstudioController::class, 'update'])->name('planes-estudio.update')->can('view_catalogos');
    Route::delete('planes-estudio/{plan}', [PlanEstudioController::class, 'destroy'])->name('planes-estudio.destroy')->can('view_catalogos');

    // Estadísticas
    Route::get('estadisticas', [EstadisticasController::class, 'index'])
        ->name('estadisticas.index')
        ->can('view_estadisticas');

    // Tipos de archivo
    Route::get('tipo-archivos', [TipoArchivoController::class, 'index'])->name('tipo-archivos.index')->can('view_catalogos');
    Route::get('tipo-archivos/report', [TipoArchivoController::class, 'generateReport'])->name('tipo-archivos.report')->can('view_catalogos');
    Route::get('tipo-archivos/create', [TipoArchivoController::class, 'create'])->name('tipo-archivos.create')->can('view_catalogos');
    Route::post('tipo-archivos', [TipoArchivoController::class, 'store'])->name('tipo-archivos.store')->can('view_catalogos');
    Route::get('tipo-archivos/{tipoArchivo}', [TipoArchivoController::class, 'show'])->name('tipo-archivos.show')->can('view_catalogos');
    Route::get('tipo-archivos/edit/{tipoArchivo}', [TipoArchivoController::class, 'edit'])->name('tipo-archivos.edit')->can('view_catalogos');
    Route::put('tipo-archivos/{tipoArchivo}', [TipoArchivoController::class, 'update'])->name('tipo-archivos.update')->can('view_catalogos');
    Route::delete('tipo-archivos/{tipoArchivo}', [TipoArchivoController::class, 'destroy'])->name('tipo-archivos.destroy')->can('view_catalogos');

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
    Route::get('archivos/create', [ArchivoController::class, 'create'])->name('archivos.create')->can('create_archivo');
    Route::post('archivos', [ArchivoController::class, 'store'])->name('archivos.store');
    Route::get('archivos/report', [ArchivoController::class, 'generateReport'])->name('archivos.report')->can('view_pdf');
    Route::get('archivos/export', [ArchivoController::class, 'export'])->name('archivos.export')->can('view_excel');
    Route::get('archivos/{archivo}/report', [ArchivoController::class, 'generateDetailReport'])->name('archivos.detail-report')->can('view_pdf');
    Route::get('archivos/{archivo}', [ArchivoController::class, 'show'])->name('archivos.show');
    Route::get('archivos/edit/{archivo}', [ArchivoController::class, 'edit'])->name('archivos.edit')->can('update', 'archivo');
    Route::put('archivos/{archivo}', [ArchivoController::class, 'update'])->name('archivos.update')->can('update', 'archivo');
    Route::delete('archivos/{archivo}', [ArchivoController::class, 'destroy'])->name('archivos.destroy')->can('delete', 'archivo');
    Route::post('archivos/{archivo}/guardar', [ArchivoController::class, 'save'])->name('archivos.save')->middleware('auth');
    Route::delete('archivos/{archivo}/guardar', [ArchivoController::class, 'unsave'])->name('archivos.unsave')->middleware('auth');

    // Historial revisiones
    Route::get('historial-revisiones', [HistorialRevisionController::class, 'index'])->name('historial-revisiones.index')->can('view_moderacion');
    Route::get('historial-revisiones/create', [HistorialRevisionController::class, 'create'])->name('historial-revisiones.create')->can('view_moderacion');
    Route::post('historial-revisiones', [HistorialRevisionController::class, 'store'])->name('historial-revisiones.store')->can('view_moderacion');
    Route::get('historial-revisiones/edit/{historialRevision}', [HistorialRevisionController::class, 'edit'])->name('historial-revisiones.edit')->can('view_moderacion');
    Route::put('historial-revisiones/{historialRevision}', [HistorialRevisionController::class, 'update'])->name('historial-revisiones.update')->can('view_moderacion');
    Route::delete('historial-revisiones/{historialRevision}', [HistorialRevisionController::class, 'destroy'])->name('historial-revisiones.destroy')->can('view_moderacion');

    // Reportes de contenido
    Route::get('reportes', [ReporteContenidoController::class, 'index'])->name('reportes.index')->can('view_moderacion');
    Route::get('reportes/create', [ReporteContenidoController::class, 'create'])->name('reportes.create')->can('view_moderacion');
    Route::post('reportes', [ReporteContenidoController::class, 'store'])->name('reportes.store')->can('view_moderacion');
    Route::get('reportes/edit/{reporte}', [ReporteContenidoController::class, 'edit'])->name('reportes.edit')->can('view_moderacion');
    Route::put('reportes/{reporte}', [ReporteContenidoController::class, 'update'])->name('reportes.update')->can('view_moderacion');
    Route::delete('reportes/{reporte}', [ReporteContenidoController::class, 'destroy'])->name('reportes.destroy')->can('view_moderacion');

    // Comentarios
    Route::get('comentarios', [ComentarioController::class, 'index'])->name('comentarios.index')->can('view_moderacion');
    Route::get('comentarios/create', [ComentarioController::class, 'create'])->name('comentarios.create')->can('view_moderacion');
    Route::post('comentarios', [ComentarioController::class, 'store'])->name('comentarios.store');
    Route::get('comentarios/edit/{comentario}', [ComentarioController::class, 'edit'])->name('comentarios.edit')->can('view_moderacion');
    Route::put('comentarios/{comentario}', [ComentarioController::class, 'update'])->name('comentarios.update');
    Route::delete('comentarios/{comentario}', [ComentarioController::class, 'destroy'])->name('comentarios.destroy');

    // Valoraciones
    Route::get('valoraciones', [ValoracionController::class, 'index'])->name('valoraciones.index')->can('view_moderacion');
    Route::get('valoraciones/create', [ValoracionController::class, 'create'])->name('valoraciones.create')->can('view_moderacion');
    Route::post('valoraciones', [ValoracionController::class, 'store'])->name('valoraciones.store');
    Route::get('valoraciones/edit/{valoracion}', [ValoracionController::class, 'edit'])->name('valoraciones.edit')->can('view_moderacion');
    Route::put('valoraciones/{valoracion}', [ValoracionController::class, 'update'])->name('valoraciones.update');
    Route::delete('valoraciones/{valoracion}', [ValoracionController::class, 'destroy'])->name('valoraciones.destroy');

    // Notificaciones (usuario)
    Route::middleware('can:view_notifipersonal')->group(function () {
        Route::get('notificaciones', [NotificacionController::class, 'userIndex'])->name('notificaciones.index');
        Route::post('notificaciones/{notificacion}/read', [NotificacionController::class, 'markRead'])->name('notificaciones.read');
        Route::post('notificaciones/{notificacion}/unread', [NotificacionController::class, 'markUnread'])->name('notificaciones.unread');
        Route::post('notificaciones/read-all', [NotificacionController::class, 'markAllRead'])->name('notificaciones.readAll');
    });

    // Notificaciones (moderación)
    Route::prefix('admin/notificaciones')->name('admin.notificaciones.')->middleware('can:view_notificaciones')->group(function () {
        Route::get('/', [NotificacionController::class, 'adminIndex'])->name('index');
        Route::get('create', [NotificacionController::class, 'create'])->name('create');
        Route::post('/', [NotificacionController::class, 'store'])->name('store');
        Route::get('{notificacion}/edit', [NotificacionController::class, 'edit'])->name('edit');
        Route::put('{notificacion}', [NotificacionController::class, 'update'])->name('update');
        Route::delete('{notificacion}', [NotificacionController::class, 'destroy'])->name('destroy');
    });

    // Auditorías
    Route::get('auditorias', [AuditoriaController::class, 'index'])->name('auditorias.index');
    Route::get('auditorias/create', [AuditoriaController::class, 'create'])->name('auditorias.create');
    Route::post('auditorias', [AuditoriaController::class, 'store'])->name('auditorias.store');
    Route::get('auditorias/edit/{auditoria}', [AuditoriaController::class, 'edit'])->name('auditorias.edit');
    Route::put('auditorias/{auditoria}', [AuditoriaController::class, 'update'])->name('auditorias.update');
    Route::delete('auditorias/{auditoria}', [AuditoriaController::class, 'destroy'])->name('auditorias.destroy');

    // Perfiles de usuario
    Route::get('perfiles', [UserProfileController::class, 'index'])->name('perfiles.index')->can('view_perfiles');
    Route::get('perfiles/create', [UserProfileController::class, 'create'])->name('perfiles.create')->can('view_perfiles');
    Route::post('perfiles', [UserProfileController::class, 'store'])->name('perfiles.store')->can('view_perfiles');
    Route::get('perfiles/report', [UserProfileController::class, 'generateReport'])->name('perfiles.report')->can('view_perfiles');
    Route::get('perfiles/edit/{perfile}', [UserProfileController::class, 'edit'])->name('perfiles.edit')->can('update', 'perfile');
    Route::get('perfiles/{perfile}', [UserProfileController::class, 'show'])->name('perfiles.show')->can('view_perfiles');
    Route::put('perfiles/{perfile}', [UserProfileController::class, 'update'])->name('perfiles.update')->can('update', 'perfile');
    Route::delete('perfiles/{perfile}', [UserProfileController::class, 'destroy'])->name('perfiles.destroy')->can('delete', 'perfile');
    Route::get('perfil', [UserProfileController::class, 'showProfile'])->name('perfil.show');
    Route::get('perfil/edit', [UserProfileController::class, 'editProfile'])->name('perfil.edit');
    Route::get('perfil/{perfile}', [UserProfileController::class, 'showPublic'])->name('perfil.public');
    Route::put('perfil', [UserProfileController::class, 'updateProfile'])->name('perfil.update');
    

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
