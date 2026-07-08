<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>{{ $tituloReporte }}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155; margin: 0; padding: 10px; background-color: #ffffff; }
    .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px; }
    h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; line-height: 1.2; }
    .meta { font-size: 11px; color: #64748b; margin-top: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
    th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background-color: #0f172a; color: #ffffff; font-weight: 600; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; border: none; }
    tr:nth-child(even) { background-color: #f8fafc; }
    .text-semibold { font-weight: 600; color: #0f172a; }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{ $tituloReporte }}</h1>
    <div class="meta">
      Reporte generado el {{ now()->format('d/m/Y H:i') }} | Total: {{ count($archivos) }} archivos
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Título</th>
        <th>Materia</th>
        <th>Tipo</th>
        <th>Estado</th>
        <th>Autor</th>
        <th>Plan</th>
      </tr>
    </thead>
    <tbody>
      @foreach($archivos as $archivo)
        <tr>
          <td class="text-semibold">{{ $archivo->titulo }}</td>
          <td>{{ $archivo->materia->nombre ?? '—' }}</td>
          <td>{{ $archivo->tipo->nombre ?? '—' }}</td>
          <td>{{ $archivo->estado->nombre ?? '—' }}</td>
          <td>{{ $archivo->autor->name ?? '—' }}</td>
          <td>{{ $archivo->planEstudio->nombre ?? '—' }}</td>
        </tr>
      @endforeach
    </tbody>
  </table>
</body>
</html>
