<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo reporte</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f6f7fb; margin: 0; padding: 20px; color: #1f2937; }
        .card { max-width: 620px; margin: 0 auto; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 8px 30px rgba(0,0,0,0.06); overflow: hidden; }
        .header { padding: 20px 24px; background: linear-gradient(135deg, #111827, #1f2937); color: #f9fafb; }
        .header h1 { margin: 0; font-size: 20px; letter-spacing: 0.2px; }
        .content { padding: 24px; line-height: 1.6; }
        .footer { padding: 16px 24px 24px; font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <h1>Nuevo reporte sobre tu archivo</h1>
        </div>
        <div class="content">
            <p>Hola {{ $reporte->archivo->autor->name ?? 'usuario' }},</p>
            <p>Se registró un reporte sobre tu archivo <strong>{{ $reporte->archivo->titulo ?? 'Archivo' }}</strong>.</p>
            <p>Motivo: <strong>{{ $reporte->motivo }}</strong></p>
            @if($reporte->detalle)
                <p style="margin: 12px 0; color:#374151; white-space: pre-wrap;">"{{ $reporte->detalle }}"</p>
            @endif
            @php $url = config('app.url') ? rtrim(config('app.url'), '/') . '/archivos/' . ($reporte->archivo->id ?? '') : '#'; @endphp
            <p style="margin-top: 16px;"><a href="{{ $url }}" style="background:#111827;color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none;">Ver archivo</a></p>
        </div>
        <div class="footer">
            <p>Este correo es informativo. No respondas a este mensaje.</p>
            <p>{{ config('app.name') }}</p>
        </div>
    </div>
</body>
</html>
