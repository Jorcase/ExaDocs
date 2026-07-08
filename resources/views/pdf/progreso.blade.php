<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Progreso Académico - {{ $carreraNombre }}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155; margin: 0; padding: 10px; background-color: #ffffff; }
    .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px; }
    h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; line-height: 1.2; }
    .meta { font-size: 11px; color: #64748b; margin-top: 6px; }
    .student-info { font-size: 11px; margin-bottom: 15px; color: #475569; }
    .student-info table { width: 100%; border-collapse: collapse; margin-top: 5px; }
    .student-info td { padding: 4px 0; border: none; }
    .stats-container { display: table; width: 100%; margin-top: 10px; margin-bottom: 15px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; font-size: 11px; }
    .stats-col { display: table-cell; width: 33.33%; text-align: center; }
    .stats-val { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 2px; }
    .stats-label { font-size: 9px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    
    table.progreso-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
    table.progreso-table th, table.progreso-table td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    table.progreso-table th { background-color: #0f172a; color: #ffffff; font-weight: 600; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; }
    table.progreso-table tr:nth-child(even) { background-color: #f8fafc; }
    .text-semibold { font-weight: 600; color: #0f172a; }
    .text-center { text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Progreso Académico</h1>
  </div>

  <div class="student-info">
    <table>
      <tr>
        <td style="width: 12%; font-weight: 600; color: #0f172a;">Alumno:</td>
        <td style="width: 38%;">{{ $user->name }}</td>
        <td style="width: 12%; font-weight: 600; color: #0f172a;">Carrera:</td>
        <td style="width: 38%;">{{ $carreraNombre }}</td>
      </tr>
    </table>
  </div>

  <table class="progreso-table">
    <thead>
      <tr>
        <th>Actividad</th>
        <th>Tipo</th>
        <th class="text-center" style="width: 40px;">Año</th>
        <th style="width: 130px;">Período</th>
        <th style="width: 100px;">Nota</th>
        <th style="width: 100px;">Origen</th>
      </tr>
    </thead>
    <tbody>
      @foreach($materiasPlan as $m)
        <tr>
          <td class="text-semibold">{{ $m->nombre }} ({{ $m->codigo }})</td>
          <td>{{ $m->tipo_asignatura === 'optativa' ? 'Optativa' : 'Materia' }}</td>
          <td class="text-center">{{ $m->anio_sugerido }}</td>
          <td>{{ $m->cuatrimestre == 1 ? 'Primer Cuatrimestre' : ($m->cuatrimestre == 2 ? 'Segundo Cuatrimestre' : 'Anual') }}</td>
          <td>
            @if(in_array($m->estado, ['aprobada', 'promocionada']))
              {{ $m->nota }} ({{ $m->estado === 'promocionada' ? 'Promocionado' : 'Aprobado' }})
            @endif
          </td>
          <td>
            @if($m->estado === 'aprobada')
              Examen
            @elseif($m->estado === 'promocionada')
              Promoción
            @elseif($m->estado === 'regular')
              Regularidad
            @elseif($m->estado === 'cursando')
              Cursando
            @endif
          </td>
        </tr>
      @endforeach
    </tbody>
  </table>
  <div class="stats-container">
    <div class="stats-col">
      <div class="stats-label">Avance del Plan</div>
      <div class="stats-val">{{ $porcentaje }}%</div>
    </div>
    <div class="stats-col" style="border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
      <div class="stats-label">Materias Aprobadas</div>
      <div class="stats-val">{{ $aprobadasCount }} / {{ $totalMaterias }}</div>
    </div>
    <div class="stats-col">
      <div class="stats-label">Promedio General</div>
      <div class="stats-val">{{ $promedio ?: '—' }}</div>
    </div>
  </div>
</body>
</html>
