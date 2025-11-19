<?php

namespace App\Mail;

use App\Models\Comentario;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ComentarioNuevoMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Comentario $comentario)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('no-reply@exadocs.com', 'ExaDocs'),
            subject: 'Nuevo comentario en tu archivo',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.comentario_nuevo',
            with: ['comentario' => $this->comentario],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
