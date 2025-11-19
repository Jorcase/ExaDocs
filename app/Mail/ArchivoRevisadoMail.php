<?php

namespace App\Mail;

use App\Models\Archivo;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ArchivoRevisadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Archivo $archivo, public string $estadoNuevo)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('no-reply@exadocs.com', 'ExaDocs'),
            subject: 'Actualización de estado: ' . ($this->archivo->titulo ?? 'Archivo'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.archivo_revisado',
            with: [
                'archivo' => $this->archivo,
                'estadoNuevo' => $this->estadoNuevo,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
