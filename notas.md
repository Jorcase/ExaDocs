# Avances ExaDocs

## CRUDs implementados
- **Carreras:** Migración con `tipo_carrera_id`, controller/resource, requests y vistas Inertia (index/create/edit) con selección de tipo.
- **Materias:** Validaciones y vistas completas para administrar materias y vincularlas a carreras/planes.
- **Planes de estudio:** Migración sin campo `versión`, controller/resource, requests y UI ajustadas (nombre, año, estado, fechas).
- **Tipos de carrera:** Modelo, migrations, requests, controller y vistas para administrar los catálogos; sidebar actualizado.

## Catálogos y tablas de soporte
- `tipo_carreras`, `tipos_archivos`, `estados_archivo` simplificados para CRUD desde la UI (nombre + descripción).
- `Carrera` ahora tiene FK a `tipo_carreras`; formularios consumen esa relación para filtros futuros.

## Configuración frontend
- Ziggy configurado (`@routes`, `resources/js/ziggy.ts`) para usar `route()` en React.
- AppSidebar con accesos a Carrera, Materia, Plan Estudio y Tipo Carrera.
- Componentes Inertia para cada recurso (tables, forms, paginación reutilizable).

## Layout genérico de listados
- Se creó el componente `resources/js/components/list-section.tsx` para estandarizar el encabezado de cada listado (título, descripción y acciones).
- Se aplicó a Tipo Carrera y Estado Archivo (sin DataTable porque son pocos registros) y se usa también en listados grandes junto al DataTable.

## DataTable y filtros
- Se reutiliza `resources/js/components/data-table.tsx` para listados con ordenamiento, búsqueda y selector de columnas.
- Se armó un flujo completo (ej. Planes de estudio): controller recibe `sort/direction` y filtros, responde data paginada; en el front se pasa `externalSort` y `onSortChange` para ordenamiento server-side; los filtros viven en un Sheet lateral con botón “Filtros” y “Limpiar” sobre la tabla.
- Para catálogos pequeños (Tipo Carrera / Estado Archivo) se mantiene tabla simple, solo encabezado con ListSection.

## Archivos: carga incremental
- Backend sigue devolviendo paginación (`current_page`, `next_page_url`) con 9 ítems por página.
- Front (`resources/js/pages/archivos/index.tsx`) dejó de usar paginador y ahora acumula resultados en un estado `items`; botón “Cargar más” trae la siguiente página y concatena sin perder las anteriores.
- Al cambiar filtros/orden, se resetean los items con la primera página; si no hay `next_page_url` se oculta el botón.

## Correos habilitar/deshabilitar
- Se agregó bandera `config('mail.notifications_enabled')` (env: `MAIL_NOTIFICATIONS_ENABLED`, default `false`).
- Todos los mails (Archivo creado, Revisión, Comentario, Valoración, Reporte) se envían solo si la bandera está en `true`.
- Para volver a habilitar: setear `MAIL_NOTIFICATIONS_ENABLED=true` en `.env` y ejecutar `php artisan config:clear`.

## Notificaciones in-app
- Tabla extendida: `notificaciones` ahora tiene `actor_id`, `archivo_id`, `titulo`, `mensaje`, `data` (JSON opcional) y `leido_en` (nueva migración de alter aplicada).
- Modelo `Notificacion` actualizado: relaciones con `actor` y `archivo`, `data` casteado a array.
- Servicio `App\Services\NotificacionService`: helper para crear notificaciones y para autor de archivo.
- Eventos que generan notificación (además de correos si `MAIL_NOTIFICATIONS_ENABLED=true`):
  - Al aprobar/rechazar un archivo (HistorialRevisionController).
  - Al crear un comentario (ComentarioController).
  - Al crear una valoración (ValoracionController).
  - Al crear un reporte (ReporteContenidoController).
- Pendiente: UI de campanita/dropdown y pantalla de “Notificaciones” para ver y marcar como leídas.

# pendiente
formatos de archivos para subir
notificaciones

libreria swiper para carruseles
