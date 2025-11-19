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


