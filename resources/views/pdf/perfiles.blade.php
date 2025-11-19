<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Perfiles de usuarios</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f5f5f5; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
    th { background: #1f2937; color: #fff; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Perfiles</h1>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Usuario</th>
        <th>Email</th>
        <th>Carrera principal</th>
        <th>Documento</th>
        <th>Teléfono</th>
      </tr>
    </thead>
    <tbody>
      @foreach($perfiles as $perfil)
        <tr>
          <td>{{ $perfil->id }}</td>
          <td>{{ $perfil->user->name ?? '—' }}</td>
          <td>{{ $perfil->user->email ?? '—' }}</td>
          <td>{{ $perfil->carrera->nombre ?? '—' }}</td>
          <td>{{ $perfil->documento ?? '—' }}</td>
          <td>{{ $perfil->telefono ?? '—' }}</td>
        </tr>
      @endforeach
    </tbody>
  </table>
</body>
</html>
