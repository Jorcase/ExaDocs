<?php

namespace App\Mail;

use App\Models\Valoracion;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ValoracionNuevaMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Valoracion $valoracion)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('no-reply@exadocs.com', 'ExaDocs'),
            subject: 'Nueva valoración en tu archivo',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.valoracion_nueva',
            with: ['valoracion' => $this->valoracion],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
