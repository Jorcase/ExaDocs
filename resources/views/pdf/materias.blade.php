<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Materias</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f5f5f5; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
    th { background: #1f2937; color: #fff; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Materias</h1>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Nombre</th>
        <th>Tipo</th>
        <th>Carreras</th>
        <th>Planes</th>
      </tr>
    </thead>
    <tbody>
      @foreach($materias as $materia)
        <tr>
          <td>{{ $materia->id }}</td>
          <td>{{ $materia->nombre }}</td>
          <td>{{ $materia->tipo }}</td>
          <td>{{ $materia->carreras->pluck('nombre')->join(', ') }}</td>
          <td>{{ $materia->planesEstudio->pluck('nombre')->join(', ') }}</td>
        </tr>
      @endforeach
    </tbody>
  </table>
</body>
</html>
