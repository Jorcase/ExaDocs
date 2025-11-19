<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Archivos</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f5f5f5; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
    th { background: #1f2937; color: #fff; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Archivos</h1>
  <table>
    <thead>
      <tr>
        <th>ID</th>
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
          <td>{{ $archivo->id }}</td>
          <td>{{ $archivo->titulo }}</td>
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
