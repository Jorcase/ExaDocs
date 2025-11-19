<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Carreras</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f5f5f5; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
    th { background: #1f2937; color: #fff; font-weight: 600; }
    h1 { margin: 0; font-size: 22px; }
  </style>
</head>
<body>
  <h1>Carreras registradas</h1>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Nombre</th>
        <th>Código</th>
        <th>Tipo</th>
        <th>Descripción</th>
      </tr>
    </thead>
    <tbody>
      @foreach($carreras as $carrera)
        <tr>
          <td>{{ $carrera->id }}</td>
          <td>{{ $carrera->nombre }}</td>
          <td>{{ $carrera->codigo }}</td>
          <td>{{ $carrera->tipoCarrera->nombre ?? '—' }}</td>
          <td>{{ $carrera->descripcion ?? '—' }}</td>
        </tr>
      @endforeach
    </tbody>
  </table>
</body>
</html>
