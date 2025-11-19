<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Detalle del archivo</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f5f5f5; }
    .card { background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 24px; max-width: 620px; margin: 0 auto; }
    h1 { margin-top: 0; font-size: 22px; }
    dl { margin: 0; }
    dt { font-weight: 600; color: #111827; }
    dd { margin: 4px 0 12px; color: #374151; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Nombre: {{ $archivo->titulo }}</h1>
    <dl>
      <dt>Autor</dt><dd>{{ $archivo->autor->name ?? '—' }}</dd>
      <dt>Materia</dt><dd>{{ $archivo->materia->nombre ?? '—' }}</dd>
      <dt>Tipo</dt><dd>{{ $archivo->tipo->nombre ?? '—' }}</dd>
      <dt>Estado</dt><dd>{{ $archivo->estado->nombre ?? '—' }}</dd>
      <dt>Plan</dt><dd>{{ $archivo->planEstudio->nombre ?? '—' }}</dd>
      <dt>Ruta</dt><dd>{{ $archivo->file_path }}</dd>
      <dt>Publicado</dt><dd>{{ $archivo->publicado_en ?? '—' }}</dd>
    </dl>
    <p style="margin-top:15px;">Descripción:</p>
    <p style="color:#374151;">{{ $archivo->descripcion ?? '—' }}</p>
  </div>
</body>
</html>
