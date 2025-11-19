<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo archivo en ExaDocs</title>
    <style>
        :root {
            color-scheme: light;
        }
        body {
            font-family: Arial, sans-serif;
            background: #f6f7fb;
            margin: 0;
            padding: 20px;
            color: #1f2937;
        }
        .card {
            max-width: 620px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 8px 30px rgba(0,0,0,0.06);
            overflow: hidden;
        }
        .header {
            padding: 20px 24px;
            background: linear-gradient(135deg, #111827, #1f2937);
            color: #f9fafb;
        }
        .header h1 {
            margin: 0;
            font-size: 20px;
            letter-spacing: 0.2px;
        }
        .content {
            padding: 24px;
            line-height: 1.6;
        }
        .badge {
            display: inline-block;
            padding: 6px 10px;
            border-radius: 999px;
            background: #e5e7eb;
            color: #111827;
            font-size: 12px;
            margin-right: 8px;
            margin-bottom: 6px;
        }
        .button {
            display: inline-block;
            padding: 12px 18px;
            margin-top: 18px;
            border-radius: 10px;
            background: #111827;
            color: #f9fafb !important;
            text-decoration: none;
            font-weight: 600;
            letter-spacing: 0.3px;
        }
        .footer {
            padding: 16px 24px 24px;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <h1>Nuevo archivo en ExaDocs</h1>
        </div>
        <div class="content">
            <p>Hola {{ $archivo->autor->name ?? 'usuario' }},</p>
            <p>Se registró correctamente el archivo <strong>{{ $archivo->titulo }}</strong>.</p>

            <div>
                <span class="badge">{{ $archivo->materia->nombre ?? 'Materia no asignada' }}</span>
                <span class="badge">{{ $archivo->tipo->nombre ?? 'Tipo no asignado' }}</span>
                <span class="badge">{{ $archivo->estado->nombre ?? 'Estado no asignado' }}</span>
            </div>

            @if($archivo->descripcion)
                <p style="margin-top:12px;">Descripción:</p>
                <p style="margin: 6px 0 14px 0; color:#374151;">{{ $archivo->descripcion }}</p>
            @endif

            <p style="margin-top: 12px; color:#4b5563;">
                Plan: {{ $archivo->planEstudio->nombre ?? 'No asignado' }}<br>
                Publicado: {{ $archivo->publicado_en ?? '—' }}
            </p>

            @php
                $url = config('app.url') ? rtrim(config('app.url'), '/') . '/archivos/' . $archivo->id : '#';
            @endphp
            <a class="button" href="{{ $url }}" target="_blank" rel="noopener">Ver archivo</a>
        </div>
        <div class="footer">
            <p>Este correo es informativo. No respondas a este mensaje.</p>
            <p>{{ config('app.name') }}</p>
        </div>
    </div>
</body>
</html>
